import type { Lang } from '../i18n/ui'

type L = Record<Lang, string>

/** 术语表：页面上出现这些词时，后面挂一个 ? 角标，悬停显示解释 */
export const glossary: Record<string, L> = {
  POI: {
    zh: 'Apache POI：Java 读写 Microsoft Office 文件的开源库。HSSF 读 .xls；XSSF 读写 .xlsx（整个文件读进内存）；SXSSF 流式写 .xlsx。POI 把文件解析成 Workbook → Sheet → Row → Cell 对象，取格子只能按列号 getCell(n)，不能按列名。',
    en: 'Apache POI: an open-source Java library for reading and writing Microsoft Office files. HSSF handles .xls, XSSF handles .xlsx (whole file in memory), SXSSF streams .xlsx writes. It parses a workbook into Workbook → Sheet → Row → Cell objects, so a cell is addressed by index (getCell(n)), never by column name.',
  },
  SXSSF: {
    zh: 'SXSSF：POI 里专门用来「流式写」xlsx 的实现。内存中只保留一个滑动窗口（这里是 200 行），超出的行刷到磁盘临时文件，所以内存不随行数增长；代价是不能事后 autoSizeColumn，临时文件要 dispose() 清理。',
    en: 'SXSSF: the streaming xlsx writer in POI. Only a sliding window of rows (200 here) stays in memory; the rest is flushed to a temp file, so memory stays flat regardless of row count. Trade-offs: no autoSizeColumn afterwards, and dispose() is required.',
  },
  jsoup: {
    zh: 'jsoup：Java 的 HTML 解析与清洗库。用来从抓取到的网页里取节点、生成干净的 HTML，也能做转义，避免把上游文本直接拼进页面。',
    en: 'jsoup: a Java library for parsing and cleaning HTML. Used to pick nodes out of scraped pages, generate clean HTML, and escape text instead of splicing it in raw.',
  },
  jTDS: {
    zh: 'jTDS：SQL Server 的纯 Java JDBC 驱动（老项目里常见）。新项目一般用微软官方的 mssql-jdbc。',
    en: 'jTDS: a pure-Java JDBC driver for SQL Server, common in older projects. Newer projects usually use Microsoft’s mssql-jdbc.',
  },
  Redisson: {
    zh: 'Redisson：Redis 的 Java 客户端，除了基本命令还提供分布式锁（RLock）、看门狗续期、限流器等。这里用它的锁保证同一队列同一时刻只有一个实例在同步。',
    en: 'Redisson: a Redis client for Java that adds distributed locks (RLock), lock watchdog renewal and rate limiters. Here its lock guarantees only one instance syncs a given queue at a time.',
  },
  'XXL-JOB': {
    zh: 'XXL-JOB：分布式任务调度平台。按 cron 触发定时任务，并负责把任务分派到某一台执行器上，这里用它每分钟跑一次同步、每晚跑一次对账。',
    en: 'XXL-JOB: a distributed job scheduler. It triggers tasks on a cron and dispatches each run to one executor. Used here for the per-minute sync and the nightly reconciliation.',
  },
  Lua: {
    zh: 'Lua：轻量脚本语言。Redis 内置 Lua 解释器，一次 EVAL 可以把多条命令打包执行，中间不会插入别的请求（原子），所以常用它做库存扣减这类“先查后改”的操作。注意：脚本中途 return 不会回滚已执行的写命令。',
    en: 'Lua: a lightweight scripting language. Redis embeds a Lua interpreter, so one EVAL runs several commands without interleaving (atomic) — the usual way to do check-then-decrement. Note: a mid-script return does not roll back commands already executed.',
  },
  bbox: {
    zh: 'bbox：bounding box，一段内容在页面上的外接矩形（左上角坐标 + 宽高）。PDF 抽取里用它判断两个引擎是否框到了同一块区域，从而去重。',
    en: 'bbox: bounding box — the rectangle (x, y, width, height) a piece of content occupies on a page. In PDF extraction it is used to detect when two engines captured the same region, so duplicates can be dropped.',
  },
  WebSocket: {
    zh: 'WebSocket：一条全双工长连接，服务端可以主动推数据，不像 HTTP 只能等客户端请求。这里用它做日志增量同步，并把断点落在库里，重连后从断点继续。',
    en: 'WebSocket: a full-duplex persistent connection where the server can push. Used here for incremental log sync, with the bookmark persisted so a reconnect resumes where it stopped.',
  },
}
