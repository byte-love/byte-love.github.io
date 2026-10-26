import type { Lang } from '../i18n/ui'

type L = Record<Lang, string>

export type Project = {
  slug: string
  title: L
  subtitle: L
  role: L
  /** 起止时间，缺省则不显示该行 */
  period?: string
  stack: string[]
  problem: L
  action: Record<Lang, string[]>
  /** 「我做的」逐条注解，按数组下标对应 action；缺省则不显示角标 */
  notes?: Partial<Record<Lang, Record<number, string>>>
  result: Record<Lang, string[]>
  /** 公开仓库地址，缺省则不显示仓库链接 */
  repo?: string
  featured: boolean
  /** 架构图，放 public/diagrams/ 下，例：/diagrams/logs-manage-system.svg */
  diagram?: string
  /** 界面截图，放 public/shots/ 下 */
  shots?: { src: string; caption: L }[]
}

export const projects: Project[] = [
  {
    slug: 'logs-manage-system',
    title: { zh: '日志管理与账号运维后台', en: 'Log & Account Ops Console' },
    subtitle: {
      zh: '跨 4 个生产 MongoDB 库、3 台 SQL Server 的只读运维后台，单人主力全栈。',
      en: 'A read-mostly ops console across 4 production MongoDB clusters and 3 SQL Server instances. Solo full-stack.',
    },
    role: { zh: '服务端 + 前端（主力，63% 提交）', en: 'Backend + frontend (lead, 63% of commits)' },
    period: '2026.08 – 2026.09',
    stack: ['Spring Boot 2.7', 'Vue 3', 'MongoDB', 'SQL Server', 'Apache POI', 'WebSocket'],
    problem: {
      zh: '账号数据和操作日志分散在多套历史库：两张日志源表的 _id 各自从 1 开始自增、值域完全重叠，合并写入会逐条覆盖 188 万条真实记录；同步断点书签停在 563 万而目标已到 2250 万，按陈旧书签会重复拉 1690 万行；SQL Server 定长 CHAR 迁过来的机构名带尾填充空格，等值查询恒不命中。',
      en: 'Account data and operation logs were scattered across legacy databases. Two log source tables each auto-incremented _id from 1, so their key ranges overlapped completely — merging them would silently overwrite 1.88M real records. A stale sync bookmark (5.63M) against a target at 22.5M rows meant re-pulling ~16.9M rows. Institution names migrated from fixed-length CHAR columns carried trailing padding, so equality filters never matched.',
    },
    action: {
      zh: [
        '把两张日志表拆成两个独立集合，并写下「禁止合并 / 禁止加偏移」两条铁律',
        '给同步加断点自愈：先用形状校验（缺失字段计数 = 0）证明可安全抬升书签，再自动推进',
        'Excel 导出改为全流式：SXSSF 200 行滑窗 + 服务端游标 + 预载邮箱映射，替掉全量驻留内存的写法',
        '机构匹配改用锚定正则 ^\\s*值\\s*$，三个查询入口共用同一个条件构造器',
        '接入中英文日志表（En_Log）增量同步，按源文档 ObjectId 做断点，补语言版本列',
      ],
      en: [
        'Split the two log tables into independent collections, and wrote down two hard rules: never merge, never offset the ids',
        'Added self-healing bookmarks: prove safety with a shape check (missing-field count = 0) before advancing the cursor automatically',
        'Rewrote Excel export as fully streaming: SXSSF with a 200-row window plus a server-side cursor and preloaded lookup maps',
        'Switched institution matching to an anchored regex ^\\s*value\\s*$ shared by all three query entry points',
        'Added incremental sync for the bilingual log table (En_Log) keyed on source ObjectId, plus a language column',
      ],
    },
    result: {
      zh: [
        '待拉行数 1690 万 → 74,912（225 倍）',
        '导出 12.98 万行 / 24 秒 / 11 MB，44,968 个材料链接全部补上',
        '机构筛选命中 4185 → 5525 条（找回整批被静默漏掉的学校账号）',
        '9 个测试类 73 个用例，全 Mock，不连库不连源',
      ],
      en: [
        'Pending rows: 16.9M → 74,912 (225×)',
        'Export: 129.8k rows / 24s / 11 MB, with all 44,968 attachment links resolved',
        'Institution filter hits: 4,185 → 5,525 (recovered a whole class of silently dropped rows)',
        '9 test classes / 73 cases, fully mocked, no DB connection required',
      ],
    },
    repo: 'https://github.com/byte-love/logs-manage-system',
    notes: {
      zh: {
        0: '两张日志源表的 _id 都各自从 1 开始自增、各有百万级数据，值域完全重叠。合并成一个集合的话，第 1 号会覆盖第 1 号，188 万条真实记录被静默覆盖，而且覆盖之后看不出任何异常。\n另一种「省事」做法是给其中一张加偏移（_id + 1000000），但历史书签和外部引用都是按原 _id 记的，一加偏移就对不上。\n所以拆成两个独立集合分别同步，并在代码里写下两条铁律：禁止合并、禁止加偏移。代价是查询要查两次，但两次查询的成本远低于数据被覆盖。',
        1: '同步用一个书签记「拉到哪一条了」。它停在 563 万，而目标集合已经到 2250 万 —— 按旧书签重拉会重复 1690 万行。\n直接把书签抬到 2250 万是赌博：563 万到 2250 万之间有没有漏，没人知道。\n所以先做形状校验：抽样比对源和目标的字段结构，只有「缺失字段计数 = 0」才证明两段同形、可以安全推进书签，否则保持不动等人工判断。抬完之后待拉行数从 1690 万降到 74,912（225 倍）。\n边界：形状校验证明的是结构一致，不能证明内容完整，完整度还要靠后置比对兜。',
        2: '原来导出是先把全量数据读进 List 再写 xlsx，行数一多直接 OOM。改成两处流式：\n· Mongo 侧用游标边读边写，不把结果集攒在内存；\n· Excel 侧用 `SXSSFWorkbook(200)`，内存只保留 200 行滑动窗口，超出的行刷到磁盘临时文件，内存恒定。\n另外把逐行查邮箱改成一次批量取 + 内存 Map 预载，消掉 N+1。\n两个副作用：SXSSF 不支持事后 autoSizeColumn（历史行已刷盘），列宽改固定值；临时文件必须 dispose()，否则堆磁盘。结果：12.98 万行 / 24 秒 / 约 11 MB。',
        3: '机构名是从 SQL Server 的定长 CHAR 列迁过来的，带尾随空格，所以 = \'江西某学校\' 这种等值查询永远命中不到，整批账号被静默漏掉。\n改成 ^\\s*值\\s*$ 这类锚定正则，容忍前后空白。两个关键点：用户输入必须 Pattern.quote 转义，否则名字里带 . 或 ( 就变成正则元字符；三个查询入口共用同一个条件构造器，避免只改一个、另外两个继续漏。\n结果：机构筛选命中 4185 → 5525 条，找回整批被漏掉的学校账号。\n边界：前导空白会让优化器放弃索引，真正干净的做法是入库时清洗数据。',
        4: '新增一张英文日志表 En_Log，字段结构一致，要持续增量同步到同一个视图。\n断点用它自己的 ObjectId 而不是自增 _id —— ObjectId 前 4 字节是时间戳，本身单调有序，不会踩「两张表 _id 都从 1 开始」那个坑。再补一列语言版本，前端按列过滤即可中英切换。\n边界：ObjectId 做断点依赖时钟不倒退、并发写入时间戳单调；严格来说该用（时间戳, ObjectId）复合断点。',
      },
    },
    featured: true,
    diagram: '/diagrams/logs-manage-system.svg',
  },
  {
    slug: 'paper-annotation-system',
    title: { zh: '期刊论文标注与导入系统', en: 'Journal Paper Annotation & Import' },
    subtitle: {
      zh: '把爬虫给的 Excel 转成结构化论文：自动识别中英格式与学科、分集合入库、在线标注论文与数据库的关联，再推送外部 SQL Server。',
      en: 'Turns crawler-supplied spreadsheets into structured papers: format and discipline detection, multi-collection import, online annotation of paper-to-database links, then push to an external SQL Server.',
    },
    role: { zh: '全栈（个人，13 次提交）', en: 'Full-stack (solo, 13 commits)' },
    period: '2026.07 – 2026.08',
    stack: ['Spring Boot 2.7', 'Vue 3', 'MongoDB', 'Apache POI', 'jsoup', 'jTDS'],
    problem: {
      zh: '上游给的 Excel 并不规整：中文和英文是两套表头，列名写法也各不相同（标题/PaperTitle、关键字/关键词/Keywords、_id/doi/PaperID）；同一份文件的数据还要按学科和「是否与中国相关」拆进 5 个集合；重复导入和同批次内的重复都必须拦住，否则数据越导越脏。还有一类隐蔽情况：人工删掉的记录（判定为抓错的数据）不能在下次导入同一份文件时复活。',
      en: 'The incoming spreadsheets were not regular: Chinese and English use different header sets, and column names vary (标题/PaperTitle, 关键字/关键词/Keywords, _id/doi/PaperID). One file had to be split across five collections by discipline and China-relatedness. Duplicates — both against the database and within the same batch — had to be blocked, or the dataset degrades with every import. There was also a subtle case: records a human had deleted (judged as bad scrapes) must not come back on the next import of the same file.',
    },
    action: {
      zh: [
        '按列名取字段而不是按列序，上游调整列顺序不影响导入',
        '用「分类」列含不含《》区分中英文格式；扫前 5 行找第一行有值的判断，兜底看表头有没有 doi 列',
        '两层去重：目标集合的判重键只投影 4 个字段、按集合懒加载一次，避免逐行查库；再加一层批次内 seen',
        '判重键用「标题 + 期刊 + 发表日期 + paperId」四项，paperId 为空时靠其余三项照样能拦',
        '已删除记录（墓碑）参与判重：删掉的是抓错的数据，不该重新导进来，要恢复走回收站',
        '单行转换失败带行号收集，不影响整批；数字单元格用 DecimalFormat 处理，避免长 id 被转成科学计数',
        '上传外网走「整表重建」：先在事务里 DROP 旧备份 → sp_rename 现表为 ××00 → 建新表 → 每 200 条批量插入；失败整体回滚',
        '推送前把归档集合、工作集合、已删除键（墓碑）三方合并：工作集合优先，归档只补缺失、且被墓碑拦掉的那部分不补',
      ],
      en: [
        'Resolved fields by column name rather than position, so upstream column reordering does not break imports',
        'Distinguished Chinese/English formats by whether the 「分类」 column contains 《》; scanned the first five rows for the first non-empty value, falling back to the presence of a doi column',
        'Two-layer dedupe: per-collection keys projected to only four fields and loaded lazily once, plus an in-batch seen set',
        'Dedupe key = title + journal + publish date + paperId, so an empty paperId still gets caught by the other three',
        'Deleted records (tombstones) participate in dedupe: deletions mean bad scrapes, they should not reappear; restore from the recycle bin instead',
        'Per-row failures are collected with row numbers without aborting the batch; numeric cells go through DecimalFormat so long ids are not turned into scientific notation',
        'External upload rebuilds whole tables inside one transaction: drop the previous backup, sp_rename the live table to ××00, create the new table, insert in 200-row batches — any failure rolls the whole thing back',
        'Before pushing, three sources are merged: archive collections, working collections, and deleted-key tombstones — working copies win, archive only fills gaps, tombstoned rows are excluded',
      ],
    },
    result: {
      zh: [
        '一个文件可分流到 5 个集合（国内 / 国际 × 会计·金融 × 是否中国相关），按集合批量写入',
        '同一份 Excel 重复导入：新增 0 条，全部按原因逐条跳过',
        '生成的 Content HTML 可直接渲染，作者 / 摘要 / 关键词均做转义',
      ],
      en: [
        'One file can fan out into five collections (domestic/international × accounting/finance × China-related or not), written in batches',
        'Re-importing the same spreadsheet: 0 inserted, every row skipped with a stated reason',
        'Generated Content HTML renders directly; authors, abstract and keywords are escaped',
      ],
    },
    repo: 'https://github.com/byte-love/paper-annotation-system',
    notes: {
      zh: {
        0: 'POI 取单元格只认列号（row.getCell(n)），所以先把第 1 行读成「列名 → 列号」的映射，取值时给一串候选名逐个试：`getByHeader(row, hdr, "标题", "PaperTitle")`。\n好处：上游换列序、换中英文表头都不用改代码；最坏是取到 null，绝不会错到隔壁列 —— 列错位是最恶性的 bug，数据看着有、条数也对，但内容全错且不报错。\n代价：名字打错或列被删不会报错，只会静默变 null。目前对必填字段没有硬校验，这是这套方案的取舍。',
        1: '不看表头语言，看数据：读前 5 行里第一行有值的「分类」列，含《》判国内（《财经研究》），不含判国际（Accounting Review）。扫 5 行是为了跳过表头前的空行；兜底再看表头有没有 doi 列（国际表才可能有）。\n边界：国内期刊名没写书名号会误判，所以还有一层 journalMeta.isInternationalChinese(标题, 摘要) 参与集合判定。\n另外中文表里「分类」装的是期刊名、「期刊」装的是日期，列名和内容反着，这是最容易读错的地方。',
        2: '两层，缺一不可：\n· 库级：每个目标集合懒加载一次已有判重键（只投影 4 个字段），避免逐行查库；\n· 批次内：一个 seen 集合记本次已接受的行 —— 因为这一批要循环结束才写库，同一文件里两行完全一样时库里还没有，只能靠内存拦。',
        3: '判重键 = 标题 + 期刊 + 发表日期 + paperId，四项 trim + 转小写后用不可见字符 \\001 拼起来。\n为什么不能只用 paperId：国际库的 paperId 取自上有的 _id/doi/PaperID 列，实际可能是 DOI、论文链接、栏目页链接甚至 "N/A"；历史数据里存在一个 paperId 对应十几篇不同论文的情况，只按它判重会把不同论文当重复丢掉。\n为什么不能省 paperId：同名同期同月的不同论文要靠它区分。\n为什么用 \\001 分隔：避免 "ab"+"c" 和 "a"+"bc" 拼起来撞键。',
        4: '加载已有判重键时故意不过滤 deleted 标记 —— 已删除的记录照样参与判重。\n原因：删掉的是「抓取得不对」的数据（人判断这篇不该在外网），下次导入同一份 Excel 不该又把它导进来，否则每导一次都要人工再删一遍。要恢复就走回收站：取消删除标记后判重自然失效。\n这也是为什么删除做成软删除而不是物理删。',
        5: '每行独立 try/catch，失败写入「第 N 行: 原因」，不影响整批 —— 一行脏数据不该让 5000 行全失败。\n数值单元格用 DecimalFormat("#.##") 转字符串，否则长数字（2028342266074443778）会被转成科学计数 2.0283422660744E18。\n边界：DecimalFormat 只是格式化，超过 15 位有效数字的 long 在 double 里已经丢精度；真正的解法是把列设成文本，或用 DataFormatter / NumberToTextConverter。',
        6: '外网 SQL Server 五张表全部整表重建：DROP 旧备份 → sp_rename 现表为 ××00 → CREATE 新表 → 每 200 条批量 INSERT，全程一个事务。\n为什么敢这么做：重建中间存在「表不存在」的窗口，靠 SQL Server 的 DDL 事务性兜住 —— 任何一步失败 ROLLBACK，线上仍是旧表、数据一条不少。\n前提：只有 SQL Server 能这么写。Oracle / MySQL 的 DDL 会隐式提交，删了建不回来。\n代价：DDL 要拿架构修改锁，从第一条 DROP 到 commit 期间读这张表会被挡住，2 万行分批插入也在锁内。',
        7: '推送前把三个来源合并：归档集合（大写，只读的历史兜底）、工作集合（小写，用户最新改过的）、已删除键（墓碑）。三条规则：\n· 两边都有 → 以工作集合为准（关联数据库是用户最新改的）；\n· 归档里才有的 → 补进结果；\n· 归档里那条命中墓碑 → 不补。\n第三条是关键：删除时不动只读的归档，所以不加墓碑的话，删除会在合并阶段被自动撤销 —— 下次上传又出现在外网。合并后按发表日期倒序，再重新分配 ID = i+1（外网要连号）。',
      },
    },
    featured: true,
    diagram: '/diagrams/paper-annotation-system.svg',
    shots: [
      { src: '/shots/paper/01-import.png', caption: { zh: 'Excel 批量导入：单文件上传 + 服务器目录批量导入', en: 'Batch import: single file or a server-side directory' } },
      { src: '/shots/paper/02-list.png', caption: { zh: '论文浏览：分类筛选、批量打回标注、回收站', en: 'Paper list: category filter, bulk send-back, recycle bin' } },
      { src: '/shots/paper/03-annotate.png', caption: { zh: '数据库标注工作台：左文右库，单篇标注、候选库搜索、每篇最多关联 4 个', en: 'Annotation workbench: paper on the left, candidate databases on the right' } },
      { src: '/shots/paper/04-export.png', caption: { zh: '导出 Excel：按分类导出，列名与目标表一致', en: 'Export: per-category, column names aligned with the target table' } },
      { src: '/shots/paper/06-push.png', caption: { zh: '上传外网：按分类分表推送，待上传 / 已上传 / 待移除一眼可见', en: 'External push: per-category tables with pending, uploaded and to-remove states' } },
      { src: '/shots/paper/05-upload.png', caption: { zh: '上传外网：加载前的空状态与历史数据回补入口', en: 'External push: empty state and the historical backfill entry' } },
    ],
  },  {
    slug: 'wechat-register-miniprogram',
    title: { zh: '微信小程序用户注册流程', en: 'WeChat Mini-Program Registration' },
    subtitle: {
      zh: '九步注册表单，原生小程序、零构建零依赖，独立开发。',
      en: 'A nine-step registration flow in a native mini-program. Zero build, zero dependencies.',
    },
    role: { zh: '前端（独立开发，70% 提交）', en: 'Frontend (solo, 70% of commits)' },
    period: '2026.08 – 2026.09',
    stack: ['微信小程序原生', 'JavaScript'],
    problem: {
      zh: '微信小程序没有 Cookie 概念，而后端的验证码校验依赖服务端 Session；同时注册有教师 / 博士生 / 其他研究人员三种身份，每种展示不同动态字段，任一环节传错身份都会让整条链路失败。',
      en: 'WeChat mini-programs have no cookie jar, but the backend validates SMS codes against a server-side session. Registration also branches into three identities (teacher / PhD student / other researcher) with different dynamic fields, and getting the identity payload wrong breaks the whole chain.',
    },
    action: {
      zh: [
        '在 request.js 里手搓 Cookie 跨请求维护，让依赖 Session 的验证码校验能正常工作',
        '按接口前缀把请求路由到正式 / 测试两个 baseUrl，本地调试时自动剥掉 /api 前缀',
        '三种身份分支 + 子身份校验，提交字段统一为数字 0/1 并与后端字段一一对齐',
        '写单文件离线回归测试：模拟 wx.request，覆盖五种身份组合的提交与重发',
      ],
      en: [
        'Hand-rolled cookie persistence in request.js so session-bound SMS validation works',
        'Prefix-based routing to prod / test base URLs, with the /api prefix stripped automatically for local debugging',
        'Three identity branches plus sub-identity validation; payload flags normalized to 0/1 and aligned with backend fields',
        'A single-file offline regression test that mocks wx.request and covers five identity combinations',
      ],
    },
    result: {
      zh: [
        '九步注册流程上线，含身份选择、学校资格校验、材料上传、激活状态轮询',
        '回归测试 `node tests/register-identity.test.js` 直接跑，无需安装依赖',
      ],
      en: [
        'Shipped the full nine-step flow: identity, school eligibility, document upload, activation polling',
        'Regression suite runs with `node tests/register-identity.test.js` — no install step',
      ],
    },
    repo: 'https://github.com/byte-love/wechat-register-miniprogram',
    notes: {
      zh: {
        0: '小程序的 wx.request 不像浏览器：它没有 Cookie 容器，响应头里的 Set-Cookie 不会自动保存，下次请求也不会自动带上。更根本的原因是，小程序里没有浏览器那套 DOM / BOM —— 没有 document、window、localStorage，所以存储换成 wx.setStorageSync、跳转换成 wx.navigateTo、界面靠 setData 驱动。\n而后端校验短信验证码走的是 Session —— 验证码存在服务端 session 里，后续请求必须带同一个 session id 才能对上，所以必须自己维护 Cookie。\n做法三步：① 从 res.header 的 Set-Cookie 里提取 name=value（它可能是数组，也可能是一个字符串里逗号分隔多个），只保留 name=value，丢掉 Path / HttpOnly / Expires 这些属性；② 用一张 map 把新 Cookie 合并进 app.globalData.cookie —— 同名的覆盖、不同名的保留；③ 每次请求把它写进 header.Cookie。\n边界：全局数据只活在内存里，小程序被彻底关闭就丢了，所以它解决的是「一次使用期间的会话连续」，不是「登录态持久化」——后者要另存 storage。',
        1: '两个开关：\n① 按接口前缀选域名：路径以 /api/delivery/ 或 /test-api/ 开头就走测试域名，并把 /test-api/ 前缀改写成 /api/（后端只认 /api/）；其余一律走正式域名。\n② 本地调试时剥前缀：如果 baseUrl 本身是 127.0.0.1 / localhost，就把路径开头的 api/ 去掉 —— 因为正式环境有 Nginx 做反向代理，把 /api 转给后端；本地直连后端没有这一层，带着 /api 会 404。\n好处：同一份代码在真机（正式域名）、测试、本地三种环境都能跑，不用改代码或加编译开关。代价是这层「魔法」不看注释很难想到，出问题时很难查。',
        2: '身份只有三种：Doctor / Teacher / Other，但提交给后端的不是枚举字符串，而是三个互斥的 0/1 字段：bo（医生）、bos（教师）、isotheruser（其他），三者恰好一个为 1。Other 还要额外带子身份 OtherUserIdentity：在读硕士生 / 在读本科生 / 其他工作人员，不同子身份要的字段也不同（学号、入学年份、学制等）。\n另外两个容易忽略的点：\n① 旧字段 isdoctor / isdoctorteach 是早期版本的提交体字段，现在一处都不再发送。真正用到它们的地方是「校验本地缓存的待提交记录」：isTrustedIdentity 会拒绝含旧字段的 payload，再按新规则重算三个 0/1 要求逐字段一致，不一致或版本不对就判为不可信 —— 于是不让用户直接改邮箱重发，而是提示重走流程。宁可重填，也不把来路不明的身份数据提交上去。\n② 身份值必须精确匹配（小写 teacher、null、数字 1 都算非法），否则三个 0/1 全为 0，后端不知道这人是哪种身份。',
        3: '一个单文件离线回归测试：用 node:vm 造一个假上下文，里面有 storage（Map）、requests（记录发出的请求）、intervals、app.globalData.cookie，以及一个假的 wx.request（按 URL 返回固定响应）；再把真实的 utils/api.js、utils/request.js 和页面 js 加载进这个上下文执行。\n所以测到的是真代码路径，不是复制一份逻辑另写一遍。断言的内容是「请求契约」：方法、URL、三个 0/1 恰好一个非 0、子身份 label 正确、不含旧字段。\n覆盖范围：五种身份组合（Teacher / Doctor / Other 的三个子身份）、非法身份值被拒、Other 在第三步没选子身份不能前进、以及 pending 缓存的保存与恢复（提交失败后重发不会丢已填数据）。\n价值：不用微信开发者工具、不用网络、node 直接跑，改一行逻辑立刻知道有没有破坏提交契约。',
      },
    },
    diagram: '/diagrams/wechat-register-miniprogram.svg',
    shots: [
      {
        src: '/shots/mp/01-school.png',
        caption: {
          zh: '第一步 学校与身份：填学校全称、选身份（教师 / 在读博士生 / 其他研究人员），身份决定后面展示哪些字段；未勾选协议不能下一步',
          en: 'Step 1: school plus identity (teacher / PhD student / other researcher) — the identity decides which fields appear later; the agreement box must be ticked to continue',
        },
      },
      {
        src: '/shots/mp/02-wechat.png',
        caption: {
          zh: '第二步 微信授权：一键获取手机号（微信手机号快速验证），也可改为手动输入',
          en: 'Step 2: WeChat phone-number authorisation, with a manual fallback',
        },
      },
      {
        src: '/shots/mp/03-profile.png',
        caption: {
          zh: '第三步 资料：姓名 / 手机号 / 学院 / 系别 / 个人邮箱 / 学号 / 入学年份 / 学制，按身份动态展示与校验',
          en: 'Step 3: profile fields — name, phone, college, department, email, student id, enrolment year, programme length — shown and validated per identity',
        },
      },
      {
        src: '/shots/mp/04-done.png',
        caption: {
          zh: '第四步 完成：提交后发送激活邮件，激活成功才进入注册流程',
          en: 'Step 4: an activation email is sent; the registration only completes after activation',
        },
      },
    ],
    featured: true,
  },
  {
    slug: 'data-split-cv',
    title: { zh: '模型评估编排：四种划分方法', en: 'Model Evaluation Orchestration' },
    subtitle: {
      zh: '在 6 GB 训练内核不可改的前提下，用客户端编排实现留出法 / K 折 / 重复十折 / 留一。',
      en: 'Implementing hold-out, K-fold, repeated K-fold and leave-one-out around a 6 GB training kernel that could not be modified.',
    },
    role: { zh: '客户端负责人', en: 'Client-side owner' },
    period: '2026.09 – 2026.10',
    stack: ['.NET 6', 'WPF', 'SQLite', 'Dapper', 'Process orchestration'],
    problem: {
      zh: '训练跑在一个 PyInstaller 打包的内核里（4 万多个文件、6 GB），改一行就要重打包、传对象存储、改版本号；内核只有 19 个命令行参数，没有任何按折或循环的参数。更麻烦的是内核有两个静默契约：标签编码器只用训练集标签构建，测试集出现没见过的标签会直接返回 0 分且不报错；测试集只覆盖一个类别时，它干脆不写评估报告。',
      en: 'Training ran inside a PyInstaller-packed kernel (40k+ files, 6 GB) — changing one line meant repackaging, re-uploading to object storage and bumping backend versions. The kernel exposed 19 CLI flags and none of them were per-fold. It also had two silent contracts: the label encoder was built only from training labels (unseen labels scored 0 with no error), and it skipped the evaluation report entirely when the test set covered a single class.',
    },
    action: {
      zh: [
        '用临时 SQLite 当交换介质：全量快照 + 样本到折号的映射，每折重建训练 / 测试集，跑完统一还原',
        '按标签分层切分（洗牌 + 轮流发牌 + 随机起始折 + 空折兜底），并前置校验「折数 ≤ 最小类样本数」',
        '留一法改成每折再以「应用模型」模式调一次内核，读回逐条预测，由客户端自己算混淆矩阵',
        '把留一的指标口径从「各折平均」改成教科书口径的「折外预测汇总」',
        '折指标取到后立即删除该折模型；日志刷新从每行一篇改为定时器节流',
      ],
      en: [
        'Used a scratch SQLite as the exchange medium: a full snapshot plus a sample-to-fold map, rebuilding train/test per fold and restoring afterwards',
        'Stratified split (shuffle + round-robin deal + random start fold + empty-fold fallback), with an upfront check that folds ≤ smallest class size',
        'For leave-one-out, called the kernel a second time in "apply model" mode to read per-item predictions and compute the confusion matrix client-side',
        'Changed the LOO metric from "average across folds" to the textbook "pooled out-of-fold predictions"',
        'Deleted each fold model as soon as its metrics were read; switched log refreshing from per-line to timer-throttled',
      ],
    },
    result: {
      zh: [
        '四种方法真机跑通：十折×5（50 折）27 分钟，留一 24 条 14 分钟',
        '折模型磁盘占用 21.3 GB → 0.16 MB',
        '留一口径修正后：Macro F1 0.4583 → 0.3143，正面召回 0.4583 → 0.9167',
        '同数据同种子两次运行结果完全一致',
      ],
      en: [
        'All four methods ran on real data: 10-fold × 5 (50 folds) in 27 minutes; LOO over 24 samples in 14 minutes',
        'Per-fold model disk usage: 21.3 GB → 0.16 MB',
        'After the LOO fix: Macro F1 0.4583 → 0.3143, positive-class recall 0.4583 → 0.9167',
        'Identical results across two runs with the same data and seed',
      ],
    },
    repo: 'https://github.com/byte-love/data-split-cv',
    notes: {
      zh: {
        0: '内核只认两张表：training_set 和 testing_set，它没有任何「折」的概念。所以每跑一折，客户端就得把该折的数据摆进这两张表里。\n但这个「摆」不是把内存里的数据传给内核 —— 客户端和内核是两个进程，唯一的通道是磁盘上的一个临时 SQLite 库：Resources\\BigModel\\SqliteData_Temp.sqlite。它就是这个项目的交换介质：客户端往里写，内核从里读，双方不直接通信。\n为什么用它当交换介质：① 契约固定，内核只认这个库里的两张表，换成 CSV / JSON 等于改内核，而内核改不了；② 切折本质是集合运算（「Id 在折映射里的这批进测试集，其余进训练集」），一条 SQL 就完成，还能包进事务，要么全成要么全回滚；③ 单文件、不用起服务，装到哪都能跑。\n库里其实住着四张表：内核认的两张（training_set / testing_set）+ 客户端自用的两张（cv_source 快照、cv_fold_map 折映射）。内核不认识后两张也没关系，它只读自己那两张。\n做法：先 `SnapshotSource()` 把全量数据复制成快照表 cv_source，再建一张 `cv_fold_map(Id, FoldIndex)`。每折用 `ApplyFold()` 从快照重建两张表（测试集 = 该折的 Id，训练集 = 其余），跑完 `RestoreAllToTraining()` 把全量放回训练集。\n为什么是「从快照重建」而不是「把数据搬走再搬回」：搬来搬去只要中途失败或取消就会丢数据、越跑越少；从快照重建可反复、可自愈。\n代价：这个库是「共享可变状态」，跑完必须还原，否则用户下次训练看到的是残缺训练集；跑的过程中也不要用别的工具去改它（单文件有写锁）。\n一个细节：两表的列要取交集，因为历史版本里 testing_set 可能少 FolderName 这类列，直接 INSERT 会因列不匹配失败。',
        1: '分层是为了让每一折的训练集都含全部标签。步骤：把样本按标签分组 → 组内 Fisher-Yates 洗牌 → 轮流发牌（i % foldCount）。\n光发牌有个坑：每个标签的余数会全堆到前几折，所以给每个标签加一个随机起始偏移 offset，让余数分散开。\n再加一层兜底：`RebalanceEmptyFolds()` 专门处理「某折一条样本都没有」——从样本最多的折挪一条过来。空折会让 `ApplyFold()` 直接抛异常，整轮中断。\n前置校验：`GetMinLabelCount()` 取「每个标签样本数的最小值」，折数不能超过它。为什么必须卡住：内核的 LabelEncoder 只用训练集标签构建，某一折的训练集缺了某个标签，测试集里出现它时内核会判 0 分且不报错——不是训练失败，而是「没见过这个标签」。所以 `GetSingleSampleLabels()` 还会把「只有 1 条样本的标签」提前列给用户看。',
        2: '留一法每折只有 1 条测试样本，内核给出的是「1 条样本的准确率」——非 0 即 1，逐类 precision/recall 根本算不出来（分母是 0）。\n所以留一不走内核的报告，改成两步：每折先把 testing_set 复制进 dev_set（`CopyTestingToDevSet()`），再用「应用模型」模式调一次内核，让它把每条样本的预测标签 PreLabel 写回 dev_set；客户端读回 id → 预测（`ReadDevPredictions()`），再和 cv_source 里的真实标签对齐，由客户端自己用混淆矩阵算指标（`BuildFoldMetricFromPredictions()`，macro/weighted F1 与 sklearn 口径一致）。\n边界：dev_set 是用户自己的预测集，会被这次操作覆盖，所以开跑前 `SnapshotDevSet()` 备份、结束时 `RestoreDevSet()` 还原——正常结束、取消、报错三条路径都得还原。',
        3: '两种口径：\n· K 折/十折：每折都能算出完整指标，所以是「各折指标取平均」，逐类指标跨折平均、support 各折求和（= 该类真实总条数）。\n· 留一：先收集 N 次折外预测，汇总成一个混淆矩阵再算指标。\n为什么留一必须换口径：每折只有 1 条样本，逐折算出来的分数非 0 即 1，平均之后看似正常，但逐类的 precision/recall 会因为每折 support 只有 1 而失真。汇总口径才是教科书写法（等价于 sklearn 的 cross_val_predict + classification_report）。\n结果也印证了这点：改成汇总口径后 Macro F1 从 0.4583 变成 0.3143、正面召回从 0.4583 变成 0.9167——旧口径是虚高且失真的。',
        4: '两个都是资源问题。\n① 模型：每折训练都会写一份完整模型（FinBert 436 MB），它只是「草稿纸」—— 只用该折训练集训练、只为算这一折的指标，界面上看不到也选不了。十折×5 轮就是 50 份，436 MB × 50 ≈ 21.3 GB，磁盘直接爆。所以折指标一解析完就删掉该折模型目录，每轮开始再清一次上一轮的残留：收尾时 CrossValidation\\ 目录 = 0.16 MB / 0 个模型目录（剩下的只是报告 txt 之类）。注意这 0.16 MB 不是「模型被压缩了」，而是模型全删了、目录只剩碎屑。\n真正交付的模型是最后用 100% 数据重训的那一个（同样约 436 MB），它写在另一个目录 Resources\\models、出现在「已训练好的模型」列表里 —— 两个目录、两种生命周期：CrossValidation\\ 是草稿纸（跑完即清），Resources\\models 是成品柜（长期保留）。\n② 日志：内核每处理一篇文档就打一行日志，N 篇就是 N 次 UI 刷新，界面会被刷到卡死。改成定时器节流——按时间窗合并刷新，日志照样完整，只是刷新次数从 N 次降到几十次。',
      },
    },
    diagram: '/diagrams/data-split-cv.svg',
    shots: [
      {
        src: '/shots/cv/01-method.png',
        caption: {
          zh: '第四步 选择数据划分方法：留出法 / K 折 / 留一 / 十倍交叉验证四选一。选中「留一交叉验证」时右侧给出说明 —— 折数 = 样本数 N、每条样本当一次考卷；折数输入框随之置灰（自动等于 N、不可调）',
          en: 'Step 4: pick a split method — hold-out, K-fold, leave-one-out or repeated 10-fold. With leave-one-out selected, the panel states folds = sample count N and the fold field becomes read-only',
        },
      },
    ],
    featured: true,
  },
  {
    slug: 'patent-quality-pipeline',
    title: { zh: '专利质量指标计算流水线', en: 'Patent Quality Data Pipeline' },
    subtitle: {
      zh: '7,945 万行 Excel 的流式解析、并行预聚合与独立校验链。',
      en: 'Streaming parse, parallel pre-aggregation and an independent verification chain over 79.45M rows of xlsx.',
    },
    role: { zh: '数据工程', en: 'Data engineering' },
    period: '2026.09',
    stack: ['Python 3.12', 'lxml', 'multiprocessing', '定点整数中间文件'],
    problem: {
      zh: '源数据是 60 个 xlsx，单文件最大 37 MB / 100 万行，且多数文件的 max_row 被写成假的 1,000,000（尾部大量空行），常规加载会吃掉大量内存；如果让子进程把行级结果回传父进程，跨进程传输量会大到不可接受。',
      en: 'The source was 60 xlsx files, the largest 37 MB / 1M rows, and most reported a bogus max_row of 1,000,000 due to trailing blank rows. Conventional loading blew up memory, and shipping row-level results back from worker processes would have made inter-process traffic unmanageable.',
    },
    action: {
      zh: [
        '不用 pandas / openpyxl，直接 iterparse 流式解析 xlsx 内部 XML（只在行结束时清理节点）',
        '子进程边解析边按（主体, 年份）预聚合，只把预聚合结果回传，传输量缩小几个量级',
        '中间文件用定长定点整数（1e-6）存指标值，避免浮点格式带来的精度争议',
        '另写一条独立校验链：绕开全部中间文件，直接从原始 xlsx 重算并逐格比对输出',
      ],
      en: [
        'Skipped pandas / openpyxl and streamed the xlsx XML directly with iterparse, clearing nodes only at row end',
        'Worker processes pre-aggregated by (entity, year) while parsing, returning only aggregates — traffic dropped by orders of magnitude',
        'Stored metric values as fixed-point integers (1e-6) in the intermediate format to avoid floating-point disputes',
        'Wrote a separate verification chain that bypasses every intermediate file and recomputes from the raw xlsx, cell by cell',
      ],
    },
    result: {
      zh: [
        '读取总行数 7,945 万，8 个分区并行，解析 3.9 分钟、方法一 1.5 分钟',
        '47,926 + 168,194 个格子逐格一致（误差 < 1e-9）',
      ],
      en: [
        '79.45M rows read across 8 parallel partitions; parse in 3.9 min, method one in 1.5 min',
        '47,926 + 168,194 cells matched exactly (error < 1e-9)',
      ],
    },
    repo: 'https://github.com/byte-love/patent-quality-pipeline',
    notes: {
      zh: {
        0: 'xlsx 本质是一个 zip 包：真正的表格数据在 xl/worksheets/sheet1.xml 里，单元格文字还常常只是索引，指向 xl/sharedStrings.xml。所以完全可以不用 pandas / openpyxl，自己用 zipfile + iterparse 逐行流式读。\n为什么必须流式：① 单个文件最大 37 MB / 100 万行，openpyxl 常规加载会把整张表吃进内存；② 源文件里很多 max_row 被写成假的 1000000（尾部大量空行），按 max_row 循环会白跑几十万空行。\n实现上有个必踩的坑：只能在 </row> 收行时清空节点，不能在 </c> 时就 clear() —— 那时 <v> 子元素还没结束，clear 会把单元格的值一起清掉（早期版本踩过这个坑，表现为读到的全是空值）。\n还要兼容三种单元格形态：t="s"（共享字符串索引）、inlineStr（内联字符串）、以及普通数值；列号则从 ref（如 "B12"）里解析出字母部分。',
        1: '8 个分区（数据行 × 专利类型 × 文件组 × 列映射）各起一个子进程，各自读自己那批文件；每读一行就立刻算出 IPC 大组、按（主体, 年份）累加计数，不保留原始行。\n子进程只回传两份很小的文件：\n· agg_<任务号>.tsv —— 按（主体,年份）预聚合结果（主体、年份、专利件数、大组:专利数…），供方法二；\n· pk_<任务号>.bin —— 逐条的指标值，供方法一算均值/中位数；用二进制 struct 存（uint32 年 + 主体键 + int32 定点值），比 JSON / CSV 省体积也省解析时间。\n收益：跨进程传输量从几千万行压到数万行，缩小几个量级；父进程内存里只需要装聚合表。全量 60 个 xlsx / 7945 万行、8 分区并行，解析约 3.9 分钟。',
        2: '指标本身是浮点数，但中间文件不能直接存文本浮点：0.1+0.2 会打印成 0.30000000000000004，不同 Python 版本 / 平台的 repr 和 round 行为也可能不同，一旦跨工具比对就会出现「看起来对不上」的争议。\n做法是定点整数：写入时 value = int(round(v * 1e6))，用 int32 存；读出来再 / 1e6。这样同一个值在任何机器上都是同一个整数，比对可以逐位相等，不依赖浮点格式化。\n三个边界：① 步长 1e-6，单条舍入误差 ≤ 5e-7 —— 需求只要 6 位小数，够用；② int32 的表示范围约 ±2147（2.1e9 ÷ 1e6），指标都在 0~1 或小计数范围，安全，超出就会溢出；③ 定点只解决「存储与比对」，累计平均仍在浮点上做，所以他们另写了 diag_rounding.py，同时跑「定点链路」和「全精度链路」对比，确认偏差完全由定点舍入造成、算法本身没错。',
        3: 'verify_pipeline.py 是一条完全独立的校验链：不读任何中间文件，重新从原始 xlsx 解析、用同一套纯函数核心重算，再和 output/*.csv 逐格比对，规模是 47,926 + 168,194 个格子。\n两个关键设计：\n① 只比对「输出里真实存在的格子」。各分区覆盖的年份和主体不同（某类专利只在 2003 年后有数据），如果假设「扫到的年份一定在输出里」，一旦对不上就会静默空跑 —— 比对了 0 个格子也会显示「通过」，那是假验证。所以要先读输出的坐标集合，再用它约束比对范围。\n② 每个主体只扫一遍源文件，避免重复全扫描把时间翻倍。\n边界：它复用的是同一个算法模块，所以能证明「数据流和聚合没算错」，但不能证明「口径定义对」—— 后者要靠需求文档、负责人拍板，以及 test_core.py 的单测。',
      },
    },
    diagram: '/diagrams/patent-quality-pipeline.svg',
    featured: true,
  },
  {
    slug: 'tech-complementarity-index',
    title: { zh: '地区间技术互补指数（TACD）', en: 'Regional Tech Complementarity Index' },
    subtitle: {
      zh: '从 2,200 万行专利分类号算 RPCA 与技术联系指数，带全量自检。',
      en: 'RPCA and a technology-linkage index computed from 22M rows of patent classification codes, with full self-checks.',
    },
    role: { zh: '数据工程', en: 'Data engineering' },
    period: '2026.09',
    stack: ['Python 3.12', 'lxml', 'multiprocessing', '自研 xlsx 写出'],
    problem: {
      zh: '沿用旧实现会算不出最新年份的数据（旧快照只到 2024，源数据到 2025），而且旧代码把没校验过的分类号当 IPC 小类写进结果，混入了数千条脏值；最内层循环里逐条打印，是它跑几天的首要原因。',
      en: 'The old implementation could not produce the latest years (its snapshot stopped at 2024 while the source reached 2025), wrote unvalidated classification strings as IPC subclasses (thousands of dirty values), and printed inside its innermost loop — the main reason it took days.',
    },
    action: {
      zh: [
        '重写为 Python 流水线：解析 → 计数聚合 → 指标计算，输出省级 / 城市级 / 上市公司三档',
        '并行执行优先用进程池，环境禁掉进程池时自动降级为子进程 + 临时文件',
        '自研 xlsx 写出，替掉通用库的开销',
        '写 selftest.py 做端到端自检：用需求文档给的 5 条专利样例跑完整流程，与手算答案逐条核对，并回读 xlsx 与 csv 比对',
      ],
      en: [
        'Rewrote as a Python pipeline: parse → count aggregation → index computation, emitting province / city / listed-company levels',
        'Preferred a process pool, automatically falling back to subprocesses plus temp files where the pool is blocked',
        'Replaced the generic xlsx writer with a small purpose-built one',
        'Added selftest.py: the five-patent sample from the spec is run end to end and checked against hand-computed answers, then the xlsx is read back and compared with the csv',
      ],
    },
    result: {
      zh: [
        '2,200 万行 100~125 秒跑完，约 14 万行/秒',
        'xlsx 写出 20.1 秒 → 2.3 秒（8.7 倍）',
        'selftest 全量对账通过，脏 IPC 在前置环节被挡掉',
      ],
      en: [
        '22M rows in 100–125 seconds, roughly 140k rows/sec',
        'xlsx writing: 20.1s → 2.3s (8.7×)',
        'selftest reconciliation passes; dirty IPC values are rejected upfront',
      ],
    },
    repo: 'https://github.com/byte-love/tech-complementarity-index',
    notes: {
      zh: {
        0: '为什么重写：旧实现是几个 Java 脚本 + 一份 MongoDB 旧快照，有五个硬伤 —— ① 快照只到 2024 年，而源数据到 2025 年（差 120 万行），需求明确要算到 2025；② 三个分组脚本里 `doc.get("_id", Document.class).get("_id", ...)` 会拿到 null，下一行就 NPE，根本跑不起来；③ IPC 只判 `trim().length() < 4` 就取前 4 位、不校验格式，于是 `//(C`、`∴(A0`、`////` 都被当成 IPC 小类写进结果（旧结果里混了 3602 条城市级 + 2361 条省级脏值）；④ 最内层循环里逐次 println，上千万行控制台输出，是它跑几天的首要原因；⑤ 只输出 >0 的共现组合，与需求「两两之间（含零共现）」不符。\n新的 Python 流水线分成三段，各自可单独跑：解析（fastxlsx 流式读 2200 万行 / 约 780MB）→ 计数聚合（按地区/公司 × 年 × IPC 计数，以及两两共现计数）→ 指标计算（RPCA 与技术联系指数）。\n输出五份：省级 RPCA 383,505 行、城市级 1,775,721 行、技术联系指数 244,650 行、上市公司本身 363,067 行、集团合计 751,636 行，各给 csv + xlsx。',
        1: '为什么要兜底：Windows 上 multiprocessing 依赖命名管道，某些受限 / 沙箱环境里创建进程池会直接抛 `PermissionError: [WinError 5]`；而 subprocess 把 stdout 指向 DEVNULL / 继承 / 文件都能正常工作。\n做法：先试 ProcessPoolExecutor，抛 PoolUnavailable 就切换成「每个任务起一个子进程，结果 pickle 到临时文件，父进程读回」。两种模式结果完全一致，因为每个 worker 只回传几张计数表（数据量很小），用临时文件传完全够快。\n一个细节：临时目录是三级探测的 —— 环境变量 TACD_TMP > 仓库内 `_tmp_workers` > 系统临时目录，并且每个候选都先写一个探针文件确认「真的可写」，避免选到只读目录、跑到一半才失败。',
        2: '实测数据：openpyxl 的 write_only 模式写 383,505 行要 20.1 秒（约 1.9 万行/秒），同样的数据写 CSV 只要 0.4 秒。本项目四个 xlsx 合计 174 万行，光写文件就要约 90 秒，接近总耗时四成 —— 所以自己拼了一个最小 xlsx 包。\n做法：直接往 zip 里流式写 `[Content_Types].xml`、`_rels/.rels`、`xl/workbook.xml`、`xl/styles.xml`、`xl/sharedStrings.xml`、`xl/worksheets/sheet1.xml` 这几个必需部件；字符串走共享字符串表（省份、地市、IPC、年份重复度极高，共享表通常只有几千条），数值直接写 `<v>`。\n结果：20.1 秒 → 2.3 秒，快 8.7 倍；产物再用 openpyxl 回读校验，确保 Excel 和 pandas 都能正常打开。\n边界：这个写出器只覆盖基础单元格（没有公式、样式、合并单元格），本场景够用；通用场景别自己写，用库。',
        3: '需求文档给了一份可以手算的样例：城市 c 有 3 条专利、全国共 5 条 —— 手算答案就是金标准。P1 的分类号归到大组 {A01N, A01P}，于是 RPCA(c, A01N, 2022) = (1/3) / (1/5) = 5/3 = 1.666667；Φ̃(A01N, A01P) = 1；Φ(A01N, A23J) = 0（零共现也要输出）。\nselftest.py 用这份样例跑完整流程，逐条核对：手算的 RPCA、Φ̃、零共现值、零值条数、组合数 C(7,2) = 21、IPC 四位代码长度，最后再把 xlsx 回读出来和 csv 比对（确保两个产物一致）。\n运行时还会做两类交叉对账：打印各年行数（可直接和原始 Excel 的会计年度计数核对，确认没漏读文件）；核对上市公司数据里「关系」列的取值与文件夹名一致（防止把母公司 / 子公司搞反）。\n意义：手算答案当金标准，程序与它对上，说明公式实现没错；各年行数对账则保证没有整份文件被漏掉。这是这个项目最值钱的部分 —— 不是算得快，而是算完之后能被证明是对的。',
      },
    },
    diagram: '/diagrams/tech-complementarity-index.svg',
    featured: false,
  },
  {
    slug: 'pdf-batch-extractor',
    title: { zh: 'PDF 批量抽取：双引擎 + 质量门禁', en: 'Batch PDF Extraction' },
    subtitle: {
      zh: '正文与表格分引擎处理，带三项质量检查的 PDF → HTML → 文本流水线。',
      en: 'A PDF → HTML → text pipeline that splits body and table extraction across two engines and gates output on three quality checks.',
    },
    role: { zh: '工具开发', en: 'Tooling' },
    period: '2026.09',
    stack: ['Python', 'PyMuPDF', 'pdfplumber'],
    problem: {
      zh: '年报类 PDF 正文与表格混排，单一引擎要么表格错行、要么正文被切碎；页眉页脚与封面页会污染抽取结果，封面页的公司全名和页眉完全一样，曾导致整个封面被错误剔除。',
      en: 'In annual reports, prose and tables interleave; a single engine either mangles tables or shreds paragraphs. Headers and footers polluted output, and a cover page whose company name matched the running header once got deleted entirely.',
    },
    action: {
      zh: [
        '正文用 PyMuPDF、表格用 pdfplumber，分别取长再合并',
        '按 bbox 去重，处理两个引擎重复命中的区域',
        '三项质量门禁：表格文本不变量（网格里的非空文本必须与 pdfplumber 原始抽取逐项一致）、列数守恒（每行 colspan 之和 = 原始列数）、整页字符覆盖率 ≥ 0.90',
        '支持 Markdown / TSV / 纯文本多种表格形态，以及页码锚点便于回溯原文',
      ],
      en: [
        'Used PyMuPDF for prose and pdfplumber for tables, then merged the two results',
        'Deduplicated overlapping regions by bounding box',
        'Three quality gates: table-text invariant (grid text must match pdfplumber raw extraction item by item), column-count conservation (sum of colspan per row = original column count), and page character coverage ≥ 0.90',
        'Multiple table renderings (Markdown / TSV / plain) plus page anchors for tracing back to the source',
      ],
    },
    result: {
      zh: ['240 页 45 秒，覆盖率 0.9707', '带质检环节的抽取，比只做转换的脚本更适合无人值守'],
      en: ['240 pages in 45 seconds, coverage 0.9707', 'Quality-gated extraction, suitable for unattended batches'],
    },
    notes: {
      zh: {
        0: '两个引擎各取所长：PyMuPDF 抽正文 —— 速度快、字符覆盖最全、保留标点和间距，但它不懂表格结构；pdfplumber 能识别表格、还原合并单元格，但它抽正文会碎。所以正文走 PyMuPDF、表格走 pdfplumber，最后合并。\n合并的关键是「以表格的 bbox 为准」：表格区域内的文字已经由 pdfplumber 产出了，正文里落在同一块区域的文本块必须丢掉，否则同一段内容会出现两次（一次是表格、一次是正文）。\n边界：无框线表格 pdfplumber 识别不出来，会退化正文——这类页就会被覆盖率门禁盯上。',
        1: '两处去重，都是用 bbox 判断重叠：\n① 正文 vs 表格：拿表格的 bbox 反查 PyMuPDF 的文本块，重叠比例超过阈值才丢弃（阈值设高一点，避免把紧贴表格的正文误删）。\n② 表格 vs 表格：pdfplumber 有时把同一块区域反复识别成多个表（实测有一页把一段文字识别成表），所以按 bbox 面积从大到小处理，若一个表超过 80% 的面积已被保留的表覆盖，就丢掉它。\n边界：阈值都是经验值；真正兜底的是质量门禁的「表格文本不变量」——一旦误删就会报丢失。',
        2: '三项门禁，任何一项变差就说明抽取质量退化（改代码或升级 PyMuPDF/pdfplumber 之后都要跑）：\n① 表格文本不变量：把网格里所有非空格子的文本拼起来，必须与 pdfplumber 原始抽取的非空文本完全一致 —— 守「绝不丢数字」。曾经因为「按值合并 + 纵向合并」的启发式，一次吞掉 152 个 0.00，就是这项抓出来的。\n② 列数守恒：每行 colspan 之和必须等于原始列数 —— 守「表格不错位」。\n③ 整页字符覆盖率 ≥ 0.90，且缺失必须只能由页眉/页码解释 —— 守「不成片丢内容」。覆盖率不能设成 1.0，因为每页顶部的报告名和页码是被有意剔除的，短页剔完天然偏低。',
        3: '输出层可切换：表格形态支持 markdown（默认）/ tsv / plain / kv，换形态不用重跑第一步 —— 因为 HTML 是中间产物，第二步只读它。\n--with-page-anchor 会在文本里插入 <!-- page N -->，出问题时能从文本反查回 PDF 的第几页。\n最实用的一点：中间产物 HTML 可以直接在浏览器里打开、逐页对照原文，相当于给人留了一条对账通道。',
      },
    },
    repo: 'https://github.com/byte-love/pdf-batch-extractor',
    diagram: '/diagrams/pdf-batch-extractor.svg',
    featured: false,
  },
  {
    slug: 'home-service-coupon',
    title: { zh: '家政平台 · 优惠券模块', en: 'Home-services Platform · Coupon Module' },
    subtitle: {
      zh: '面向江西 3 个城市的家政平台（注册约 12 万、日活约 400、日均单 150~200）。抢券在 Redis 里由 Lua 原子完成，再异步落 MySQL。',
      en: 'A home-services platform across three cities in Jiangxi (≈120k registered users, ≈400 DAU, 150–200 orders/day). Voucher grabbing runs atomically in Redis via Lua, then lands in MySQL asynchronously.',
    },
    role: {
      zh: '后端 · 优惠券模块（团队 6 人，有资深同事带教）',
      en: 'Backend · coupon module (6-person team, mentored)',
    },
    stack: ['Spring Cloud', 'Redis', 'Lua', 'MySQL', 'XXL-JOB', 'Redisson'],
    problem: {
      zh: '家政是低频业务，用户靠营销活动召回，于是形成脉冲流量：无门槛立减券开抢时抢券接口峰值约 1.1k QPS，而券只发数千张、几秒抢空——请求量远大于券量，绝大多数请求注定失败。若直接打库，每次抢券要 3~5 次数据库操作，MySQL 会被查询和行锁拖垮；同时还要防超发、防同一用户重复领，并保证 Redis 与 MySQL 最终一致。',
      en: 'Housekeeping is a low-frequency business: users come back for promotions, so traffic arrives in bursts. During a no-threshold voucher release the grab endpoint peaked near 1.1k QPS while only a few thousand vouchers existed — gone in seconds, with far more requests than vouchers. Hitting MySQL directly (3–5 statements per grab) would have flattened it, and overselling, duplicate claims per user, plus Redis/MySQL eventual consistency all had to be handled.',
    },
    action: {
      zh: [
        '抢券整体在 Redis 内完成，Lua 脚本串起五步：限领校验 → 库存校验 → 记录已抢 → 原子扣减 → 写同步队列，用 -1~-5 区分限领、抢光与写入失败',
        '库存用 Hash 按活动 ID 取模 10 拆成 10 个大 Key 避免单 Key 过大；抢券相关 Key 统一打 {活动id%10} 哈希标签，保证集群下同一活动的 Key 落在同一槽位，Lua 才能执行',
        '抢券结果只进同步队列，由 XXL-JOB 每分钟用 10 线程池 + Redisson 分布式锁异步落库，把慢 IO 从请求链路里摘出去',
        '落库时插入领券记录与扣减库存放在同一事务，扣减 SQL 追加 stock_num > 0 条件，库存为 0 时更新 0 行、事务回滚',
        '同步失败不删队列数据，改为累加失败次数留待下一轮重试，超次则告警；每日凌晨全量对账，以 MySQL 为准修正 Redis 库存',
      ],
      en: [
        'Kept the whole grab path inside Redis: one Lua script chains limit check → stock check → mark claimed → atomic decrement → enqueue for sync, returning -1 to -5 to distinguish "already claimed", "sold out" and write failures',
        'Sharded stock into 10 Hash keys by activity id modulo 10 to avoid oversized keys; every grab-related key carries a {id%10} hash tag so all keys of one activity land in the same cluster slot, which Lua requires',
        'Grab results only enter a sync queue; XXL-JOB then flushes them every minute with a 10-thread pool plus per-queue Redisson locks, keeping slow IO off the request path',
        'Inserting the user-voucher row and decrementing stock share one transaction, and the decrement carries a stock_num > 0 guard so a zero-stock row updates 0 rows and the transaction rolls back',
        'Failed syncs keep their queue entry and bump a retry counter for the next round, escalating to an alert past the limit; a nightly full reconciliation corrects Redis against MySQL',
      ],
    },
    result: {
      zh: [
        '抢券请求基本在 Redis 层终结，MySQL 只承接每分钟一次的异步批量写入',
        '发券数千张、数秒内抢空，活动期内未发生超发',
      ],
      en: [
        'Grab traffic terminated at Redis; MySQL only saw one asynchronous batch write per minute',
        'A few thousand vouchers sold out within seconds, with no overselling during the programme',
      ],
    },
    diagram: '/diagrams/home-service-coupon.svg',
    notes: {
      zh: {
        0: '抢券接口不直接读写数据库，而是把一个 Lua 脚本交给 Redis 一次执行，脚本内按顺序做五件事：\n① HGET 已抢队列：该用户抢过 → -1；\n② HGET 库存：< 1 → -2；\n③ HSET 记下该用户已抢；\n④ HINCRBY 库存 -1，变负 → -4；\n⑤ HSETNX 写入同步队列，成功返回活动 id。\n为什么用脚本：五步拆成五次请求，并发下中间会被别的请求插进来，库存就扣乱了；Lua 在 Redis 里独占执行，中间不会被打断。\n注意：Redis 脚本中途 return 不会回滚已执行的写命令。所以「先记已抢、再扣库存」在库存转负时会把用户标记留下，正确写法是先扣减、失败再回滚标记。',
        1: '库存和同步队列都按 活动id % 10 分成 10 个 Hash，field = 活动id、value = 库存/待同步值，避免出现单 Key 过大。\n同时所有抢券相关 Key 都带 {活动id%10} 哈希标签：集群按 Key 哈希取槽，而 Lua 要求脚本里用到的所有 Key 落在同一节点，否则直接报错；加标签保证同一活动的库存 / 限领 / 同步三个 Key 落在同一个槽。\n分片数 10 的依据：既能拆掉大 Key，又不会让 Key 数量多到管不过来。',
        2: '抢券成功只写一条同步队列，不写库。落库交给 XXL-JOB 每分钟跑一次：10 个线程对应 10 个分片队列，每个队列先抢 Redisson 分布式锁（多实例部署时保证同一队列只有一个实例在同步），把慢 IO 从请求链路里摘出去，抢券接口耗时只取决于 Redis。\n线程池按「4 核、IO 密集、实测 10 线程最好」定：核心 1（平时没有 10 个活动要同步）、最大 10（刚好对应 10 个分片）、SynchronousQueue（不排队，来任务直接开线程）、拒绝策略丢弃（最多 10 个队列，丢不掉有效任务）。',
        3: '落库时两件事必须一起成：往用户券表插一条领取记录、把活动表库存 -1，放在同一个事务里。\n库存扣减追加 stock_num > 0 条件：update activity set stock_num = stock_num - 1 where id = ? and stock_num > 0。\n这样即使 Redis 侧库存因为极端情况不对，数据库库存为 0 时这条 SQL 更新 0 行、事务回滚，库存绝不会被扣成负数 —— 防超卖的最后一道兜底。',
        4: '同步失败不删队列数据，而是把失败次数累加进 value（"11" → "11_1"），下一轮定时任务继续重试；一般 5 次以内网络类失败都能过，超次就删掉并发告警、人工介入。\n每天凌晨做一次全量对账：以 MySQL 为准修正 Redis 库存、补做漏掉的领取记录、校验券状态是否合规，无法自动修复的留痕告警。\n这是「最终一致性」的兜底部分：正常链路靠 Lua 保证 Redis 侧正确，异常靠重试 + 对账两道。',
      },
    },
    featured: false,
  },
]

export const featured = projects.filter((p) => p.featured)
