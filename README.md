# Portfolio site

个人作品集站。静态站，中英双语，用来展示实习项目与个人项目。

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
  data/projects.ts     所有项目（中英文两套文案，一条一个对象；可带 category / short / diagram / shots）
  data/diy.ts          「动手做的」条目（现在还是占位，占位条目不会渲染）
  i18n/ui.ts           界面文案字典（zh / en）
  layouts/Base.astro   页头 + 页脚 + 语言切换
  components/          首页、项目详情（含灯箱）、项目卡片、左侧项目索引树（ProjectIndex）
  pages/index.astro            中文首页 /
  pages/projects/[slug].astro  中文详情 /projects/<slug>/
  pages/en/index.astro         英文首页 /en/
  pages/en/projects/[slug].astro  英文详情 /en/projects/<slug>/
  styles/global.css
public/
  diagrams/            架构图 SVG（项目详情页顶部）
  shots/               脱敏后的界面截图
  favicon.svg  .nojekyll
.github/workflows/deploy.yml   push 到 main 即自动构建并发布
```

## 加一个项目

只改 `src/data/projects.ts`，追加一个对象：

```ts
{
  slug: 'my-project',                 // 会成为 URL：/projects/my-project/
  title:       { zh: '…', en: '…' },
  short:       { zh: '索引树里的短名', en: '…' },  // 可选，缺省用 title
  category: 'personal',               // 可选：缺省 = 实习项目；personal 进「个人项目」区块
  subtitle:    { zh: '一句话说明', en: '…' },
  role:        { zh: '我负责什么', en: '…' },
  period: '2026.10',
  stack: ['Java', 'Spring Boot'],
  problem:     { zh: '约束是什么', en: '…' },
  action:      { zh: ['我做的第一步', '第二步'], en: ['…'] },
  result:      { zh: ['一个数字'], en: ['…'] },
  repo: 'https://github.com/…',
  featured: true,
  // 可选：架构图（放 public/diagrams/）与界面截图（放 public/shots/）
  diagram: '/diagrams/my-project.svg',
  shots: [
    { src: '/shots/my-project/01.png', caption: { zh: '…', en: '…' } },
  ],
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

## 部署（现役）

线上只有一份，在阿里云 ECS 上，和笔记站同一个 nginx 入口：

- `/` → `/srv/sites/lab`（本站的构建产物）
- `/app/` → 反代 `127.0.0.1:8081`（notes-app）
- `/media/` → 同上

域名 `lab.byte-love.cn` 还在备案，现在用 http://47.104.210.93:8080/ 访问。

**发布方式：本地构建 + 上传产物。**

```bash
npm run build
tar czf dist.tar.gz -C dist .
scp dist.tar.gz root@<服务器>:/root/
# 服务器上解压到 /srv/sites/lab
```

两处都要改时（比如改了站内的 `/app/` 链接），笔记站也要按它自己的流程重新发布一次。

**GitHub Pages 已停用。** 仓库 `byte-love/byte-love.github.io` 只当代码托管用，
里面的 `.github/workflows/deploy.yml` 已经被手动禁用（GitHub Actions 页面可一键恢复），
所以 `git push` 只更新代码，不会再自动发到 Pages。`https://byte-love.github.io/` 上那份是停用前
的旧产物，不要当线上地址用。

`gh-pages` 分支是更早的发布方式，已废弃，远端还留着，删掉不影响任何事。
