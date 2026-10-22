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
  判重键: {
    zh: '判重键：把「是不是同一篇论文」变成「字符串是不是相等」。用 标题 + 期刊 + 发表日期 + paperId 四段拼成一个字符串（用不可见字符分隔），同一篇算出同一个键，不同篇算出不同的键。于是判重就退化成一次字符串比较。',
    en: 'Dedupe key: turns “is this the same paper” into “are these strings equal”. Title + journal + publish date + paperId are concatenated (with an invisible separator); the same paper yields the same string. Dedupe then becomes a plain string comparison.',
  },
  已有判重键: {
    zh: '已有判重键：库里那些论文各自算出来的键的集合。因为库里存着 title / journalName / publishDate / paperId，所以能反算出每条记录的键；把它们一次性取进内存 HashSet，每行只需要 contains(key) 判断，不用逐行查库。',
    en: 'Existing keys: the set of keys computed from records already in the database. Those four fields are stored, so each record’s key can be derived; pulling them into an in-memory HashSet once lets each row be checked with contains(key) instead of a query per row.',
  },
  懒加载: {
    zh: '懒加载：不是一进方法就把 5 个集合全查一遍，而是第一次真的要用某个集合的名单时才去查那一个集合，并且只查一次、结果缓存复用（computeIfAbsent）。因为一个文件可能被分到 5 个集合，这次实际只涉及其中 2 个。',
    en: 'Lazy loading: instead of querying all five collections up front, a collection’s key set is fetched the first time it is actually needed, once, then reused (computeIfAbsent). One file may fan out into five collections while only two are involved this run.',
  },
  投影: {
    zh: '投影（projection）：查询时指定只返回哪几个字段，而不是把整条文档传回来。判重只需要 4 个小字段，但一条论文文档里还有整篇正文 HTML、摘要、关键词等几十 KB；不投影的话，一万条就是几百 MB 的传输和内存。',
    en: 'Projection: telling the query which fields to return instead of shipping the whole document. Dedupe needs only four small fields, while a paper document also carries the full-text HTML, abstract and keywords. Without projection, ten thousand records means hundreds of MB moved and held.',
  },
  seen: {
    zh: 'seen 集合：一个内存 HashSet，记录「本次导入已经接受过哪些判重键」。因为这一批数据要循环结束才统一写库，解析第 500 行时第 10 行还没进库、查库查不到，只能靠这个内存集合拦住同一个文件内部的重复行。',
    en: 'The seen set: an in-memory HashSet of dedupe keys already accepted in this run. The batch is only written after the loop finishes, so while parsing row 500 the row 10 record is not in the database yet — an in-memory set is the only way to catch duplicates inside the same file.',
  },
  已接受的行: {
    zh: '已接受的行：已经通过判重检查、被放进待写入队列的那一行。它的判重键会被加进 seen，因此这一批里再出现同一篇就会被判为重复跳过。',
    en: 'An accepted row: one that passed the dedupe check and was put into the pending-write queue. Its key goes into seen, so the same paper appearing later in the same batch is skipped.',
  },
}
