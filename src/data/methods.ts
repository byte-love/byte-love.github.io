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
}
