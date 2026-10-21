export type Lang = 'zh' | 'en'

export const ui = {
  zh: {
    name: '李杰',
    email: '2941075434@qq.com',
    langSwitch: 'English',
    langSwitchHref: '/en/',
    homeHref: '/',
    navProjects: '项目',
    navDiy: '动手做的',
    navAbout: '关于',
    heroTitle: '后端 / 全栈开发，做过数据管线、运维后台和桌面客户端。',
    heroLead:
      '企业级开发：Spring Boot 后台、Vue 前端、跨库数据同步、桌面端 AI 能力接入，也写过跑上千万行的数据处理流水线。',
    heroMeta: ['Java / Spring Boot', 'Vue 3', 'Python 数据工程', '.NET / WPF', '微信小程序'],
    sectionProjects: '实习项目',
    projectsNote:
      '2026 年实习期间的项目，均已脱敏：公司名、域名、内网地址、真实凭据已替换。涉及商业机密的项目不在其中，只保留本人全栈负责的，或参与项目中本人所写的部分。',
    sectionDiy: '动手做的',
    sectionAbout: '关于',
    aboutText:
      '做后端为主，也做前端和桌面端。动手前先把约束搞清楚：能不能改上游、数据有多少行、失败会怎样。',
    aboutContact: '联系方式',
    emailLabel: '邮箱',
    repoLink: '看代码 →',
    detailBack: '← 返回项目列表',
    problemLabel: '问题',
    actionLabel: '我做的',
    resultLabel: '结果',
    shotsLabel: '界面',
    stackLabel: '技术栈',
    periodLabel: '时间',
    roleLabel: '角色',
    repoLabel: '仓库',
    diyPlaceholder: '待补：一张照片 / 一段 15 秒视频 + 一句话说明 + 踩到的坑',
  },
  en: {
    name: 'Jie Li',
    email: '2941075434@qq.com',
    langSwitch: '中文',
    langSwitchHref: '/',
    homeHref: '/en/',
    navProjects: 'Projects',
    navDiy: 'Things I built',
    navAbout: 'About',
    heroTitle: 'Backend / full-stack developer. Data pipelines, ops consoles, desktop clients.',
    heroLead:
      'Enterprise development: Spring Boot services, Vue front-ends, cross-database sync, AI features in desktop apps, and data pipelines processing tens of millions of rows.',
    heroMeta: ['Java / Spring Boot', 'Vue 3', 'Python data', '.NET / WPF', 'WeChat mini-program'],
    sectionProjects: 'Internship work',
    projectsNote:
      'Internship projects, 2026. Sanitized: company names, domains, internal hosts and credentials replaced. Commercially sensitive work is omitted — only what I owned end-to-end, or the parts I wrote myself.',
    sectionDiy: 'Things I built',
    sectionAbout: 'About',
    aboutText:
      'Backend-first, with front-end and desktop work. I pin down the constraints before writing code: can upstream be changed, how many rows are there, what happens when it fails.',
    aboutContact: 'Contact',
    emailLabel: 'Email',
    repoLink: 'Code →',
    detailBack: '← All projects',
    problemLabel: 'Problem',
    actionLabel: 'What I did',
    resultLabel: 'Result',
    shotsLabel: 'Screens',
    stackLabel: 'Stack',
    periodLabel: 'Period',
    roleLabel: 'Role',
    repoLabel: 'Repo',
    diyPlaceholder: 'TODO: a photo / 15s clip + one sentence + the trap you hit',
  },
} as const

export function t(lang: Lang) {
  return ui[lang]
}
