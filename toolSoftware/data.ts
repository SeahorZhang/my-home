import Props from "./type";

const data: Props[] = [
  {
    text: "影音阅读",
    items: [
      {
        text: "IINA",
        type: "播放器",
        desc: "适用于 macOS 的 现代 媒体播放器。",
        link: "https://iina.io/",
        github: "https://github.com/iina/iina",
        tags: [{ text: "免费", type: "tip" }],
      },
      {
        text: "Infuse",
        type: "播放器",
        icon: "/Infuse.png",
        link: "https://firecore.cn/infuse",
        tags: [{ text: "收费", type: "warning" }],
        desc: "Ignite your video content with Infuse - the beautiful way to watch almost any video format on your iPhone, iPad, Apple TV, and Mac. ",
      },
      {
        text: "MarkMark",
        type: "网址记录",
        icon: "/MarkMark.png",
        link: "https://apps.apple.com/cn/app/markmark/id6475077023",
        tags: [{ text: "收费", type: "warning" }],
        desc: "MarkMark is a brand new app designed to help you collect and organize articles, websites, and all kinds of web pages. It's not just a bookmarks app or a read-it-later app, but goes beyond these functionalities.",
      },
      {
        text: "Chrome",
        type: "浏览器",
        desc: "Chrome，不一样的浏览器体验",
        icon: "/chrome.png",
        link: "https://www.google.cn/intl/zh-CN/chrome/",
        tags: [{ text: "免费", type: "tip" }],
      },
    ],
  },
  {
    text: "小工具",
    items: [
      {
        text: "Itsycal",
        type: "日历",
        desc: "Itsycal 是一个微型菜单栏日历。如果需要，它会将您的事件显示为 Mac 日历应用程序的伴侣。",
        link: "https://www.mowglii.com/itsycal/",
        tags: [{ text: "免费", type: "tip" }],
      },
      {
        text: "Easydict",
        type: "翻译",
        icon: "/Easydict.png",
        link: "https://github.com/tisfeng/Easydict",
        tags: [{ text: "免费", type: "tip" }],
        desc: "Easydict 是一个简洁易用的词典翻译 macOS App，能够轻松优雅地查找单词或翻译文本。",
      },
      {
        text: "Strongbox",
        type: "密码记录",
        desc: "Never forget a password again with the most secure and powerful KeePass password manager on iPhone, iPad and Mac.",
        link: "https://strongboxsafe.com/",
        tags: [{ text: "收费", type: "warning" }],
      },
      {
        text: "iShot Pro",
        type: "截图",
        icon: "/iShotPro.webp",
        link: "https://www.better365.cn/ishot.html",
        tags: [{ text: "收费", type: "warning" }],
        desc: "截图、长截图、全屏带壳截图、贴图、标注、取色、录屏、录音、OCR、翻译，一个顶十个，样样皆优秀！",
      },
      {
        text: "PasteNow",
        type: "剪贴板",
        link: "https://pastenow.app/",
        tags: [{ text: "收费", type: "warning" }],
        desc: "PasteNow 是一款跨平台的剪贴板管理工具，专注在隐私与易用上，支持通过 icloud 在所有 jos 和 macos设备中同步剪贴板记录。你可以通过它存储各种各样的临时数据：文本、链接、图像等等，使日常工作更轻松和快捷。",
      },
      {
        text: "MonitorControl",
        type: "显示器调节",
        icon: "/MonitorControl.png",
        link: "https://github.com/MonitorControl/MonitorControl",
        github: "https://github.com/MonitorControl/MonitorControl",
        desc: "控制外部显示器的亮度和音量，并显示本机OSD。使用menulet滑块或键盘，包括本机Apple键！",
        tags: [{ text: "免费", type: "tip" }],
      },
      {
        text: "Manico",
        type: "小工具",
        link: "https://manico.im/#home",
        tags: [{ text: "收费", type: "warning" }],
        desc: "Manico 是一个为 macOS 设计的快速的 App 启动和切换工具",
      },
    ],
  },
  {
    text: "系统",
    items: [
      {
        text: "Homebrew",
        type: "App 管理",
        link: "https://brew.sh/",
        github: "https://github.com/Homebrew/brew",
        tags: [{ text: "免费", type: "tip" }],
        desc: "The Missing Package Manager for macOS (or Linux)",
      },
      {
        text: "Keka",
        type: "解压缩",
        icon: "/Keka.png",
        link: "https://www.keka.io/",
        tags: [{ text: "官网免费", type: "tip" }],
        desc: "the macOS file archiver Store more, share with privacy",
      },
      {
        text: "raycast",
        type: "启动器",
        link: "https://www.raycast.com/",
        tags: [
          { text: "基础免费", type: "tip" },
          { text: "收费", type: "warning" },
        ],
        desc: "Raycast is a blazingly fast, totally extendable launcher. It lets you complete tasks, calculate, share common links, and much more.",
      },
      {
        text: "proxyman",
        type: "拦截",
        link: "https://proxyman.io/",
        tags: [
          { text: "基础免费", type: "tip" },
          { text: "收费", type: "warning" },
        ],
        desc: "Best-in-class native macOS app to Capture, Decrypt, and Mock your HTTP/HTTPS with all advanced debugging tools.",
      },
      {
        text: "网速&电池",
        type: "网速",
        desc: "实时网速 & 电池健康",
        icon: "/internetSpeed.webp",
        link: "https://apps.apple.com/cn/app/%E7%BD%91%E9%80%9F-%E7%94%B5%E6%B1%A0/id1387780159?mt=12",
        tags: [{ text: "收费", type: "warning" }],
      },
      {
        text: "App Cleaner & Uninstaller",
        type: "卸载",
        desc: "A smart, intuitive and efficient solution to clean up your Mac and manage all types of extensions.",
        icon: "/Uninstaller.png",
        link: "https://nektony.com/mac-app-cleaner",
        tags: [{ text: "收费", type: "warning" }],
      },
      {
        text: "AdGuard",
        type: "广告拦截",
        link: "https://adguard.app/zh_cn/adguard-mac/overview.html",
        tags: [{ text: "收费", type: "warning" }],
        desc: "AdGuard for Mac 是世界上第一个专设计给 macOS 的独立广告拦截程序。其提供了比任何浏览器扩展还多的功能：拦截各种浏览器和应用内的广告，保护您的隐私。",
      },
      {
        text: "Bartender",
        type: "状态栏",
        link: "https://www.macbartender.com/",
        tags: [{ text: "收费", type: "warning" }],
        desc: "Bartender is an award-winning app for macOS that for more than 10 years has superpowered your menu bar, giving you total control over your menu bar items, what's displayed, and when, with menu bar items only showing when you need them. Bartender improves your workflow with quick reveal, search, custom hotkeys and triggers, and lots more.",
      },
      {
        text: "Shadowrocket",
        type: "代理",
        desc: "Rule based proxy utility client for iPhone/iPad.",
        icon: "/Shadowrocket.png",
        link: "https://apps.apple.com/us/app/shadowrocket/id932747118?l=zh-Hans-CN",
        tags: [
          { text: "收费", type: "warning" },
          { text: "外区", type: "warning" },
        ],
      },
    ],
  },
  {
    text: "弃用",
    items: [
      {
        text: "One Switch",
        type: "快捷按键",
        icon: "/OneSwitch.svg",
        desc: "所有强大的开关都集中在一个地方。",
        link: "https://fireball.studio/oneswitch/",
        tags: [
          { text: "收费", type: "warning" },
          { text: "弃用", type: "danger" },
        ],
      },
      {
        text: "MenubarX",
        type: "浏览器",
        desc: "MenubarX 是一款强大的 Mac 菜单栏浏览器，把网页添加到菜单栏上，像原生 App 一样即开即用，为你打开 Web Apps 的新世界。",
        link: "https://menubarx.app/",
        tags: [
          { text: "收费", type: "warning" },
          { text: "弃用", type: "danger" },
        ],
      },
      {
        text: "Thor",
        type: "小工具",
        icon: "/Thor.png",
        link: "https://apps.apple.com/us/app/thor-launcher/id1120999687?l=zh-Hans-CN&mt=12",
        github: "https://github.com/gbammc/Thor",
        tags: [{ text: "免费", type: "tip" }, { text: "macOS 15", type: "danger" },],
        desc: "Open the right application ASAP.",
      },
      {
        text: "OnlySwitch",
        type: "快捷按键",
        icon: "/OnlySwitch.png",
        link: "https://github.com/jacklandrin/OnlySwitch",
        tags: [
          { text: "免费", type: "tip" },
          { text: "弃用", type: "danger" },
        ],
        desc: "Menubar is smaller, you only need an All-in-One switch.",
      },
    ],
  },
];

export default data;
