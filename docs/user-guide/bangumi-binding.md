# bangumi绑定

Bangumi 绑定用于将当前 AniLinkService 用户账号与个人 Bangumi 账号关联，便于后续进行账号信息联动或扩展能力接入。

## 功能入口

登录后进入“个人中心”，切换到“账号绑定”标签页。

![image-20260321194011048](/bangumi-binding/image-20260321194011048.jpg)

绑定后支持在评论区快捷发表评论并同步到bangumi

![image-20260321194146186](/bangumi-binding/image-20260321194146186.jpg)

## 绑定前准备

系统前端会提示前往以下页面获取 Access Token：

`https://next.bgm.tv/demo/access-token`

操作建议：

1. 先登录自己的 Bangumi 账号。
2. 获取 Access Token。
3. 复制 Token 回到 AniLinkService 页面。

注意：

- Token 会提交到服务端保存。
- 只应在你信任的服务环境中进行绑定。

## 解除绑定

点击“解除绑定”后，系统会移除当前账号与 Bangumi 的关联关系。

适用场景：

- 更换 Bangumi 账号
- 当前 Token 已失效且不再使用该账号
- 测试环境需要清理绑定状态

## 刷新状态

当你不确定当前绑定是否成功、Token 是否有效时，可点击“刷新状态”重新从后端读取状态。

## 常见问题

### 绑定失败

- 确认 Token 复制完整，没有多余空格。
- 确认 Token 来自正确的 Bangumi 页面。
- 检查后端是否能访问 Bangumi 接口。

### 显示已绑定但 Token 失效

- 重新获取新的 Access Token。
- 在当前页面点击“绑定或更新 Token”覆盖旧值。

### 解除绑定后页面还是旧状态

- 点击“刷新状态”重新拉取。
- 如仍不一致，尝试重新登录当前站点账号。
