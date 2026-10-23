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
  trim: {
    zh: 'trim()：去掉字符串首尾的空白字符（空格、Tab、换行），中间的空白保留。Excel 里「标题」和「标题 」（带尾随空格）看起来一样、字符不同，不 trim 就会把它们算成两篇不同论文，判重直接失效。',
    en: 'trim(): strips leading and trailing whitespace (spaces, tabs, newlines) while keeping inner spaces. In Excel “标题” and “标题 ” look identical but differ as strings; without trim they would count as two different papers and dedupe would fail.',
  },
  '\\001': {
    zh: '不可见分隔符：\\001 是 ASCII 控制字符 SOH，正常文本里几乎不会出现，所以用它标出字段边界。必须要有它 —— 否则 "ab"+"c" 和 "a"+"bc" 都拼成 "abc"，两篇不同论文撞成同一个键，后一篇会被当成重复丢掉。也不用 -、|、, 这类常见字符，因为标题里本身就有。',
    en: 'Invisible separator: \\001 is the ASCII SOH control character, practically absent from normal text, so it marks field boundaries. It is required — otherwise "ab"+"c" and "a"+"bc" both become "abc" and two different papers collide, discarding a real record. Common characters like - or | would not work because titles contain them.',
  },
  training_set: {
    zh: '训练集表（学习材料）。内核只从这张表读数据训练模型；交叉验证时它是「去掉当前这一折之后剩下的全部样本」。',
    en: 'The training-set table (the study material). The kernel reads only this table to train; during cross-validation it holds everything except the current fold.',
  },
  testing_set: {
    zh: '测试集表（考卷）。内核训练完读这张表做评估、写报告。内核不会训练它，所以往这张表里放什么，就等于决定了「考什么」—— 这就是客户端能编排交叉验证的原因。',
    en: 'The test-set table (the exam paper). After training the kernel reads it to evaluate and write the report. It is never used for training, so what you put here decides what gets tested — that is exactly why the client can orchestrate cross-validation.',
  },
  cv_source: {
    zh: '快照表：交叉验证开始前，把 training_set 的全量数据原样复制一份进来。之后每一折都从它重建 training_set / testing_set，所以无论跑多少折、中途失败多少次，数据都不会「越跑越少」。',
    en: 'The snapshot table: before cross-validation starts, the whole of training_set is copied here. Every fold rebuilds both tables from this snapshot, so no matter how many folds run or how often a run fails, the data set cannot shrink.',
  },
  FolderName: {
    zh: 'FolderName / FolderPath：样本所属文件夹的名字与路径（用来按目录组织文本库）。testing_set 可能缺这两列，原因是老的单次留出法代码插入时只写了 9 列（FilePath / TextContent / TextLabelName / CreateTime / Model / FileSize / FileType / Status / FileName），没有它们；而建表用的是 CREATE TABLE IF NOT EXISTS，旧库也不会被补列。所以重建两表时必须取「两表都有的列」，否则 INSERT 会因列不匹配直接失败。',
    en: 'FolderName / FolderPath: the name and path of the folder a sample came from (used to organise the text library by directory). testing_set may lack these two columns because the legacy hold-out code only inserted 9 columns (FilePath, TextContent, TextLabelName, CreateTime, Model, FileSize, FileType, Status, FileName); and since tables are created with CREATE TABLE IF NOT EXISTS, old databases never gain the columns. That is why rebuilding the two tables must use only the columns they share, or the INSERT fails on a column mismatch.',
  },
  折: {
    zh: '折（fold）：把数据分成 K 份，每一份就叫一折。跑第 i 折时，这一折当考卷（testing_set），其余 K-1 折当学习材料（training_set），跑完换下一折。K 折就跑 K 次，每条数据恰好当一次考卷。',
    en: 'A fold: one of K slices of the data. When running fold i, that slice is the exam paper (testing_set) and the other K-1 slices are the study material (training_set), then it moves to the next fold. K folds means K runs, and each sample is examined exactly once.',
  },
  SQLite: {
    zh: 'SQLite：文件型嵌入式数据库 —— 整个库就是一个文件（这里是 Resources\\BigModel\\SqliteData_Temp.sqlite），不用起服务、不用连网络，进程直接开文件读写；支持事务。这里它扮演「客户端和内核之间唯一的交换介质」。',
    en: 'SQLite: an embedded, file-based database — the whole database is one file (here Resources\\BigModel\\SqliteData_Temp.sqlite) with no server and no network; processes just open the file, and transactions are supported. It acts as the only exchange medium between the client and the kernel.',
  },
  交换介质: {
    zh: '交换介质：客户端（C# 进程）和训练内核（独立 exe）是两个进程，谁都没法直接读对方的内存。它们唯一能共享的东西是磁盘上的一个文件，所以数据必须先落到这个文件里，对方才能读到 —— 这就是「交换介质」的含义，也是为什么切折要写数据库、而不是"把数据传给内核"。',
    en: 'Exchange medium: the client (a C# process) and the training kernel (a separate exe) cannot read each other’s memory. The only thing they can share is a file on disk, so data must be written there first for the other side to read it — that is what the medium means, and why splitting folds means writing a database rather than "passing data to the kernel".',
  },
  dev_set: {
    zh: 'dev_set（预测集/应用集）：给"应用模型"用的表 —— 把待预测的文本放进去，内核跑完把预测标签 PreLabel 写回同一张表。它本来是用户自己的数据，所以交叉验证要临时借用它收集折外预测时，必须先备份（SnapshotDevSet）、跑完还原（RestoreDevSet），否则用户的数据就被覆盖了。',
    en: 'dev_set (the prediction table): used by "apply model" — you put texts in, the kernel writes predicted labels (PreLabel) back into the same table. It normally holds the user’s own data, so when cross-validation borrows it to collect out-of-fold predictions it must snapshot first (SnapshotDevSet) and restore afterwards (RestoreDevSet), or the user’s data is overwritten.',
  },
}
