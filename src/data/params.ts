import type { Lang } from '../i18n/ui'

type L = Record<Lang, string>

/**
 * 代码参数表：页面上 <code> 里出现的函数调用，实参命中这里就挂一个可悬停的解释。
 * 键是实参原文（去掉首尾空格），例如 row / hdr / "标题"。
 */
export const params: Record<string, L> = {
  row: {
    zh: '当前正在读的这一行数据（POI 的 Row 对象）。取值就是从这个 Row 上按列号拿 Cell。',
    en: 'The data row currently being read (a POI Row). Values are pulled from this row by column index.',
  },
  hdr: {
    zh: '第 1 行建好的「列名 → 列号」映射（代码里叫 headerMap）。hdr.get("标题") 得到的就是标题所在列号；查不到返回 null。',
    en: 'The name → index map built from row 1 (called headerMap in the code). hdr.get("标题") returns the column index, or null when missing.',
  },
  '"标题"': {
    zh: '候选列名之一：中文表头里标题那一列的名字。',
    en: 'First candidate header name: the title column in a Chinese spreadsheet.',
  },
  '"PaperTitle"': {
    zh: '候选列名之二：英文表头里标题那一列。中文名找不到时，就用这个名字去查映射。',
    en: 'Second candidate header name: the title column in an English spreadsheet. Used when the Chinese name is absent.',
  },
  200: {
    zh: 'SXSSF 保留在内存里的滑动窗口行数：只留 200 行，其余刷到磁盘临时文件，所以内存不随导出行数增长。',
    en: 'SXSSF sliding-window size: only 200 rows stay in memory, the rest is flushed to a temp file, so memory does not grow with row count.',
  },
  'KEYS[1]': {
    zh: 'Lua 脚本的第 1 个 key，由 Java 侧 execute 时按顺序传入：这里指抢券同步队列。',
    en: 'First key passed to the Lua script by the Java caller: here, the grab sync queue.',
  },
  'KEYS[2]': {
    zh: 'Lua 脚本的第 2 个 key：库存 Hash。脚本对它做 HGET 校验、HINCRBY 扣减。',
    en: 'Second key: the stock hash. The script HGETs it for the check and HINCRBYs it for the decrement.',
  },
  'KEYS[3]': {
    zh: 'Lua 脚本的第 3 个 key：抢券成功队列，用来拦同一用户重复领取。',
    en: 'Third key: the success queue, used to block duplicate claims by the same user.',
  },
  'ARGV[1]': {
    zh: 'Lua 脚本的第 1 个参数（不是 key）：活动 id，用来定位库存 Hash 里的 field。',
    en: 'First argument (not a key): the activity id, locating the field inside the stock hash.',
  },
  'ARGV[2]': {
    zh: 'Lua 脚本的第 2 个参数：用户 id，用作限领校验和同步队列的 field。',
    en: 'Second argument: the user id, used as the field for both the limit check and the sync queue.',
  },
}
