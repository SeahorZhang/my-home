export const personalInfo = {
  name: 'Seahor',
  title: '前端开发工程师',
  bio: '热爱技术 | 开源贡献者 | 生活探索者',
  avatar: '/default.svg',
  socialLinks: [
    { icon: 'github', link: 'https://github.com/SeahorZhang', label: 'GitHub' },
    { icon: 'x', link: 'https://x.com/SeahorZhang', label: 'X' },
  ]
};

export const getImage = (path) => path || '/default-project.png';

export const projects = [
  {
    title: '浏览器首页导航',
    description: '一款高度可定制的浏览器新标签页扩展，支持自定义布局、网站收藏和搜索引擎，为您提供更高效的网络导航体验。',
    link: 'https://chromewebstore.google.com/detail/wtab/diiielhbpbgalhohmfelhgaakdjcmkjl?authuser=0&hl=zh-CN',
    image: getImage('/wtab.png'),
    type: 'Chrome扩展',
  },
  {
    title: '浏览器书签导出',
    description: '便捷的书签管理工具，可一键导出浏览器书签为多种格式，支持云同步和跨浏览器迁移，帮助您整理和备份重要网站收藏。',
    link: 'https://chromewebstore.google.com/detail/pinece-webext/oloddfdfgpipbngfcohnfpgdallhnoep?authuser=0&hl=zh-CN',
    image: getImage('/pinece.png'),
    type: 'Chrome扩展',
  },
  {
    title: '多域名cookies同步',
    description: '解决多域名网站登录问题的实用工具，自动同步不同域名之间的Cookie信息，提升用户在相关站点间的无缝体验。',
    link: 'https://chromewebstore.google.com/detail/sync-cookies/hcehoofohgpjngheemopifodkamccbij?authuser=0&hl=zh-CN',
    image: getImage('/Sync Cookies.png'),
    type: 'Chrome扩展',
  }
].map(project => ({
  ...project,
  tags: project.tags || [],
  description: project.description || '项目详情即将更新...'
}));

export const hobbies = [
  { name: '编程', icon: '💻', description: '开发有趣的个人项目和贡献开源' },
  { name: '游戏', icon: '🎮', description: '探索沉浸式游戏世界，尤其喜欢开放世界和战略类游戏' },
  { name: '电影', icon: '🎬', description: '欣赏不同类型的电影，偏爱科幻和悬疑题材' },
  { name: '智能家居', icon: '🏠', description: '打造自动化家居环境，研究IoT设备和自动化场景' },
]; 