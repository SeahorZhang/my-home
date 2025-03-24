import { defineConfig } from "vitepress";

export default defineConfig({
  lang: 'zh-Hans',
  title: "Seahor",
  themeConfig: {
    socialLinks: [{ icon: "github", link: "https://github.com/SeahorZhang" }],
    outline: false,
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
  vite: {
    define: {
      __BUILD_TIME__: JSON.stringify(
        new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'Asia/Shanghai'
        })
      )
    }
  }
});
