import { defineConfig } from "vitepress";
export default defineConfig({
  lang: 'zh-Hans',
  title: "Seahor",
  themeConfig: {
    socialLinks: [{ icon: "github", link: "https://github.com/SeahorZhang" }],
    editLink: {
      text: "为此页提供修改建议",
      pattern: "https://github.com/SeahorZhang/my-home/blob/main/toolSoftware/data.ts",
    },
    lastUpdatedText: "最近更新时间",
    // footer: {
    //   message: `版权所有 © 2019-${new Date().getFullYear()}`,
    //   copyright:
    //     '<a href="https://beian.miit.gov.cn/#/Integrated/recordQuery" target="_blank">浙ICP备2021016690号-2</a>',
    // },
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
        text: "首页",
        link: "/",
      },
      {
        text: "工具软件",
        link: "/toolSoftware/overview",
        activeMatch: "/toolSoftware/",
      },
      {
        text: "个人项目",
        activeMatch: "/app/wtab",
        items: [
          {
            text: 'WTab',
            link: 'https://wtab.cn/',
          },
          {
            text: 'SyncCookies',
            link: 'https://chromewebstore.google.com/detail/sync-cookies/hcehoofohgpjngheemopifodkamccbij',
          },
          {
            text: 'Pinece',
            link: 'https://chromewebstore.google.com/detail/pinece-webext/oloddfdfgpipbngfcohnfpgdallhnoep',
          },
        ]
      },
    ],
    aside: false,
  },
});
