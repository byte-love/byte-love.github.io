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
  SnapshotSource: {
    zh: '交叉验证的第一步：把当前 training_set 的全量数据原样复制成快照表 cv_source。之后每一折都从这份快照重建两张表，所以跑多少折都不会丢数据；中断后重跑也能自愈。',
    en: 'The first step of cross-validation: copy the whole of training_set into the snapshot table cv_source. Every fold rebuilds both tables from it, so no data is lost no matter how many folds run, and an interrupted run can simply be repeated.',
  },
  ApplyFold: {
    zh: '把某一折的数据摆进两张表：该折的样本进 testing_set（考卷），其余全部进 training_set（学习材料）。两张表都是从 cv_source 重建的（先清空再插入），所以可以反复调用，不依赖上一次的状态。',
    en: 'Places one fold into the two tables: that fold’s samples go to testing_set (the exam), everything else goes to training_set (the material). Both tables are rebuilt from cv_source (clear, then insert), so it can be called repeatedly without depending on prior state.',
  },
  RestoreAllToTraining: {
    zh: '收尾：把全量数据放回 training_set、清空 testing_set，让客户端恢复到「正常训练/预测」的状态。正常结束、用户取消、异常退出三条路径都要调用它，否则界面上会出现一个残缺的训练集。',
    en: 'The cleanup: put all data back into training_set and empty testing_set so the client returns to normal training/prediction state. It must run on the success, cancel and error paths alike, or the user is left with a truncated training set.',
  },
  cv_fold_map: {
    zh: '折映射表：一行对应一条样本，两个字段就是「这条样本属于第几折」。先按标签分层算好整张表，之后每一折查表就知道该把谁放进考卷。',
    en: 'The fold map: one row per sample, two fields saying which fold that sample belongs to. It is computed up front with stratified splitting, then each fold just looks up who goes into the exam.',
  },
  GetMinLabelCount: {
    zh: '取「每个标签的样本数里的最小值」。折数不能超过它 —— 否则必有某一折的训练集缺某个标签，撞上内核「没见过这个标签就判 0 分且不报错」的陷阱。',
    en: 'Returns the smallest per-label sample count. The fold count must not exceed it, or some fold’s training set will miss a label and hit the kernel’s "unseen label scores 0 without error" trap.',
  },
  GetSingleSampleLabels: {
    zh: '提前找出「只有 1 条样本的标签」。这类标签一旦被分到某一折当考卷，其余折的训练集就再也见不到它 —— 用户需要提前知道，而不是等到某折莫名其妙 0 分。',
    en: 'Finds labels that have exactly one sample up front. Once such a label lands in a fold as the exam, every other fold’s training set never sees it — the user should know before a fold mysteriously scores 0.',
  },
  RebalanceEmptyFolds: {
    zh: '兜底：把空折填上。折数大于「最小类样本数」时，分层发牌可能留下一条样本都没有的折；空折会让重建数据集抛异常、整轮中断，所以这里从样本最多的折挪一条过来。',
    en: 'The fallback that fills empty folds. When the fold count exceeds the smallest class size, stratified dealing can leave a fold with zero samples, which makes the rebuild throw and aborts the run — so one sample is moved over from the largest fold.',
  },
  CopyTestingToDevSet: {
    zh: '把本折的 testing_set 复制进 dev_set，供「应用模型」模式使用。留一法靠它把每折那 1 条考卷交给内核预测，再把预测结果读回来汇总。',
    en: 'Copies this fold’s testing_set into dev_set for "apply model" mode. Leave-one-out uses it to have the kernel predict that single held-out sample, then reads the predictions back for pooling.',
  },
  ReadDevPredictions: {
    zh: '读回 dev_set 里的逐条预测（id → PreLabel）。留一法在客户端自己算指标，靠的就是这份逐条结果 —— 而不去用内核那份「只有 1 条样本」的评估报告。',
    en: 'Reads the per-item predictions (id → PreLabel) back from dev_set. This is what lets leave-one-out compute metrics client-side instead of trusting the kernel’s report over a single test sample.',
  },
  BuildFoldMetricFromPredictions: {
    zh: '用逐条预测拼出某一折的指标：按这一折的混淆矩阵算逐类 precision/recall/f1，macro / weighted F1 与 sklearn 口径一致，support = 该类在真实标签里的条数。',
    en: 'Builds a fold’s metrics from per-item predictions: per-class precision/recall/f1 from that fold’s confusion matrix, macro and weighted F1 aligned with sklearn, and support equal to the class’s true count.',
  },
  SnapshotDevSet: {
    zh: '把用户原有的 dev_set 备份成一张影子表，供交叉验证临时借用 dev_set 用。不备份的话，留一法跑完用户的预测集就被写满了别人的预测结果。',
    en: 'Backs up the user’s original dev_set into a shadow table before cross-validation borrows it. Without the backup, running LOOCV would overwrite the user’s prediction set with someone else’s results.',
  },
  RestoreDevSet: {
    zh: '把 dev_set 还原成备份的样子并删掉影子表。成功、取消、异常三条路径都要调用 —— 只覆盖不还原，用户的数据就丢了。',
    en: 'Restores dev_set from the shadow table and drops it. Called on success, cancel and error alike — overwrite without restore loses the user’s data.',
  },
}
