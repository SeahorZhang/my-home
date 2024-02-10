export default [
  {
    text: "生活",
    base:'/toolSoftware/life/',
    items: [
      {
        text: "Chrome",
        link: "chrome",
        type: "浏览器",
        tag:[
          { text:'免费', type:'success' }
        ],
        links: [
          {
            type: "官网",
            url: "https://www.google.cn/intl/zh-CN/chrome/",
          },
        ],
        imgs: ["/img/life/chrome.png"],
        synopsis: "Chrome，不一样的浏览器体验",
      },
      {
        text: "iina",
        type: "播放器",
        link: "iina",
        tag:[
          { text:'免费', type:'success' }
        ],
        links: [
          {
            type: "官网",
            url: "https://iina.io/",
          },
          {
            type: "Github",
            url: "https://github.com/iina/iina",
          },
        ],
        imgs: ["/img/life/iina.png"],
        synopsis: "适用于 macOS 的 现代 媒体播放器。",
      },
      {
        text: "网速&电池",
        type: "网速",
        link: "internetSpeed",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "App Store",
            url: "https://apps.apple.com/cn/app/%E7%BD%91%E9%80%9F-%E7%94%B5%E6%B1%A0/id1387780159?mt=12",
          },
        ],
        imgs: ["/img/life/internetSpeed.png"],
        synopsis: "实时网速 & 电池健康",
      },
      {
        text: "Itsycal",
        type: "日历",
        link: "Itsycal",
        tag:[
          { text:'免费', type:'success' }
        ],
        links: [
          {
            type: "官网",
            url: "https://www.mowglii.com/itsycal/",
          },
        ],
        imgs: ["/img/life/itsycal.png"],
        synopsis:
          "Itsycal 是一个微型菜单栏日历。如果需要，它会将您的事件显示为 Mac 日历应用程序的伴侣。",
      },
      {
        text: "MenubarX",
        type: "浏览器",
        link: "MenubarX",
        tag:[
          { text:'收费', type:'warning' },
          { text:'待淘汰', type:'info' },
        ],
        website: "https://menubarx.app/",
        links: [
          {
            type: "App Store",
            url: "https://apps.apple.com/app/id1575588022",
          },
        ],
        imgs: ["/img/life/MenubarX.png"],
        synopsis:
          "MenubarX 是一款强大的 Mac 菜单栏浏览器，把网页添加到菜单栏上，像原生 App 一样即开即用，为你打开 Web Apps 的新世界。",
      },
      {
        text: "MonitorControl",
        type: "显示器调节",
        link: "MonitorControl",
        tag:[
          { text:'免费', type:'success' }
        ],
        links: [
          {
            type: "github",
            url: "https://github.com/MonitorControl/MonitorControl",
          },
        ],
        imgs: ["/img/life/MonitorControl.png"],
        synopsis:
          "控制外部显示器的亮度和音量，并显示本机OSD。使用menulet滑块或键盘，包括本机Apple键！",
      },
      {
        text: "One Switch (淘汰)",
        type: "快捷按键",
        link: "OneSwitch",
        tag:[
          { text:'收费', type:'warning' },
          { text:'淘汰', type:'danger' },
        ],
        links: [
          {
            type: "官网",
            url: "https://fireball.studio/oneswitch/",
          },
          {
            type: "替换为 OnlySwitch",
            url: "OnlySwitch",
            target:'_self'
          },
        ],
        imgs: ["/img/life/OneSwitch.png"],
        synopsis: "所有强大的开关都集中在一个地方。",
      },
      {
        text: "OnlySwitch",
        type: "快捷按键",
        link: "OnlySwitch",
        tag:[
          { text:'免费', type:'success' },
        ],
        links: [
          {
            type: "官网",
            url: "https://github.com/jacklandrin/OnlySwitch",
          },
        ],
        imgs: ["/img/life/OnlySwitch.png"],
        synopsis: "Menubar is smaller, you only need an All-in-One switch.",
      },
    ],
  },
  {
    text: "工具",
    base:'/toolSoftware/tool/',
    items: [
      {
        text: "AdGuard",
        type: "广告拦截",
        link: "AdGuard",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "官网",
            url: "https://adguard.app/zh_cn/adguard-mac/overview.html",
          },
        ],
        imgs: ["/img/tool/AdGuard.png"],
        synopsis:
          "AdGuard for Mac 是世界上第一个专设计给 macOS 的独立广告拦截程序。其提供了比任何浏览器扩展还多的功能：拦截各种浏览器和应用内的广告，保护您的隐私。",
      },
      {
        text: "Bartender",
        type: "状态栏",
        link: "bartender",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "官网",
            url: "https://www.macbartender.com/",
          },
        ],
        imgs: ["/img/tool/Bartender.gif","/img/tool/Bartender1.jpg", "/img/tool/Bartender2.png"],
        synopsis: "Bartender is an award-winning app for macOS that for more than 10 years has superpowered your menu bar, giving you total control over your menu bar items, what's displayed, and when, with menu bar items only showing when you need them. Bartender improves your workflow with quick reveal, search, custom hotkeys and triggers, and lots more.",
      },
      {
        text: "BetterZip (淘汰)",
        type: "解压缩",
        link: "betterZip",
        tag:[
          { text:'收费', type:'warning' },
          { text:'淘汰', type:'danger' },
        ],
        links: [
          {
            type: "官网",
            url: "https://macitbetter.com/",
          },
          {
            type: "替换为 Keka",
            url: "keka",
            target:'_self'
          },
        ],
        imgs: ["/img/tool/betterZip.png"],
        synopsis: "功能强大、操作简单的解压缩软件",
      },
      {
        text: "Keka",
        type: "解压缩",
        link: "keka",
        tag:[
          { text:'官网免费', type:'success' },
          { text:'APP Store 收费', type:'warning' },
        ],
        links: [
          {
            type: "官网",
            url: "https://www.keka.io/",
          },
          {
            type: "App Store",
            url: "https://mas.keka.io",
          },
        ],
        imgs: ["/img/tool/keka.png"],
        synopsis: "the macOS file archiver Store more, share with privacy",
      },
      {
        text: "ClashX",
        type: "代理",
        link: "clashX",
        tag:[
          { text:'免费', type:'success' }
        ],
        links: [
          {
            type: "Github",
            url: "https://github.com/yichengchen/clashX",
          },
        ],
        imgs: ["/img/tool/ClashX.png"],
        synopsis: "苹果Mac系统 ClashX 代理软件",
      },
      {
        text: "Downie",
        type: "视频下载",
        link: "downie",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "官网",
            url: "https://software.charliemonroe.net/downie/",
          },
        ],
        imgs: ["/img/tool/downie.png"],
        synopsis:
          "曾经希望您可以保存来自 Internet 的视频吗？无需再搜索，Downie 就是您要找的。从数以千计的不同站点轻松下载视频。",
      },
      {
        text: "iShot Pro",
        type: "截图",
        link: "iShot",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "官网",
            url: "https://www.better365.cn/ishot.html",
          },
          {
            type: "App Store",
            url: "https://apps.apple.com/cn/app/id1611347086",
          },
        ],
        imgs: ["/img/tool/iShot.jpg"],
        synopsis:
          "截图、长截图、全屏带壳截图、贴图、标注、取色、录屏、录音、OCR、翻译，一个顶十个，样样皆优秀！",
      },
      {
        text: "Manico",
        type: "切换应用",
        link: "Manico",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "App Store",
            url: "https://apps.apple.com/cn/app/manico/id724472954?mt=12",
          },
        ],
        imgs: ["/img/tool/Manico.png"],
        synopsis: "强大的 App 启动与切换工具，瞬间切换至目标 App",
      },
      {
        text: "mate",
        type: "翻译",
        link: "mate",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "官网",
            url: "https://gikken.co/mate-translate/mac/",
          },
        ],
        imgs: ["/img/tool/mate.png"],
        synopsis: "无与伦比的 Mac 翻译应用程序。",
      },
      {
        text: "PasteNow",
        type: "剪贴板",
        link: "PasteNow",
        tag:[
          { text:'收费', type:'warning' }
        ],
        links: [
          {
            type: "App Store",
            url: "https://apps.apple.com/app/apple-store/id1552536109",
          },
        ],
        imgs: ["/img/tool/PasteNow.png"],
        synopsis:
          "PasteNow 是一款跨平台的剪贴板管理工具，专注在隐私与易用上，支持通过 icloud 在所有 jos 和 macos设备中同步剪贴板记录。你可以通过它存储各种各样的临时数据：文本、链接、图像等等，使日常工作更轻松和快捷。",
      },
    ],
  }
];
