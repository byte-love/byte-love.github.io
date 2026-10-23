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
  标签: {
    zh: '标签（label）：训练数据里预先给好的「正确答案」—— 这条文本属于哪一类。一条样本 = 一段文本 + 一个标签（如 正面 / 负面），模型学的就是「看到这样的文本该输出哪个标签」。评估指标全是在标签和预测值之间比对算出来的。',
    en: 'A label: the pre-assigned correct answer in training data — which class this text belongs to. One sample = a text plus a label (e.g. positive / negative); the model learns which label to output for a text. Every metric is computed by comparing labels with predictions.',
  },
  分层: {
    zh: '分层（stratified）：切数据时按标签比例切，而不是整体随机切。比如正负样本各 12 条，分层后每一折都按比例含正负样本；不分层则可能某一折全是正例，那一折的训练集就没见过负例。',
    en: 'Stratified: splitting by label ratio instead of randomly over the whole set. With 12 positive and 12 negative samples, each fold then contains both classes in proportion; without stratification a fold could be all positive and its training set would never see a negative example.',
  },
  'Fisher-Yates': {
    zh: 'Fisher-Yates 洗牌：原地随机打乱数组的经典算法 —— 从最后一位往前，每次把它和「它自己及之前」的随机一位交换。它是均匀随机的（每种排列概率相同，不是随手 sort 假洗牌），且不需要额外数组；配合固定种子，同一份数据每次洗出来的顺序完全一致，这就是「可复现」的来源。',
    en: 'Fisher-Yates shuffle: the classic in-place shuffling algorithm — walk from the last index backwards, swapping each element with a uniformly random earlier-or-equal one. It is uniformly random (every permutation equally likely, unlike a "sort by random key" hack) and needs no extra array; with a fixed seed the same data always shuffles identically, which is where reproducibility comes from.',
  },
  LabelEncoder: {
    zh: 'LabelEncoder：内核里把「标签文字」映射成「数字编号」的组件（正面→1、负面→0）。它只用训练集出现过的标签来建映射，所以测试集里一旦出现训练集没见过的标签，它没法编码，内核直接返回 accuracy 0.0000 且不报错 —— 这不是训练失败，是「没见过这个标签」。',
    en: 'LabelEncoder: the kernel component mapping label text to numeric ids. It builds the mapping only from labels present in the training set, so a label unseen in training cannot be encoded: the kernel returns accuracy 0.0000 with no error. Not a training failure — simply an unseen label.',
  },
  空折: {
    zh: '空折：某一折里一条样本都没有。它不会「少考一点」，而是在重建数据集时让测试集为空，随后直接抛异常、整轮交叉验证中断。所以要有兜底逻辑把样本从最多的折挪一条过来。',
    en: 'An empty fold: a fold with zero samples. It does not merely test less — it leaves the test set empty when rebuilding the tables, which throws and aborts the whole run. Hence the fallback that moves a sample over from the largest fold.',
  },
  折外预测: {
    zh: '折外预测（out-of-fold prediction）：某条样本在「它自己没参与训练的那一折」里被预测出的结果。因为每条样本恰好当一次考卷，收集起来就得到「每条样本都被模型在没见过的数据上预测过一次」的完整集合 —— 这是留一法算指标的唯一原料。',
    en: 'Out-of-fold prediction: the prediction a sample receives in the fold where it was not part of training. Since each sample is examined exactly once, collecting them yields predictions for every sample made on unseen data — the only raw material for LOOCV metrics.',
  },
  混淆矩阵: {
    zh: '混淆矩阵：一张「真实标签 × 预测标签」的计数表。准确率、precision、recall、F1、support 都是先由它算出来的。把多折的预测先汇总成一张混淆矩阵再算指标，就是「折外汇总」口径；每折算完再平均，就是「各折平均」口径。',
    en: 'Confusion matrix: a count table of true label × predicted label. Accuracy, precision, recall, F1 and support are all derived from it. Pooling all folds into one matrix then computing is the "pooled out-of-fold" protocol; computing per fold and averaging is the "average of folds" protocol.',
  },
  support: {
    zh: 'support：某一类在真实标签里实际有多少条样本。按折平均时 support 会被各折的样本量稀释（留一每折只有 1 条时尤其离谱），所以汇总口径要把各折 support 相加，才等于这一类的真实条数。',
    en: 'support: how many samples of a class actually exist in the ground truth. Averaging across folds dilutes it (badly when each fold holds a single sample), so the pooled protocol sums support across folds to recover the true class count.',
  },
  'Macro F1': {
    zh: 'Macro F1：先算每个类别的 F1，再对类别取平均 —— 每个类别权重相同，小类不会被大类淹没。与之相对的是 Weighted F1，按各类样本数加权，样本多的类影响更大。两个口径一起看，才知道模型是不是只顾着多数类。',
    en: 'Macro F1: compute each class’s F1, then average over classes — every class weighs the same, so small classes are not drowned out. Weighted F1 instead weights by class support. Reading both tells you whether the model only serves the majority class.',
  },
  留一法: {
    zh: '留一法（LOOCV）：K 折的极端形式 —— 每次只留 1 条样本当考卷、其余全部训练，重复 N 次（N = 样本数）。优点是几乎用上全部数据训练，适合小样本；缺点是训练次数等于样本数，而且每折考卷只有 1 条，逐类指标必须换成「折外汇总」口径才不会失真。',
    en: 'Leave-one-out (LOOCV): the extreme of K-fold — each round holds out exactly one sample as the exam and trains on the rest, repeated N times. Great for tiny datasets since almost all data is used for training; expensive because it trains N times, and the single-sample exam means per-class metrics must use the pooled protocol.',
  },
  哈希标签: {
    zh: '哈希标签（hash tag）：Redis 集群按 Key 的哈希值分配槽位（slot）。Key 里 {} 包住的部分会被当作"标签"，只对标签内容做哈希 —— 所以 {活动id%10} 能保证同一活动的库存、限领、同步三个 Key 都落在同一个节点。Lua 脚本要求脚本里用到的所有 Key 在同一节点，否则直接报错。',
    en: 'Hash tag: a Redis cluster assigns slots by hashing the key, but the part inside {} is treated as the tag and only that is hashed. So {id%10} keeps the stock, limit and sync keys of one activity on the same node — required because a Lua script may only touch keys on a single node.',
  },
  分片: {
    zh: '分片（sharding）：把一个大 Key 拆成多个小 Key 分散存。这里按 活动id % 10 拆成 10 个 Hash，避免单个 Hash 不断变大 —— 大 Key 会让单次操作变慢、迁移和删除都变困难。',
    en: 'Sharding: splitting one oversized key into several smaller ones. Here activity id modulo 10 yields ten hashes, preventing any single hash from growing into a "big key" that slows operations and complicates migration.',
  },
  HSETNX: {
    zh: 'HSETNX：Redis 命令，「只有 field 不存在时才写入」，返回 1 表示写入成功、0 表示已存在。用它写同步队列，能避免同一用户同一活动的记录被重复入队或互相覆盖。',
    en: 'HSETNX: a Redis command that writes a hash field only if it does not exist yet — returns 1 when written, 0 when it already existed. Used for the sync queue so the same user/activity pair is never enqueued twice or overwritten.',
  },
  HINCRBY: {
    zh: 'HINCRBY：Redis 命令，对 Hash 里某个 field 做原子加减（这里是库存 -1），返回运算后的值。原子性由 Redis 单线程执行保证，所以扣库存不需要额外加锁。',
    en: 'HINCRBY: a Redis command that atomically adds to a hash field (here stock -1) and returns the new value. Atomicity comes from Redis executing commands on a single thread, so no extra lock is needed.',
  },
  SynchronousQueue: {
    zh: 'SynchronousQueue：Java 线程池的一种阻塞队列 —— 它自己不存任务，来了任务必须立刻交给一个线程，没有空闲线程就新建（直到最大线程数）。适合「任务数量固定、希望立刻并行」的场景，代价是没有任何缓冲。',
    en: 'SynchronousQueue: a thread-pool queue that stores nothing — each submitted task must be handed to a thread immediately, creating one if needed up to the maximum. Good when parallelism matters more than buffering; there is no buffer at all.',
  },
  拒绝策略: {
    zh: '拒绝策略：线程池「线程数到上限 + 队列也满」时怎么处理新任务。默认是抛异常；这里用 DiscardPolicy 直接丢弃 —— 因为最多只有 10 个队列，正常情况下不会丢有效任务，丢的只可能是重复投递。',
    en: 'Rejection policy: what the pool does when threads are maxed out and the queue is full. Default is to throw; here DiscardPolicy silently drops, acceptable because there are at most ten queues so a valid task is unlikely to be dropped — only duplicates could be.',
  },
  对账: {
    zh: '对账（reconciliation）：让两个数据源互相核对、找出并修正差异。这里每天凌晨以 MySQL 为准修正 Redis 库存、补做漏掉的领取记录，是「最终一致性」的兜底手段 —— 前面的重试解决常见失败，对账解决「重试也没修好」的残留。',
    en: 'Reconciliation: comparing two data sources and fixing the differences. Nightly the store of record (MySQL) corrects Redis stock and replays missing claims — the fallback for eventual consistency, covering what retries could not fix.',
  },
  事务: {
    zh: '事务：一组操作要么全部生效、要么全部不生效。比如「插入领券记录 + 扣减库存」必须在一个事务里，否则会出现只扣了库存却没发券（或反过来）的半成功状态。',
    en: 'A transaction: a group of operations that either all take effect or none do. Inserting the claim record and decrementing stock must share one transaction, otherwise a half-applied state appears (stock decremented without a voucher, or the reverse).',
  },
  书签: {
    zh: '书签（bookmark）：记录「已经同步到哪一条」的游标值，下次从它继续，避免每次全量重来。书签太旧会重复拉数据，太新会漏数据，所以推进它必须能证明这段数据已经同步过。',
    en: 'A bookmark: a cursor recording how far the sync has got, so the next run resumes instead of starting over. Too old duplicates rows, too new skips them — advancing it requires proof that the span was actually synced.',
  },
  ObjectId: {
    zh: 'ObjectId：MongoDB 文档默认的 _id 类型，12 字节，前 4 字节是生成时间戳，所以按它排序大致等于按时间排序 —— 可以拿它当增量同步的断点。缺点是同一秒内并发写入的先后不严格，严格场景要用（时间戳, ObjectId）复合断点。',
    en: 'ObjectId: MongoDB’s default _id, 12 bytes, whose first 4 bytes are a timestamp — so ordering by it approximates time ordering and it works as an incremental sync cursor. Within one second concurrent writes are not strictly ordered, so strict cases use a composite (timestamp, ObjectId) cursor.',
  },
  'N+1': {
    zh: 'N+1 查询：先查一次拿到 N 条记录，再为每条记录各查一次关联数据，总共 N+1 次查询。行数一多就炸；正确做法是一次把关联数据批量取回，在内存里拼。',
    en: 'The N+1 problem: one query returns N rows, then one more query per row for related data. It collapses as N grows; the fix is to batch-fetch the related data once and join in memory.',
  },
  autoSizeColumn: {
    zh: 'autoSizeColumn：POI 里按内容自动调整列宽的方法。它需要能看到整列内容才能算宽度；而 SXSSF 是流式写、历史行早已刷到磁盘临时文件，所以不支持事后调用，只能预设固定列宽。',
    en: 'autoSizeColumn: a POI method that sizes a column to its content. It needs the whole column visible to measure; SXSSF streams rows to a temp file, so it cannot be used afterwards and fixed widths must be preset.',
  },
  'Pattern.quote': {
    zh: 'Pattern.quote：Java 里把一段字符串转义成「正则字面量」的方法。用户输入可能含 .、(、* 这些正则元字符，不转义就会被当成语法 —— 轻则查错，重则正则回溯把 CPU 打满。',
    en: 'Pattern.quote: a Java helper that escapes a string so it matches literally. User input can contain regex metacharacters such as . or ( — unescaped they change the pattern, and in bad cases cause catastrophic backtracking.',
  },
  '定长 CHAR': {
    zh: '定长 CHAR：SQL Server 的固定长度字符类型，存 "abc" 到 CHAR(10) 会补齐 7 个空格。迁到别的库后这些空格还在，于是 = \'abc\' 这种等值查询永远不命中 —— 必须先 trim，或者改用锚定正则容忍空白。',
    en: 'Fixed-width CHAR: SQL Server pads values to the column length, so "abc" in CHAR(10) carries seven trailing spaces. After migration those spaces remain and equality filters never match — either trim the data or match with an anchored regex that tolerates whitespace.',
  },
  DecimalFormat: {
    zh: 'DecimalFormat：Java 的数字格式化类，new DecimalFormat("#.##") 表示最多两位小数、去掉多余的 0。它只改变「显示成什么样」，不改变底层数值 —— 所以挡不住 double 的精度损失。',
    en: 'DecimalFormat: Java’s number formatter; new DecimalFormat("#.##") keeps at most two decimals. It changes how the value is displayed, not the value itself — so it cannot recover precision already lost in a double.',
  },
  sp_rename: {
    zh: 'sp_rename：SQL Server 的系统存储过程，用来给表或列改名。它可以在事务里执行、随事务回滚，所以「先把现表改名成备份、再建新表」这种做法才是安全的。',
    en: 'sp_rename: a SQL Server system procedure for renaming tables or columns. It can run inside a transaction and roll back with it, which is what makes "rename the live table to a backup, then create a fresh one" safe.',
  },
  DDL: {
    zh: 'DDL（数据定义语言）：CREATE / ALTER / DROP / TRUNCATE / sp_rename 这类改结构的语句。关键差别在于「能不能被事务包住并回滚」—— SQL Server 可以，Oracle 和 MySQL 的 DDL 会隐式提交，删了建不回来。',
    en: 'DDL (data definition language): statements that change structure — CREATE, ALTER, DROP, TRUNCATE, sp_rename. What matters here is whether they participate in a transaction: SQL Server allows it, while Oracle and MySQL commit DDL implicitly, so a dropped table cannot be restored.',
  },
  'Sch-M': {
    zh: 'Sch-M 锁（架构修改锁）：执行 DDL 时数据库加的锁，防止别人在你改结构的同时读写这张表。它会一直持有到事务结束，所以整表重建期间读这张表会被阻塞。',
    en: 'Sch-M lock (schema modification): taken by DDL to prevent concurrent reads and writes of the table being restructured. Held until the transaction ends, so readers block for the whole rebuild.',
  },
  墓碑: {
    zh: '墓碑（tombstone）：删除时不做物理删除，只打一个「已删除」标记，那条记录就叫墓碑。它的作用是拦住「删除被逆向流程撤销」—— 归档里那条记录还在，只有墓碑能证明它是被主动删掉的，不该被补回来。',
    en: 'A tombstone: deletion is a flag rather than a row removal, and that flagged record is the tombstone. It stops a deletion from being undone by a merge — the archived row still exists, and only the tombstone proves it was deleted on purpose.',
  },
  归档集合: {
    zh: '归档集合（大写、只读）：历史遗留数据存放的地方，只读不改，作为兜底。推送时它只负责补「工作集合里缺失」的记录，不能覆盖工作集合里的新数据。',
    en: 'Archive collection (uppercase, read-only): where legacy data lives, never modified, acting as a fallback. During a push it only fills gaps the working collection lacks and never overrides fresher data there.',
  },
  工作集合: {
    zh: '工作集合（小写）：用户当前在用的集合，标注和修改都发生在这里。合并时它优先级最高，因为里面的关联字段是用户最新改过的。',
    en: 'Working collection (lowercase): the one currently in use, where annotation and edits happen. It wins in a merge because its links are the user’s latest changes.',
  },
  PyMuPDF: {
    zh: 'PyMuPDF（import fitz）：基于 MuPDF 的 Python PDF 库。抽正文速度最快、字符覆盖最全、能保留标点间距；但它不理解表格结构，表头和数据会被当成普通文本。',
    en: 'PyMuPDF (import fitz): a Python PDF library on top of MuPDF. Fastest at body text, best character coverage, preserves spacing and punctuation — but it does not understand table structure.',
  },
  pdfplumber: {
    zh: 'pdfplumber：Python 的 PDF 表格抽取库，按格线识别表格、能还原合并单元格；但用它抽正文会把句子切碎（它按位置分块，不按语义换行）。所以正文交给 PyMuPDF，表格交给它。',
    en: 'pdfplumber: a Python library that finds tables by their ruling lines and reconstructs merged cells. Its body-text extraction shreds sentences (it chunks by position, not by prose), so PyMuPDF handles prose and pdfplumber handles tables.',
  },
  colspan: {
    zh: 'colspan：HTML 表格里「这一格横跨几列」的属性。PDF 里的合并单元格被抽出来后，必须靠 colspan 还原，否则后续列全部左移、整张表错位。',
    en: 'colspan: the HTML table attribute saying how many columns a cell spans. Merged cells extracted from a PDF must be restored as colspan, otherwise every following column shifts left and the table misaligns.',
  },
  '起始偏移': {
    zh: '起始偏移：每个标签发牌时随机选一个起点折（offset），避免这条标签的余数样本都堆在前几折，而是均匀铺满各折。',
    en: 'Start offset: a randomly chosen starting fold per label, so a label’s leftover samples spread across folds instead of piling into the first few.',
  },
}
