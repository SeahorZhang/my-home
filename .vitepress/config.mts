import { defineConfig } from "vitepress";
export default defineConfig({
  lang: 'zh-Hans',
  // base:'/my-home/',
  title: "Seahor",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/cat.svg" }]],
  themeConfig: {
  logo: "/cat.svg",
    socialLinks: [{ icon: "github", link: "https://github.com/Miss-Sixty" }],
    editLink: {
      text: "为此页提供修改建议",
      pattern: "https://github.com/Miss-Sixty/my-home/edit/main/docs/:path",
    },
    lastUpdatedText: "最近更新时间",
    footer: {
      message: `版权所有 © 2019-${new Date().getFullYear()}`,
      copyright:
        '<a href="https://beian.miit.gov.cn/#/Integrated/recordQuery" target="_blank">浙ICP备2021016690号-2</a>',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    nav: [
      {
        text: "工具软件",
        link: "/toolSoftware/overview",
        activeMatch: "/toolSoftware/",
      },
    ],
    aside:false,
  },
});
