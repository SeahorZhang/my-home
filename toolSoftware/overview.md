::: warning 所有记录均为 Mac 系统使用
工欲善其事，必先利其器。
:::

<script setup>
import index from './index.vue'

const data = [
  {
    text: "影音阅读",
    items: [
      {
        text: "IINA",
        type: "播放器",
        desc: "适用于 macOS 的现代媒体播放器。",
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
        desc: "优雅强大的视频播放器，支持几乎所有视频格式，适用于iPhone、iPad、Apple TV和Mac。",
      },
      {
        text: "MarkMark",
        type: "网址记录",
        icon: "/MarkMark.png",
        link: "https://apps.apple.com/cn/app/markmark/id6475077023",
        tags: [{ text: "收费", type: "warning" }],
        desc: "全新的收藏工具，帮助你收集和整理文章、网站和各类网页，超越普通书签和稍后阅读应用的功能。",
      },
      {
        text: "Chrome",
        type: "浏览器",
        desc: "Chrome，不一样的浏览器体验",
        icon: "/chrome.png",
        link: "https://www.google.cn/intl/zh-CN/chrome/",
        tags: [{ text: "免费", type: "tip" }],
      },
      {
        text: "Spark",
        type: "邮件客户端",
        desc: "智能、直观的电子邮件客户端，帮助您轻松管理收件箱，支持多账户、智能通知和团队协作功能。",
        link: "https://sparkmailapp.com/",
        tags: [
          { text: "基础免费", type: "tip" },
          { text: "订阅", type: "warning" }
        ],
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
        desc: "功能强大的密码管理器，安全可靠，支持iPhone、iPad和Mac，不必再忘记密码。",
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
        desc: "跨平台剪贴板管理工具，专注隐私与易用，通过iCloud同步所有iOS和macOS设备的剪贴板记录。",
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
        desc: "macOS（或Linux）的缺失包管理器，轻松安装各类软件。",
      },
      {
        text: "Keka",
        type: "解压缩",
        icon: "/Keka.png",
        link: "https://www.keka.io/",
        tags: [{ text: "官网免费", type: "tip" }],
        desc: "macOS文件压缩解压工具，存储更多内容，保护隐私共享文件。",
      },
      {
        text: "raycast",
        type: "启动器",
        link: "https://www.raycast.com/",
        tags: [
          { text: "基础免费", type: "tip" },
          { text: "收费", type: "warning" },
        ],
        desc: "极速可扩展的启动器，帮助你完成任务、计算、分享链接等多种功能。",
      },
      {
        text: "proxyman",
        type: "拦截",
        link: "https://proxyman.io/",
        tags: [
          { text: "基础免费", type: "tip" },
          { text: "收费", type: "warning" },
        ],
        desc: "一流的macOS原生应用，用于捕获、解密和模拟HTTP/HTTPS流量，提供全面的调试工具。",
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
        desc: "智能、直观且高效的Mac清理工具，用于卸载应用程序并管理各类扩展。",
        icon: "/Uninstaller.png",
        link: "https://nektony.com/mac-app-cleaner",
        tags: [{ text: "收费", type: "warning" }],
      },
      {
        text: "AdGuard",
        type: "广告拦截",
        link: "https://adguard.app/zh_cn/adguard-mac/overview.html",
        tags: [{ text: "收费", type: "warning" }],
        desc: "专为macOS设计的独立广告拦截程序，提供比浏览器扩展更多功能，拦截各种应用内广告，保护隐私。",
      },
      {
        text: "Bartender",
        type: "状态栏",
        link: "https://www.macbartender.com/",
        tags: [{ text: "收费", type: "warning" }],
        desc: "强大的菜单栏管理工具，让你完全控制菜单栏项目的显示与隐藏，支持快速显示、搜索和自定义快捷键。",
      },
      {
        text: "Shadowrocket",
        type: "代理",
        desc: "基于规则的代理工具客户端，适用于iPhone/iPad。",
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
        desc: "快速打开指定应用程序的启动工具。",
        link: "https://apps.apple.com/us/app/thor-launcher/id1120999687?l=zh-Hans-CN&mt=12",
        github: "https://github.com/gbammc/Thor",
        tags: [{ text: "免费", type: "tip" }, { text: "macOS 15", type: "danger" }],
      },
      {
        text: "OnlySwitch",
        type: "快捷按键",
        icon: "/OnlySwitch.png",
        desc: "菜单栏多合一开关工具，简洁实用。",
        link: "https://github.com/jacklandrin/OnlySwitch",
        tags: [
          { text: "免费", type: "tip" },
          { text: "弃用", type: "danger" },
        ],
      },
    ],
  },
];
</script>

<index :data="data"/>
