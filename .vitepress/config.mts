import { defineConfig } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";

const SITE_URL = "https://eventhorizonsky.github.io/ani-link-doc";
const SITE_TITLE = "AniLinkService";
const SITE_DESCRIPTION =
  "基于弹弹play开放平台的自动化动漫媒体管理中心。支持本地文件扫描、弹幕匹配、Web播放、RSS自动下载、Bangumi追番联动，可部署在NAS/家用服务器/云主机上。开源、自托管、Docker一键启动。";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  base: "/ani-link-doc/",

  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // 生成 sitemap.xml，帮助搜索引擎发现所有页面
  // 注意：hostname 只需填写 origin，base 路径会自动拼接
  sitemap: {
    hostname: "https://eventhorizonsky.github.io",
  },

  markdown: {
    config: (md) => {
      md.use(mdItCustomAttrs, "image", {
        "data-fancybox": "gallery",
      });
    },
  },

  // 全局 <head> 注入：搜索引擎 meta + Open Graph + Twitter Card
  head: [
    // 搜索引擎
    ["meta", { name: "robots", content: "index, follow" }],
    ["meta", { name: "author", content: "eventhorizonsky" }],
    ["link", { rel: "canonical", href: SITE_URL }],

    // Open Graph（Discord / Telegram / Slack 等展开预览）
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:url", content: SITE_URL }],
    ["meta", { property: "og:title", content: SITE_TITLE }],
    ["meta", { property: "og:description", content: SITE_DESCRIPTION }],
    ["meta", { property: "og:image", content: `${SITE_URL}/logo.png` }],
    ["meta", { property: "og:image:width", content: "256" }],
    ["meta", { property: "og:image:height", content: "256" }],
    ["meta", { property: "og:site_name", content: "AniLinkService" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],

    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary" }],
    ["meta", { name: "twitter:title", content: SITE_TITLE }],
    ["meta", { name: "twitter:description", content: SITE_DESCRIPTION }],
    ["meta", { name: "twitter:image", content: `${SITE_URL}/logo.png` }],

    // Fancybox
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css",
      },
    ],
    ["link", { rel: "icon", href: "/ani-link-doc/favicon.ico" }],
    [
      "script",
      {
        src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js",
      },
    ],
  ],
  // 忽略死链接检查
  ignoreDeadLinks: [
    // 忽略所有 localhost 链接
    /^https?:\/\/localhost/,
    // 忽略相对路径链接（文档尚未完成）
    /^\.\//,
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // 搜索设置
    search: {
      provider: "local",
    },

    // 最后更新时间（基于 Git，提升"内容新鲜度"信号）
    lastUpdated: {
      text: "最后更新",
      formatOptions: { dateStyle: "short", timeStyle: "short" },
    },

    nav: [
      { text: "首页", link: "/" },
      { text: "快速开始", link: "/quick-start-ssh" },
      {
        text: "用户手册",
        items: [
          { text: "介绍", link: "/user-guide/introduction" },
          { text: "用户管理", link: "/user-guide/usermanager" },
          { text: "远程访问", link: "/user-guide/remote-access" },
          { text: "视频资源管理", link: "/user-guide/video-resource-management" },
          { text: "媒体库管理", link: "/user-guide/media-library-management" },
          { text: "字幕管理", link: "/user-guide/subtitle-management" },
          { text: "资源搜索", link: "/user-guide/resource-search" },
          { text: "RSS订阅", link: "/user-guide/rss-subscription" },
          { text: "下载管理", link: "/user-guide/download-management" },
          { text: "bangumi绑定", link: "/user-guide/bangumi-binding" },
          { text: "故障排查", link: "/user-guide/troubleshooting" },
        ],
      },
      {
        text: "开发文档",
        items: [
          { text: "概览", link: "/dev-guide/overview" },
          { text: "后端开发", link: "/dev-guide/backend" },
          { text: "前端开发", link: "/dev-guide/frontend" },
          { text: "数据库与Liquibase", link: "/dev-guide/database" },
          { text: "API 缓存机制", link: "/dev-guide/cache" }
        ],
      },
    ],

    sidebar: {
      "/user-guide/": [
        {
          text: "用户手册",
          items: [
            { text: "介绍", link: "/user-guide/introduction" },
          { text: "用户管理", link: "/user-guide/usermanager" },
          { text: "远程访问", link: "/user-guide/remote-access" },
          { text: "视频资源管理", link: "/user-guide/video-resource-management" },
          { text: "媒体库管理", link: "/user-guide/media-library-management" },
          { text: "字幕管理", link: "/user-guide/subtitle-management" },
          { text: "资源搜索", link: "/user-guide/resource-search" },
          { text: "MCP接入", link: "/user-guide/mcp" },
          { text: "RSS订阅", link: "/user-guide/rss-subscription" },
          { text: "下载管理", link: "/user-guide/download-management" },
          { text: "bangumi绑定", link: "/user-guide/bangumi-binding" },
          { text: "故障排查", link: "/user-guide/troubleshooting" },
          ],
        },
      ],
      "/dev-guide/": [
        {
          text: "开发文档",
          items: [
            { text: "概览", link: "/dev-guide/overview" },
            { text: "后端开发", link: "/dev-guide/backend" },
            { text: "前端开发", link: "/dev-guide/frontend" },
            { text: "数据库与Liquibase", link: "/dev-guide/database" },
            { text: "API 缓存机制", link: "/dev-guide/cache" },
          ],
        },
      ],
      "/": [
        {
          text: "选择其中一个文档查看即可",
          items: [
            { text: "通过命令来启动服务", link: "/quick-start-ssh" },
            {
              text: "通过可视化界面来启动服务（以极空间为例）",
              link: "/quick-start-jkj",
            },{
              text: "通过可视化界面来启动服务（以极空间为例）+PGSQL",
              link: "/quick-start-compose",
            },
           
          ],
        },{
          text: "弹弹play AppId / AppSecret",
          items: [ { text: "下游代理服务", link: "/ani-link-proxy" }]
        }
      ],
    },
    logo: "/logo.svg",
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/eventhorizonsky/AniLinkService",
      },
    ],
  },
});
