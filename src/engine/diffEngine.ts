import { DiffLine, MigrationAlert } from '../types/fortigate';

export class DiffEngine {
  public computeDiff(
    sourceText: string,
    targetText: string,
    alerts: MigrationAlert[]
  ): DiffLine[] {
    const sourceLines = sourceText ? sourceText.split(/\r?\n/) : [];
    const targetLines = targetText ? targetText.split(/\r?\n/) : [];

    // Map alerts by target line and source line for fast lookup
    const alertBySrcLine = new Map<number, MigrationAlert>();
    const alertByTgtLine = new Map<number, MigrationAlert>();
    alerts.forEach((alert) => {
      if (alert.sourceLine) {
        alertBySrcLine.set(alert.sourceLine, alert);
      }
      if (alert.targetLine) {
        alertByTgtLine.set(alert.targetLine, alert);
      }
    });

    // LCS (Longest Common Subsequence) dynamic programming matrix for clean block diffing
    const m = sourceLines.length;
    const n = targetLines.length;

    // For very large configs (>1500 lines), use an optimized windowed or linear scan to avoid memory issues
    if (m * n > 4000000) {
      return this.computeHeuristicDiff(sourceLines, targetLines, alertBySrcLine, alertByTgtLine);
    }

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (sourceLines[i - 1] === targetLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const rawDiffs: {
      type: 'added' | 'removed' | 'unchanged';
      srcIdx?: number;
      tgtIdx?: number;
      srcLine?: string;
      tgtLine?: string;
    }[] = [];

    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && sourceLines[i - 1] === targetLines[j - 1]) {
        rawDiffs.push({
          type: 'unchanged',
          srcIdx: i,
          tgtIdx: j,
          srcLine: sourceLines[i - 1],
          tgtLine: targetLines[j - 1],
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        rawDiffs.push({
          type: 'added',
          tgtIdx: j,
          tgtLine: targetLines[j - 1],
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        rawDiffs.push({
          type: 'removed',
          srcIdx: i,
          srcLine: sourceLines[i - 1],
        });
        i--;
      }
    }

    rawDiffs.reverse();

    // Group adjacent removed + added lines that represent a 'modified' line
    const result: DiffLine[] = [];
    let k = 0;

    while (k < rawDiffs.length) {
      const current = rawDiffs[k];

      if (current.type === 'unchanged') {
        const srcLineNum = current.srcIdx!;
        const tgtLineNum = current.tgtIdx!;
        result.push({
          type: 'unchanged',
          sourceLineNumber: srcLineNum,
          targetLineNumber: tgtLineNum,
          sourceContent: current.srcLine,
          targetContent: current.tgtLine,
          alert: alertBySrcLine.get(srcLineNum) || alertByTgtLine.get(tgtLineNum),
        });
        k++;
      } else if (current.type === 'removed') {
        // Look ahead for an adjacent 'added' line to pair as 'modified'
        const next = rawDiffs[k + 1];
        if (next && next.type === 'added') {
          const srcLineNum = current.srcIdx!;
          const tgtLineNum = next.tgtIdx!;
          result.push({
            type: 'modified',
            sourceLineNumber: srcLineNum,
            targetLineNumber: tgtLineNum,
            sourceContent: current.srcLine,
            targetContent: next.tgtLine,
            alert: alertBySrcLine.get(srcLineNum) || alertByTgtLine.get(tgtLineNum),
          });
          k += 2;
        } else {
          const srcLineNum = current.srcIdx!;
          result.push({
            type: 'removed',
            sourceLineNumber: srcLineNum,
            sourceContent: current.srcLine,
            alert: alertBySrcLine.get(srcLineNum),
          });
          k++;
        }
      } else if (current.type === 'added') {
        const tgtLineNum = current.tgtIdx!;
        result.push({
          type: 'added',
          targetLineNumber: tgtLineNum,
          targetContent: current.tgtLine,
          alert: alertByTgtLine.get(tgtLineNum),
        });
        k++;
      }
    }

    return result;
  }

  private computeHeuristicDiff(
    sourceLines: string[],
    targetLines: string[],
    alertBySrcLine: Map<number, MigrationAlert>,
    alertByTgtLine: Map<number, MigrationAlert>
  ): DiffLine[] {
    const diffLines: DiffLine[] = [];
    let srcIdx = 0;
    let tgtIdx = 0;

    while (srcIdx < sourceLines.length || tgtIdx < targetLines.length) {
      const srcLine = srcIdx < sourceLines.length ? sourceLines[srcIdx] : undefined;
      const tgtLine = tgtIdx < targetLines.length ? targetLines[tgtIdx] : undefined;

      const srcLineNum = srcIdx + 1;
      const tgtLineNum = tgtIdx + 1;
      const matchedAlert =
        (srcLine ? alertBySrcLine.get(srcLineNum) : undefined) ||
        (tgtLine ? alertByTgtLine.get(tgtLineNum) : undefined);

      if (srcLine === undefined && tgtLine !== undefined) {
        diffLines.push({
          type: 'added',
          targetLineNumber: tgtLineNum,
          targetContent: tgtLine,
          alert: matchedAlert,
        });
        tgtIdx++;
      } else if (srcLine !== undefined && tgtLine === undefined) {
        diffLines.push({
          type: 'removed',
          sourceLineNumber: srcLineNum,
          sourceContent: srcLine,
          alert: matchedAlert,
        });
        srcIdx++;
      } else if (srcLine === tgtLine) {
        diffLines.push({
          type: 'unchanged',
          sourceLineNumber: srcLineNum,
          targetLineNumber: tgtLineNum,
          sourceContent: srcLine,
          targetContent: tgtLine,
          alert: matchedAlert,
        });
        srcIdx++;
        tgtIdx++;
      } else {
        diffLines.push({
          type: 'modified',
          sourceLineNumber: srcLineNum,
          targetLineNumber: tgtLineNum,
          sourceContent: srcLine,
          targetContent: tgtLine,
          alert: matchedAlert,
        });
        srcIdx++;
        tgtIdx++;
      }
    }

    return diffLines;
  }
}
