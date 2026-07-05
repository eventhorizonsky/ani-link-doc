# API 缓存机制

本文档说明 AniLinkService 对弹弹（Dandan）API 请求的缓存层设计，包括存储模型、缓存策略、缓存管理接口与自动清理机制。

## 概述

为了减少对弹弹 API 的重复请求、降低上游压力并提升响应速度，AniLinkService 对部分弹弹 API 的响应结果进行了**数据库级缓存**。

与传统的 Redis 缓存不同，本项目直接将缓存数据存储在 MySQL/H2 的 `api_cache` 表中，无需额外中间件。

### 缓存的接口

| 接口 | 缓存 Key 前缀 | 有效期 |
|------|--------------|--------|
| `/api/v2/comment/{episodeId}` | `dandan:comment:` | 30 分钟 |
| `/api/v2/bangumi/{animeId}` | `dandan:bangumi:` | 30 分钟 |
| `/api/v2/bangumi/shin` | `dandan:bangumi:shin` | 30 分钟 |

::: warning 注意
`/api/v2/match` 和 `/api/v2/match/batch` 匹配接口**不使用缓存**，每次请求直接调用上游 API。
:::

## 数据模型

缓存数据存储在 `api_cache` 表中：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGINT | 主键，自增 |
| `cache_key` | VARCHAR(255) | 缓存键，唯一索引 |
| `cache_value` | TEXT | 缓存值（原始 JSON） |
| `expire_time` | DATETIME | 过期时间 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

索引：
- `idx_api_cache_expire_time` — 加速过期缓存清理查询

对应实体类：[ApiCache.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/model/entity/ApiCache.java)

## 缓存 Key 设计

缓存 Key 采用 `dandan:<资源类型>:<标识>` 的命名规范：

```
dandan:comment:123              # 弹幕评论（不含关联弹幕）
dandan:comment:123:related      # 弹幕评论（含第三方关联弹幕）
dandan:bangumi:456              # 动漫详情
dandan:bangumi:shin             # 新番时间表
```

Key 构造逻辑示例（[DanmakuService.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/service/DanmakuService.java)）：

```java
private String buildCommentCacheKey(Long episodeId, Boolean withRelated) {
    String key = "dandan:comment:" + episodeId;
    if (Boolean.TRUE.equals(withRelated)) {
        key += ":related";
    }
    return key;
}
```

## 缓存策略：Stale-While-Revalidate

本项目采用 **Stale-While-Revalidate（过期可用 + 后台刷新）** 策略，请求处理流程如下：

```
请求进入
  │
  ├─ ① 查询有效缓存（expire_time > now）
  │    └─ 命中 → 直接返回（最快路径）
  │
  ├─ ② 查询过期缓存（不限 expire_time）
  │    └─ 命中 → 返回过期数据 + 触发异步刷新
  │         （刷新有防重入锁，同一 Key 只允许一个刷新任务）
  │
  └─ ③ 首次请求（无任何缓存）
       └─ 同步调用上游 API → 写入缓存 → 返回
```

### 为什么用这个策略？

- **数据不是强实时性的**：弹幕和动漫信息的变更频率低，30 分钟内完全可用旧数据
- **保护上游服务**：当弹弹 API 短暂不可用时，过期缓存可作为降级数据兜底
- **用户体验**：即使缓存过期也能立刻返回，不会因为等待上游响应而卡顿

### 核心代码路径

