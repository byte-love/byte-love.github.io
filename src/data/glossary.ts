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
    zh: 'dev_set（本项目里的「应用集」）：三张表的分工是 —— training_set 是课本（有标签，用来学）、testing_set 是考卷（有标签，用来算分）、dev_set 是待批改的作业（没标签，交给模型作答）。把新文本放进 dev_set、以「应用模型」模式调内核，内核会把预测标签写回同一张表的 PreLabel 列，不新增行。注意：它跟教科书里的验证集（validation / dev set）不是一回事，名字是历史沿用。因为它本是用户自己的数据，交叉验证借用它收集折外预测时必须先 SnapshotDevSet 备份、跑完 RestoreDevSet 还原（成功 / 取消 / 异常三条路径都要还原）。',
    en: 'dev_set (the "apply set" in this project): the three tables divide the work — training_set is the textbook (labelled, for learning), testing_set is the exam (labelled, for scoring), dev_set is the ungraded homework (unlabelled, handed to the model). Put new texts into dev_set and run the kernel in "apply model" mode: it writes predictions back into the PreLabel column of the same rows, adding no rows. Note it is not the textbook validation/dev set — the name is legacy. Since it normally holds the user’s own data, cross-validation must snapshot it (SnapshotDevSet) and restore it afterwards (RestoreDevSet), on the success, cancel and error paths alike.',
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
    zh: 'support：某一类在真实标签里实际有多少条样本。它决定了「各折平均」会不会失真 —— 因为平均的分母是「折数」，不是「该类样本数」。举本项目留一的真实数：24 条（12 正 / 12 负），模型预测正面 23 次、答对 11 次。折外汇总的正面 precision = 11/23 = 0.4783；各折平均 = 11/24 = 0.4583，分母从 23 变成折数 24。正面 recall 更明显：汇总 11/12 = 0.9167，各折平均 11/24 = 0.4583 —— 12 条负面样本也被算进了正面召回的分母。',
    en: 'support: how many samples of a class actually exist in the ground truth, and it decides whether averaging folds distorts things — because the average divides by the fold count, not by the class count. Real numbers from this project’s LOOCV: 24 samples (12 positive, 12 negative), the model predicted positive 23 times with 11 correct. Pooled positive precision = 11/23 = 0.4783; averaging folds = 11/24 = 0.4583, the denominator turning from 23 into the fold count 24. Positive recall is starker: pooled 11/12 = 0.9167 versus 11/24 = 0.4583 — the 12 negatives end up in the denominator of positive recall.',
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
  precision: {
    zh: 'precision（精确率 / 查准率）：预测为某一类的样本里，真正属于该类的比例 —— 白话说「你说是正面的，有多少确实是」。分母是「预测为该类的条数」，所以当一条预测都没有时，分母为 0，指标无定义。',
    en: 'precision: of everything predicted as a class, the fraction that really is that class. Its denominator is the number of predictions for the class, so with zero predictions the metric is undefined.',
  },
  recall: {
    zh: 'recall（召回率 / 查全率）：某一类真实样本里被成功找出来的比例 —— 白话说「真正属于这一类的，你抓到了多少」。分母是「该类真实条数」，漏掉的越多召回越低。',
    en: 'recall: of all samples that truly belong to a class, the fraction that was found. Its denominator is the true count of that class, so missing more lowers recall.',
  },
  逐类: {
    zh: '逐类（per-class）：对每一个类别单独算一行指标（正面一行、负面一行：precision / recall / f1 / support），而不是把全部样本混在一起算一个整体数字。整体准确率看不出「模型是不是只会答多数类」，逐类指标能。',
    en: 'Per-class: computing a separate row of metrics for each class (precision / recall / f1 / support) instead of one aggregate over all samples. Overall accuracy cannot reveal a model that only serves the majority class; per-class metrics can.',
  },
  F1: {
    zh: 'F1：precision 与 recall 的调和平均（2PR/(P+R)），两者都高才高 —— 只抓一个准（precision 高但漏一半）或只抓一个全（recall 高但错一堆）都上不去。Macro F1 按类别平均，Weighted F1 按各类样本数加权平均。',
    en: 'F1: the harmonic mean of precision and recall (2PR/(P+R)), high only when both are high. Macro F1 averages over classes; Weighted F1 weights classes by support.',
  },
  sklearn: {
    zh: 'scikit-learn（sklearn）：Python 的机器学习工具库。cross_val_predict 做的正是「折外预测」，classification_report 输出 precision/recall/F1 报表 —— 业界对照标准。说「与 sklearn 口径一致」，意思是同样的预测值算出来的指标数字相同。',
    en: 'scikit-learn: a Python ML library. cross_val_predict produces out-of-fold predictions and classification_report prints per-class precision/recall/F1 — the industry reference. Saying "same as sklearn" means the same predictions yield the same numbers.',
  },
  ROLLBACK: {
    zh: 'ROLLBACK：回滚事务 —— 把这一事务里已经做过的改动全部撤销，数据库回到事务开始前的状态。与之相对的是 COMMIT，提交后永久生效、不能撤销。',
    en: 'ROLLBACK: abort the transaction, undoing everything it changed and returning the database to its state at the start. The opposite of COMMIT, which makes changes permanent.',
  },
  DataFormatter: {
    zh: 'DataFormatter：POI 里「按单元格显示格式取值」的工具 —— 日期、千分位、固定小数位都按 Excel 里看到的样子输出，比手写 DecimalFormat 稳。但它底层取到的仍是 double，挡不住精度损失。',
    en: 'DataFormatter: a POI helper that returns a cell’s text as Excel displays it — dates, thousands separators, fixed decimals — steadier than a hand-written DecimalFormat. It still reads a double underneath, so it cannot undo precision loss.',
  },
  NumberToTextConverter: {
    zh: 'NumberToTextConverter：POI 提供的数字转文本工具，专门把数字转成「不用科学计数法」的字符串（最多 15 位有效数字），比 DecimalFormat("#.##") 更贴近 Excel 显示；同样受 double 精度限制。',
    en: 'NumberToTextConverter: a POI utility that renders numbers as text without scientific notation (up to 15 significant digits). Closer to what Excel shows than DecimalFormat("#.##"), yet still bounded by double precision.',
  },
  stock_num: {
    zh: 'stock_num：活动表里「剩余库存」这一列。扣减语句是 update activity set stock_num = stock_num - 1 where id = ? and stock_num > 0 —— 后半句是兜底：库存已经是 0 时更新 0 行，事务随之回滚，数据库库存永远不会被扣成负数。',
    en: 'stock_num: the remaining-stock column on the activity table. The decrement is "update activity set stock_num = stock_num - 1 where id = ? and stock_num > 0" — the trailing guard means a zero-stock row updates 0 rows and the transaction rolls back, so stock can never go negative.',
  },
  doi: {
    zh: 'doi（Digital Object Identifier）：论文的永久数字标识，形如 10.1016/j.jfineco.2020.01.001。国际期刊表里常有一列 doi，上游也常把它当论文唯一号用 —— 但它可能为空、也可能是链接，所以不能单独拿来做判重键。',
    en: 'doi (Digital Object Identifier): a paper’s permanent identifier, e.g. 10.1016/j.jfineco.2020.01.001. International sheets usually have a doi column and upstream often treats it as the paper id — but it can be empty or a URL, so it cannot be the only dedupe key.',
  },
  En_Log: {
    zh: 'En_Log：英文版的操作日志表，字段结构与中文日志表一致，同步进同一个视图、用语言列区分。它的 _id 也是自增的，所以断点改用 ObjectId，避免和中文表的 id 值域撞在一起。',
    en: 'En_Log: the English operation-log table with the same shape as the Chinese one, synced into the same view and distinguished by a language column. Its _id auto-increments too, so the sync uses ObjectId as the cursor to avoid colliding with the Chinese table’s id range.',
  },
  PreLabel: {
    zh: 'PreLabel：dev_set 里存「模型预测出的标签」的列。应用模型跑完后，内核把每条文本的预测结果写回这一列，客户端读它、再和真实标签比对，自己算混淆矩阵与指标。',
    en: 'PreLabel: the dev_set column holding predicted labels. After "apply model" runs, the kernel writes each text’s prediction here; the client reads it and compares against ground truth to compute the confusion matrix itself.',
  },
  OOM: {
    zh: 'OOM（Out Of Memory）：内存耗尽、进程被系统杀掉。全量读入 + 全量驻留内存的写法在行数一多时必炸，流式读写（游标读 + 滑窗写）存在的意义就是避免它。',
    en: 'OOM (out of memory): the process is killed after exhausting memory. Load-everything-in approaches collapse as rows grow; streaming (cursor read plus sliding-window write) exists to prevent exactly that.',
  },
  Hash: {
    zh: 'Hash：Redis 的哈希结构 —— 一个 Key 下面挂多组 field→value。库存用 field=活动id、value=库存数；限领用 field=用户id、value=1。相比「一个活动一个 String Key」，Hash 更省内存、Key 数量也少得多。',
    en: 'Hash: the Redis structure holding many field→value pairs under one key. Stock uses field=activity id, value=remaining count; the claim guard uses field=user id, value=1. Compared with one String key per activity, a Hash saves memory and keeps the key count small.',
  },
  HGET: {
    zh: 'HGET：Redis 命令，读 Hash 里某个 field 的值；field 不存在时返回 nil（在 Lua 里是 false，不是 null）。Lua 脚本前两步就是两次 HGET：先查这个用户是否已抢、再查库存还剩多少。',
    en: 'HGET: a Redis command reading one hash field; a missing field returns nil (false inside Lua, not null). The script’s first two steps are two HGETs — has this user claimed, and how much stock is left.',
  },
  Redis: {
    zh: 'Redis：内存数据库。命令单线程执行，所以单条命令和 Lua 脚本都是原子的；支持 String / Hash / List / Set 等结构。这个项目用它当抢券的主战场 —— 库存扣减、限领判断、待同步队列全在它里面完成。',
    en: 'Redis: an in-memory database. Commands execute on a single thread, so each command and each Lua script is atomic; it offers String/Hash/List/Set structures. Here it is the main arena for grabbing — stock decrement, limit checks and the sync queue all live in it.',
  },
  paperId: {
    zh: 'paperId：项目里给论文定义的唯一编号字段，取值来自上游的 _id / doi / PaperID 列。因为来源杂，它可能是一个 DOI、一个链接、甚至 "N/A"，所以判重不能只靠它，要和其他字段组合。',
    en: 'paperId: the project’s own unique identifier for a paper, taken from upstream _id / doi / PaperID columns. Because sources vary it may be a DOI, a URL or even "N/A", so dedupe must combine it with other fields.',
  },
  TSV: {
    zh: 'TSV（Tab-Separated Values）：用制表符分隔的纯文本表格。比 CSV 更不容易和内容里的逗号打架，程序解析也更简单，所以除了 Markdown 表格，还提供这种输出形态。',
    en: 'TSV (tab-separated values): a plain-text table separated by tabs. Less likely than CSV to collide with commas inside content and simpler for programs to parse — hence offered alongside Markdown tables.',
  },
  Cookie: {
    zh: 'Cookie：服务器发给浏览器的一小段键值数据，浏览器自动保存、并在下次请求时自动带回，服务器靠它认出「你是谁」。微信小程序的 wx.request 没有这套自动机制 —— 不自动存、不自动带，所以只能自己存、自己放进请求头。',
    en: 'Cookie: a small key-value blob the server sends and the browser stores and replays automatically, letting the server recognise who you are. A mini-program’s wx.request has none of that machinery: nothing is stored or replayed, so it must be kept and attached by hand.',
  },
  Session: {
    zh: 'Session（会话）：服务器端保存的「这次访问的状态」，浏览器只持有一个 session id（通常放在 Cookie 里）。这个项目的短信验证码就存在 session 里，所以请求必须带同一个 session id 才能对上 —— 这就是非维护 Cookie 不可的原因。',
    en: 'Session: server-side state for one visit, with the browser holding only a session id (usually in a cookie). The SMS code lives in that session here, so requests must carry the same session id — which is why cookies must be maintained by hand.',
  },
  反向代理: {
    zh: '反向代理：挡在后端前面的那层（Nginx 之类），对外暴露 /api 这样的路径并转发到真正的服务。所以正式环境请求走 /api 是对的；本地直连后端没有这层，路径里带 /api 就 404 —— 这就是本地调试要剥前缀的原因。',
    en: 'Reverse proxy: the layer (e.g. Nginx) in front of the backend that exposes paths like /api and forwards them to the real service. In production /api is correct; locally there is no such layer, so keeping /api yields a 404 — hence stripping the prefix for local debugging.',
  },
  'node:vm': {
    zh: 'node:vm：Node 内置模块，用来在「自己造的上下文」里执行一段 JS。这里用它模拟小程序运行环境（假 wx、假 storage），把真实业务代码加载进去跑 —— 于是不用微信开发者工具、不用网络也能测。',
    en: 'node:vm: a built-in Node module that runs JavaScript inside a caller-made context. Here it fakes the mini-program runtime (fake wx, fake storage) so the real business code can be loaded and exercised without the WeChat devtools or network.',
  },
  回归测试: {
    zh: '回归测试：改完代码后跑一遍已有用例，确认「没把原来能用的事弄坏」。它不追求覆盖率，贵在能随时、低成本地跑；这个项目的测试就是 `node tests/register-identity.test.js` 一条命令、零依赖。',
    en: 'Regression test: re-running existing cases after a change to confirm nothing that worked is broken. It is not about coverage but about being cheap enough to run any time — here a single dependency-free command.',
  },
  jwt: {
    zh: 'JWT（JSON Web Token）：一种自包含的令牌，服务端把身份信息签名后放进令牌里，客户端每次带上它即可，不需要服务端存会话。与 Session 是两条路线：Session 靠服务端存储，JWT 靠签名校验。',
    en: 'JWT (JSON Web Token): a self-contained signed token carrying identity claims, so the client presents it each time and no server-side session store is needed — the opposite trade-off to sessions.',
  },
  枚举: {
    zh: '枚举（enum）：取值被限定的那几种之一，比如身份只能是 Doctor / Teacher / Other。判断时用「等于某个固定值」，比塞进一串数字 0/1 更难出错；这个项目之所以改成三个互斥的 0/1 字段，是因为后端表结构就是那样存的 —— 属于「迁就历史，但只在边界上迁就」。',
    en: 'enum: a value restricted to a fixed set, e.g. identity is only Doctor / Teacher / Other. Comparing against a fixed constant is far less error-prone than spreading numeric 0/1 flags — this project uses three mutually exclusive flags only because the backend table stores them that way, i.e. accommodating legacy shape at the boundary only.',
  },
}
