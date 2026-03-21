import { defineConfig } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";
// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  base: "/ani-link-doc/",

  title: "AniLinkServer",
  description: "一个为弹幕站设计的媒体管理服务",
  markdown: {
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, "image", {
        "data-fancybox": "gallery",
      });
    },
  },
  head: [
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
        },
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