| 组件 | 文件 |
|------|------|
| 缓存读写 | [DanmakuService.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/service/DanmakuService.java) |
| 缓存读写 | [AnimeService.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/service/AnimeService.java) |
| 缓存实体 | [ApiCache.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/model/entity/ApiCache.java) |
| 缓存仓库 | [ApiCacheRepository.java](https://github.com/eventhorizonsky/AniLinkService/blob/master/api/src/main/java/xyz/ezsky/anilink/repository/ApiCacheRepository.java) |

## 异步刷新机制

当请求命中过期缓存时，系统会触发异步刷新任务：

```
命中过期缓存
  │
  ├─ 尝试获取刷新锁（ConcurrentHashMap KeySet）
  │    └─ 已有刷新任务 → 跳过
  │
  └─ 获取锁成功 → CompletableFuture.runAsync
       │
       ├─ 调上游 API 获取新数据
       ├─ upsert 缓存（更新 expire_time）
       └─ 释放刷新锁
```

关键实现：

```java
// 防重入锁：ConcurrentHashMap 的 KeySet 保证同一 Key 原子性
private static final Set<String> COMMENT_REFRESHING_KEYS = ConcurrentHashMap.newKeySet();

private void refreshCommentCacheAsync(String cacheKey, Long episodeId, Boolean withRelated) {
    // 同一 Key 只允许一个刷新任务
    if (!COMMENT_REFRESHING_KEYS.add(cacheKey)) {
        return;
    }
    CompletableFuture.runAsync(() -> {
        try {
            String freshBody = fetchCommentFromUpstream(episodeId, withRelated);
            if (StringUtils.hasText(freshBody)) {
                upsertCache(cacheKey, freshBody, LocalDateTime.now().plusMinutes(COMMENT_CACHE_TTL_MINUTES));
            }
        } finally {
            COMMENT_REFRESHING_KEYS.remove(cacheKey); // 释放锁
        }
    });
}
```

## 缓存值校验

从数据库读取缓存时，系统会对缓存值做格式校验——只接受合法的 JSON 数据：

```java
private String extractUsableJsonCacheValue(Optional<ApiCache> cacheOpt, String cacheKey) {
    if (cacheOpt.isEmpty()) return null;
    String value = cacheOpt.get().getCacheValue();
    if (!StringUtils.hasText(value)) return null;

    String trimmed = value.trim();
    // 只认可 JSON 对象或数组
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return value;
    }
    // 非 JSON 内容视为无效，记录警告并丢弃
    log.warn("Ignoring invalid api cache payload for cacheKey={}", cacheKey);
    return null;
}
```

## 缓存管理 API

系统提供了完整的缓存管理 REST API，仅超级管理员（`super-admin` 角色）可访问。

### 接口列表

```
GET    /api/cache/stats          → 缓存统计信息
GET    /api/cache/types          → 可用缓存类型列表
DELETE /api/cache/expired        → 清理过期缓存（Level 1）
DELETE /api/cache/type/{type}    → 按类型清理（Level 2）
DELETE /api/cache/all            → 清空全部（Level 3）
```

### 缓存统计

**请求：** `GET /api/cache/stats`

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "totalCount": 156,
    "validCount": 89,
    "expiredCount": 67,
    "countByType": {
      "comment": 120,
      "bangumi": 36
    },
    "latestCreatedAt": "2026-07-05 14:23:01",
    "earliestCreatedAt": "2026-07-04 08:15:33"
  }
}
```

### 分级清理

系统提供三个级别的缓存清理操作，从安全到核选项逐级递进：

#### Level 1 — 清理过期缓存

```bash
curl -X DELETE http://localhost:8080/api/cache/expired
```

- 仅删除 `expire_time < now()` 的条目
- **最安全**，不影响当前有效缓存
- 适合日常维护

#### Level 2 — 按类型清理

```bash
curl -X DELETE http://localhost:8080/api/cache/type/comment   # 弹幕缓存
curl -X DELETE http://localhost:8080/api/cache/type/bangumi   # 动漫详情缓存
```

- 删除指定类型前缀的全部缓存（无论是否过期）
- 适合某一类数据出现异常时精准清理
- 可用类型通过 `GET /api/cache/types` 查询

#### Level 3 — 清空全部

```bash
curl -X DELETE http://localhost:8080/api/cache/all
```

- 删除 `api_cache` 表中所有数据
- **需谨慎使用**，清空后所有请求将回源拉取
- 前端管理页面有二次确认弹窗

### 清理结果

所有清理接口返回统一格式：

```json
{
  "code": 200,
  "data": {
    "level": "expired",
    "cacheType": null,
    "deletedCount": 67,
    "beforeCount": 156,
    "afterCount": 89
  }
}
```

## 前端管理页面

在管理后台的「缓存管理」页面，可以直观地查看缓存统计和进行清理操作：

![缓存管理页面结构示意]{class="hidden"}

页面功能区域：
1. **统计卡片** — 缓存总数 / 有效缓存 / 已过期 / 最近缓存时间
2. **类型分布** — 按 comment / bangumi 分类显示条数
3. **清理操作区** — 三个级别操作按钮，全部清空需二次确认
4. **时间范围提示** — 展示缓存时间跨度和自动清理说明

管理后台侧边栏路径：**系统管理 → 缓存管理**

## 定时自动清理

系统通过 Spring `@Scheduled` 每小时自动清理一次过期缓存：

```java
@Scheduled(cron = "0 7 * * * *")   // 每小时第 7 分钟执行
public void scheduledCleanExpired() {
    // 调用 Level 1 清理逻辑（仅删除过期数据）
    CacheClearResultVO result = clearExpired();
    if (result.getDeletedCount() > 0) {
        log.info("定时清理过期缓存完成: 删除 {} 条, 剩余 {} 条",
                result.getDeletedCount(), result.getAfterCount());
    }
}
```

设计要点：
- 每分钟第 7 分钟执行，避免与整点任务碰撞
- 仅清理过期数据，不触碰有效缓存
- 只在有实际删除时记录日志，避免日志噪音
- 异常被捕获并记录，不会中断定时任务调度

## 缓存 TTL 配置

缓存有效期通过常量定义，当前硬编码为 30 分钟：

```java
// DanmakuService.java
private static final long COMMENT_CACHE_TTL_MINUTES = 30;

// AnimeService.java
private static final long BANGUMI_CACHE_TTL_MINUTES = 30;
```

::: tip 未来优化方向
可以将 TTL 配置迁移到站点配置（`site_config` 表）中，支持通过管理界面动态调整，无需重启服务。
:::

## 架构总结

```
┌──────────────────────────────────────────────────────────┐
│                      请求层                                │
│  DanmakuService            AnimeService                   │
│  (弹幕/搜索)               (动漫详情/新番表)                │
│      │                         │                          │
│      ▼                         ▼                          │
│  Stale-While-Revalidate      同样策略                      │
│      │                         │                          │
│      ▼                         ▼                          │
│  ┌────────────────────────────────────────────┐          │
│  │           api_cache 表 (MySQL/H2)            │          │
│  │    cache_key | cache_value | expire_time    │          │
│  └────────────────────────────────────────────┘          │
│                                                           │
│  TTL: 30分钟    策略: 过期可用 + 异步刷新                  │
│  防重入: ConcurrentHashMap KeySet 锁                      │
│  定时清理: @Scheduled 每小时第7分钟执行                    │
│                                                           │
│  DandanMatchService → 不使用缓存，直连上游                  │
└──────────────────────────────────────────────────────────┘
```

## 相关文档

- [后端开发指南](./backend.md)
- [数据库与Liquibase](./database.md)
- [开发文档概览](./overview.md)
