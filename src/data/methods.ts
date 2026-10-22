import type { Lang } from '../i18n/ui'

type L = Record<Lang, string>

/**
 * 方法名表：<code> 里出现的函数/类名，命中这里就在名字上挂可悬停解释。
 * 键必须是代码里的原名，大小写一致。
 */
export const methods: Record<string, L> = {
  getByHeader: {
    zh: '自己写的取值工具方法：在「列名 → 列号」映射里按顺序试候选列名，命中哪个就用它的列号去取这一格的内容；全都没命中返回 null（不是抛异常）。\n之所以要「一串候选名」，是因为上游有中文、英文两套表头，同一个字段名字不一样。',
    en: 'A small helper of mine: it walks the name → index map through the candidate header names, uses the first one that exists to read that cell, and returns null (never throws) when none match. The candidate list exists because upstream ships both Chinese and English header sets.',
  },
  buildHeaderMap: {
    zh: '读第 1 行、建立「列名 → 列号」映射的方法：逐列取表头文字，trim 后放进 LinkedHashMap（顺带保留列序），空列名跳过。',
    en: 'Reads row 1 and builds the name → index map: each header cell is trimmed and put into a LinkedHashMap (preserving column order); blank headers are skipped.',
  },
  SXSSFWorkbook: {
    zh: 'POI 里的流式 xlsx 工作簿：构造参数是「内存里保留多少行」，超出的行刷到磁盘临时文件，因此导出几百万行也不会 OOM。用完要 dispose() 删临时文件。',
    en: 'POI’s streaming xlsx workbook: the constructor argument is how many rows stay in memory, the rest is flushed to temp files, so exporting millions of rows will not OOM. Call dispose() afterwards to remove those files.',
  },
  getCellString: {
    zh: '把单元格转成字符串的方法：按单元格类型分支处理（字符串 trim、数字用 DecimalFormat 格式化、布尔转字面量、公式取缓存值），空单元格返回 null。',
    en: 'Converts a cell to a string by type: strings are trimmed, numbers go through DecimalFormat, booleans become literals, formulas read the cached value; empty cells return null.',
  },
}
