import type { Lang } from '../i18n/ui'

type L = Record<Lang, string>

export type Project = {
  slug: string
  title: L
  subtitle: L
  role: L
  period: string
  stack: string[]
  problem: L
  action: Record<Lang, string[]>
  result: Record<Lang, string[]>
  repo: string
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
    featured: true,
    diagram: '/diagrams/paper-annotation-system.svg',
    shots: [
      { src: '/shots/paper/01-import.png', caption: { zh: 'Excel 批量导入：单文件上传 + 服务器目录批量导入', en: 'Batch import: single file or a server-side directory' } },
      { src: '/shots/paper/02-list.png', caption: { zh: '论文浏览：分类筛选、批量打回标注、回收站', en: 'Paper list: category filter, bulk send-back, recycle bin' } },
      { src: '/shots/paper/03-annotate.png', caption: { zh: '数据库标注工作台：左文右库，单篇标注、候选库搜索、每篇最多关联 4 个', en: 'Annotation workbench: paper on the left, candidate databases on the right' } },
      { src: '/shots/paper/04-export.png', caption: { zh: '导出 Excel：按分类导出，列名与目标表一致', en: 'Export: per-category, column names aligned with the target table' } },
      { src: '/shots/paper/05-upload.png', caption: { zh: '上传外网：全量覆盖推送 + 历史数据回补', en: 'External push: full replacement plus historical backfill' } },
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
    diagram: '/diagrams/wechat-register-miniprogram.svg',
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
    diagram: '/diagrams/data-split-cv.svg',
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
        '写 selftest.py 做全量对账：各地区之和 = 当年总数、IPC 计数 = 逐条求和、共现对数 = ΣC(k,2)',
      ],
      en: [
        'Rewrote as a Python pipeline: parse → count aggregation → index computation, emitting province / city / listed-company levels',
        'Preferred a process pool, automatically falling back to subprocesses plus temp files where the pool is blocked',
        'Replaced the generic xlsx writer with a small purpose-built one',
        'Added selftest.py for full reconciliation: per-region sums equal yearly totals, IPC counts match row-wise sums, co-occurrence pairs match ΣC(k,2)',
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
        '三项质量门禁：覆盖率、字符密度、异常值检查（一次拦下 152 个「0.00」假值）',
        '支持 Markdown / TSV / 纯文本多种表格形态，以及页码锚点便于回溯原文',
      ],
      en: [
        'Used PyMuPDF for prose and pdfplumber for tables, then merged the two results',
        'Deduplicated overlapping regions by bounding box',
        'Three quality gates: coverage ratio, character density, and outlier checks (caught 152 bogus "0.00" values in one run)',
        'Multiple table renderings (Markdown / TSV / plain) plus page anchors for tracing back to the source',
      ],
    },
    result: {
      zh: ['240 页 45 秒，覆盖率 0.9707', '带质检环节的抽取，比只做转换的脚本更适合无人值守'],
      en: ['240 pages in 45 seconds, coverage 0.9707', 'Quality-gated extraction, suitable for unattended batches'],
    },
    repo: 'https://github.com/byte-love/pdf-batch-extractor',
    diagram: '/diagrams/pdf-batch-extractor.svg',
    featured: false,
  },
]

export const featured = projects.filter((p) => p.featured)
