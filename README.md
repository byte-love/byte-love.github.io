# Portfolio site

个人作品集站。静态站，中英双语，用来展示代表项目和动手做的东西。

## 技术栈

- [Astro 5](https://astro.build) —— 纯静态输出，无运行时框架
- 无 UI 库、无 CSS 框架：一个 `global.css` 手写，深色模式跟随系统
- 文案与数据全在 `src/` 的 TS 文件里，改内容不用碰模板

## 本地跑

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
npm run preview  # 预览构建结果
```

> Windows 上如果 `npm` 调用异常，用 `npm.cmd`。

## 目录

```text
src/
  data/projects.ts     所有项目（中英文两套文案，一条一个对象）
  data/diy.ts          「动手做的」条目（现在还是占位）
  i18n/ui.ts           界面文案字典（zh / en）
  layouts/Base.astro   页头 + 页脚 + 语言切换
  components/          首页、项目详情、项目卡片
  pages/index.astro            中文首页 /
  pages/projects/[slug].astro  中文详情 /projects/<slug>/
  pages/en/index.astro         英文首页 /en/
  pages/en/projects/[slug].astro  英文详情 /en/projects/<slug>/
  styles/global.css
```

## 加一个项目

只改 `src/data/projects.ts`，追加一个对象：

```ts
{
  slug: 'my-project',                 // 会成为 URL：/projects/my-project/
  title:       { zh: '…', en: '…' },
  subtitle:    { zh: '一句话说明', en: '…' },
  role:        { zh: '我负责什么', en: '…' },
  period: '2026.10',
  stack: ['Java', 'Spring Boot'],
  problem:     { zh: '约束是什么', en: '…' },
  action:      { zh: ['我做的第一步', '第二步'], en: ['…'] },
  result:      { zh: ['一个数字'], en: ['…'] },
  repo: 'https://github.com/…',
  featured: true,
}
```

写文案的三条：

1. **problem 写约束**，不写背景介绍。面试官只关心"当时什么条件限制了你"。
2. **result 必须带数字**，没有数字就说明这件事没做完。
3. 每条都要经得起追问——写不进简历的东西就别放这里。

## 语言切换

两个语言是各自独立的静态页面，不靠 JS 切换：

- `/` 中文，`/en/` 英文
- 每页右上角互跳，详情页会跳到对应语种的同一篇
- 新增文案时，`src/i18n/ui.ts` 和 `src/data/projects.ts` 里两个语种都要补齐

## 部署

构建产物是纯静态的，`dist/` 扔哪都能跑。

**GitHub Pages**（推荐，国内访问相对稳）：

1. 推到 GitHub 后，仓库 Settings → Pages → Source 选 GitHub Actions，选 Astro 模板
2. 或者本地 `npm run build`，把 `dist/` 推到 `gh-pages` 分支

**Cloudflare Pages**：连仓库，构建命令 `npm run build`，输出目录 `dist`。

**不建议 Vercel**：`*.vercel.app` 在国内经常打不开，投国内公司时体验很差。

部署后记得把 `astro.config.mjs` 里的 `site` 改成真实域名——它影响 sitemap 和绝对链接。
