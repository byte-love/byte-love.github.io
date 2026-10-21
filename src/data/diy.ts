import type { Lang } from '../i18n/ui'

export type Diy = {
  slug: string
  title: Record<Lang, string>
  desc: Record<Lang, string>
  /** 一张图放 public/diy/<slug>.jpg；没有就先留空，页面会显示占位块 */
  image?: string
}

/**
 * 动手做的东西。写法就三行：
 *   一句话：做了个什么、解决什么小问题
 *   一张图 / 15 秒视频（最重要）
 *   踩到的坑 1~2 句（比成果更可信）
 *
 * 现在放的是占位，等你把清单给我再替换。
 */
export const diy: Diy[] = [
  {
    slug: 'todo-1',
    title: { zh: '待补：第一个 DIY', en: 'TODO: first build' },
    desc: {
      zh: '一句话说明做了个什么、解决什么小问题；配一张图或 15 秒视频；再写一两句踩到的坑。',
      en: 'One sentence on what you built and the small problem it solved, plus a photo or 15s clip and one or two traps you hit.',
    },
  },
  {
    slug: 'todo-2',
    title: { zh: '待补：第二个 DIY', en: 'TODO: second build' },
    desc: {
      zh: '同类内容凑够 3~4 个才有分量；只有 1 个的话建议先放到「关于」里一句话带过。',
      en: 'Three or four of these make the section worth having; with only one, mention it in About instead.',
    },
  },
]
