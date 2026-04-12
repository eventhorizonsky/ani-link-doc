# AniLinkProxy 下游代理服务介绍

`AniLinkProxy` 是一个面向 `AniLinkServer` 的下游代理服务示例，用于在官方弹弹play开放平台接口尚未完全开放时，快速获取兼容的 `AppId` / `AppSecret`。

## 公益演示地址

- https://ani-proxy.ezsky.xyz/

该地址为公益示例服务，主要用于演示和测试。

## 这个服务适合什么场景？

- 你暂时无法直接从官方申请到 `AppId` / `AppSecret`
- 你想快速完成 `AniLinkServer` 的安装配置
- 你希望先体验 AniLinkServer 的基础功能

## 如何使用

1. 打开公益演示地址： https://ani-proxy.ezsky.xyz/
2. 按页面指引申请一个下游 `AppId` / `AppSecret`
3. 在 `AniLinkServer` 的安装引导页面中填写申请到的 `AppId` 和 `AppSecret`,并修改baseurl
4. 如果你使用自建代理，请确保该服务兼容弹弹play API 规范

## 重要提醒

- 该服务仅作示例用途，不能替代官方接口的稳定性和长期支持。
- 最佳做法仍然是优先使用官方弹弹play API(https://doc.dandanplay.com/open/#_3-%E7%94%B3%E8%AF%B7-appid-%E5%92%8C-appsecret)；如果官方 API 可用，请优先使用官方方式申请。
- 你也可以使用任何符合弹弹play API规范的代理服务，或者自行部署兼容的下游代理。

## 自行部署与源码

- GitHub 项目： https://github.com/eventhorizonsky/AniLinkProxy

如果你希望获得更稳定、更可控的使用体验，可以自行部署 `AniLinkProxy`，并将自己的代理服务地址用于 `AniLinkServer`。
