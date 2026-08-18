import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  ShieldAlert,
  ArrowRight,
  Eye,
  Columns,
  Sparkles,
  PlusCircle,
  MinusCircle,
  Edit3,
  Filter,
  ChevronDown,
  ChevronUp,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { DiffLine, MigrationAlert, ConfigStats } from '../types/fortigate';

interface DiffViewerProps {
  sourceConfig: string;
  targetConfig: string;
  diffLines: DiffLine[];
  stats?: ConfigStats;
  alerts: MigrationAlert[];
  onSourceChange: (val: string) => void;
  onExplainAlert: (alert: MigrationAlert) => void;
  highlightedLine?: number | null;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  sourceConfig,
  targetConfig,
  diffLines,
  stats,
  alerts,
  onSourceChange,
  onExplainAlert,
  highlightedLine,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChangesOnly, setShowChangesOnly] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [activeDiffIndex, setActiveDiffIndex] = useState<number>(-1);
  const [isSourceEditing, setIsSourceEditing] = useState(false);

  const targetCodeRef = useRef<HTMLDivElement>(null);
  const unifiedCodeRef = useRef<HTMLDivElement>(null);
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute summary metrics of diff types
  const diffSummary = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;
    let unchanged = 0;

    diffLines.forEach((line) => {
      if (line.type === 'added') added++;
      else if (line.type === 'removed') removed++;
      else if (line.type === 'modified') modified++;
      else unchanged++;
    });

    return { added, removed, modified, unchanged, total: diffLines.length };
  }, [diffLines]);

  // List of indices that contain actual changes
  const changedIndices = useMemo(() => {
    return diffLines
      .map((d, idx) => (d.type !== 'unchanged' ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [diffLines]);

  // Filtered diff lines based on search & changes-only toggle
  const displayDiffLines = useMemo(() => {
    return diffLines.map((line, originalIndex) => ({
      ...line,
      originalIndex,
    })).filter((line) => {
      if (showChangesOnly && line.type === 'unchanged') {
        return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const matchSrc = line.sourceContent?.toLowerCase().includes(term);
      const matchTgt = line.targetContent?.toLowerCase().includes(term);
      return matchSrc || matchTgt;
    });
  }, [diffLines, showChangesOnly, searchTerm]);

  // Source line diff lookup map
  const sourceLineDiffMap = useMemo(() => {
    const map = new Map<number, DiffLine>();
    diffLines.forEach((line) => {
      if (line.sourceLineNumber) {
        map.set(line.sourceLineNumber, line);
      }
    });
    return map;
  }, [diffLines]);

  // Target line diff lookup map
  const targetLineDiffMap = useMemo(() => {
    const map = new Map<number, DiffLine>();
    diffLines.forEach((line) => {
      if (line.targetLineNumber) {
        map.set(line.targetLineNumber, line);
      }
    });
    return map;
  }, [diffLines]);

  const handleCopyTarget = () => {
    navigator.clipboard.writeText(targetConfig);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([targetConfig], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fortigate_converted_${new Date().toISOString().slice(0, 10)}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Jump to next / previous change
  const handleJumpDiff = (direction: 'next' | 'prev') => {
    if (changedIndices.length === 0) return;

    let nextIdx = 0;
    if (direction === 'next') {
      const currentPos = changedIndices.findIndex((idx) => idx > activeDiffIndex);
      nextIdx = currentPos !== -1 ? changedIndices[currentPos] : changedIndices[0];
    } else {
      const currentPos = [...changedIndices].reverse().findIndex((idx) => idx < activeDiffIndex);
      nextIdx =
        currentPos !== -1
          ? [...changedIndices].reverse()[currentPos]
          : changedIndices[changedIndices.length - 1];
    }

    setActiveDiffIndex(nextIdx);
    const targetLine = diffLines[nextIdx]?.targetLineNumber || diffLines[nextIdx]?.sourceLineNumber;
    if (targetLine) {
      const el = document.getElementById(
        viewMode === 'split' ? `diff-line-${targetLine}` : `unified-line-${nextIdx}`
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Scroll to highlighted line when requested externally (e.g. from Alert notification)
  useEffect(() => {
    if (highlightedLine) {
      const el = document.getElementById(
        viewMode === 'split' ? `diff-line-${highlightedLine}` : `unified-tgt-line-${highlightedLine}`
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedLine, viewMode]);

  // FortiOS Syntax Colorizer
  const renderSyntax = (text: string | undefined, diffType?: 'added' | 'removed' | 'modified' | 'unchanged') => {
    if (!text) return null;

    if (text.startsWith('#')) {
      return <span className="text-slate-500 italic">{text}</span>;
    }

    const trimmed = text.trim();

    // High-level structure keyword coloring
    if (
      trimmed.startsWith('config ') ||
      trimmed === 'end' ||
      trimmed === 'next' ||
      trimmed.startsWith('edit ')
    ) {
      const parts = text.split(' ');
      return (
        <span>
          <span className="text-blue-400 font-bold">{parts[0]}</span>{' '}
          <span className="text-amber-200 font-medium">{parts.slice(1).join(' ')}</span>
        </span>
      );
    }

    // Set commands
    if (trimmed.startsWith('set ')) {
      const matchKey = trimmed.match(/^set\s+([^\s]+)\s*(.*)$/);
      if (matchKey) {
        const key = matchKey[1];
        const val = matchKey[2];

        return (
          <span>
            <span className="text-slate-400">set </span>
            <span className="text-cyan-300 font-semibold">{key} </span>
            <span className={diffType === 'added' ? 'text-emerald-200 font-medium' : diffType === 'modified' ? 'text-amber-100 font-medium' : 'text-slate-200'}>
              {val}
            </span>
          </span>
        );
      }
    }

    // Default syntax coloring
    if (diffType === 'added') {
      return <span className="text-emerald-300 font-mono">{text}</span>;
    }
    if (diffType === 'removed') {
      return <span className="text-rose-300 line-through opacity-85 font-mono">{text}</span>;
    }
    if (diffType === 'modified') {
      return <span className="text-amber-200 font-mono">{text}</span>;
    }

    return <span className="text-slate-300 font-mono">{text}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* 1. DiffViewer Header Toolbar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition ${
                viewMode === 'unified'
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Unified Diff</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter config lines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-xs"
            />
          </div>

          {/* Changes-Only Toggle */}
          <button
            type="button"
            onClick={() => setShowChangesOnly(!showChangesOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              showChangesOnly
                ? 'bg-red-50 text-red-700 border-red-200 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Filter out unchanged configuration lines"
          >
            <Filter className="w-3 h-3" />
            <span>Changes Only</span>
          </button>

          {/* Change Navigation (Next / Prev) */}
          {changedIndices.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleJumpDiff('prev')}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Jump to previous change"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-slate-500 font-semibold">
                {changedIndices.length} edits
              </span>
              <button
                type="button"
                onClick={() => handleJumpDiff('next')}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Jump to next change"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Export & Copy Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTarget}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
          >
            {copiedTarget ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Target CLI</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Download .conf</span>
          </button>
        </div>
      </div>

      {/* 2. Color-Coded Diff Summary Badges Bar */}
      <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-medium text-[11px]">Diff Breakdown:</span>

          {/* Added Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-mono font-semibold">
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            <span>+{diffSummary.added} Added</span>
          </span>

          {/* Removed Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-mono font-semibold">
            <MinusCircle className="w-3 h-3 text-rose-600" />
            <span>-{diffSummary.removed} Removed</span>
          </span>

          {/* Modified Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-mono font-semibold">
            <Edit3 className="w-3 h-3 text-amber-600" />
            <span>~{diffSummary.modified} Modified</span>
          </span>

          {/* Unchanged count */}
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500">
            {diffSummary.unchanged} unchanged
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span>Target lines: <strong className="text-slate-800">{targetConfig.split('\n').length}</strong></span>
        </div>
      </div>

      {/* 3. Code Panes (Side-by-Side vs Unified Diff Flow) */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[520px] max-h-[720px] bg-slate-950">
          {/* Left Column: Source Input */}
          <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-300 font-semibold">Source Configuration</span>
                <span className="text-[10px] text-slate-500 font-mono">(FortiOS Input)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSourceEditing(!isSourceEditing)}
                  className={`text-[10px] px-2 py-0.5 rounded transition ${
                    isSourceEditing
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isSourceEditing ? 'Done Editing' : 'Edit Text'}
                </button>
                <span className="text-[10px] font-mono text-slate-500">
                  {sourceConfig.split('\n').length} Lines
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto font-mono text-xs p-2">
              {isSourceEditing ? (
                <textarea
                  ref={sourceTextareaRef}
                  value={sourceConfig}
                  onChange={(e) => onSourceChange(e.target.value)}
                  placeholder="Paste FortiOS source configuration here..."
                  className="w-full h-full min-h-[480px] bg-transparent text-slate-300 font-mono text-xs focus:outline-none resize-none leading-relaxed p-2"
                  spellCheck={false}
                />
              ) : (
                <div className="space-y-0.5">
                  {sourceConfig.split('\n').map((line, idx) => {
                    const srcLineNum = idx + 1;
                    const diff = sourceLineDiffMap.get(srcLineNum);
                    const isRemoved = diff?.type === 'removed';
                    const isModified = diff?.type === 'modified';

                    return (
                      <div
                        key={`src-line-${srcLineNum}`}
                        className={`flex items-start px-2 py-0.5 rounded transition group ${
                          isRemoved
                            ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                            : isModified
                            ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500'
                            : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        {/* Line number */}
                        <span className="w-10 select-none text-slate-600 text-[11px] text-right pr-3 shrink-0 font-mono">
                          {srcLineNum}
                        </span>

                        {/* Diff Indicator */}
                        <span className="w-4 select-none font-bold text-center text-[11px] shrink-0">
                          {isRemoved ? (
                            <span className="text-rose-400 font-bold">-</span>
                          ) : isModified ? (
                            <span className="text-amber-400 font-bold">~</span>
                          ) : (
                            <span className="text-slate-700"> </span>
                          )}
                        </span>

                        {/* Line Content */}
                        <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed">
                          {renderSyntax(line, isRemoved ? 'removed' : isModified ? 'modified' : 'unchanged')}
                        </span>

                        {/* Badge for removed/modified */}
                        {isRemoved && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300 font-bold border border-rose-800 shrink-0 ml-2">
                            REMOVED
                          </span>
                        )}
                        {isModified && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-bold border border-amber-800 shrink-0 ml-2">
                            ORIGINAL
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Target Converted Output */}
          <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-200 font-semibold">Target Output</span>
                <span className="text-[10px] text-slate-500 font-mono">(Modernized &amp; Remapped)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                PRODUCTION READY
              </span>
            </div>

            <div
              ref={targetCodeRef}
              className="flex-1 overflow-auto font-mono text-xs p-2 space-y-0.5"
            >
              {targetConfig ? (
                targetConfig.split('\n').map((line, idx) => {
                  const tgtLineNum = idx + 1;
                  const diff = targetLineDiffMap.get(tgtLineNum);
                  const isAdded = diff?.type === 'added';
                  const isModified = diff?.type === 'modified';
                  const matchedAlert = alerts.find((a) => a.targetLine === tgtLineNum || a.sourceLine === tgtLineNum);
                  const isHighlighted = highlightedLine === tgtLineNum;

                  return (
                    <div
                      key={`tgt-line-${tgtLineNum}`}
                      id={`diff-line-${tgtLineNum}`}
                      className={`flex items-start group px-2 py-0.5 rounded transition ${
                        isHighlighted
                          ? 'bg-red-950/90 border-l-2 border-red-500 ring-1 ring-red-500/50'
                          : isAdded
                          ? 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-500'
                          : isModified
                          ? 'bg-amber-950/30 text-amber-100 border-l-2 border-amber-500'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      {/* Line Number */}
                      <span className="w-10 select-none text-slate-600 text-[11px] text-right pr-3 shrink-0 font-mono">
                        {tgtLineNum}
                      </span>

                      {/* Diff Indicator */}
                      <span className="w-4 select-none font-bold text-center text-[11px] shrink-0">
                        {isAdded ? (
                          <span className="text-emerald-400 font-bold">+</span>
                        ) : isModified ? (
                          <span className="text-amber-400 font-bold">~</span>
                        ) : (
                          <span className="text-slate-700"> </span>
                        )}
                      </span>

                      {/* Line Content with Syntax Highlighting */}
                      <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed">
                        {renderSyntax(line, isAdded ? 'added' : isModified ? 'modified' : 'unchanged')}
                      </span>

                      {/* Added / Modernized Badge */}
                      {isAdded && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300 font-bold border border-emerald-700 shrink-0 ml-2">
                          + ADDED
                        </span>
                      )}
                      {isModified && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-bold border border-amber-700 shrink-0 ml-2">
                          ~ MODERNIZED
                        </span>
                      )}

                      {/* Associated Alert Button */}
                      {matchedAlert && (
                        <button
                          type="button"
                          onClick={() => onExplainAlert(matchedAlert)}
                          className={`ml-2 shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                            matchedAlert.severity === 'critical'
                              ? 'bg-red-900/60 text-red-300 border border-red-700 hover:bg-red-900'
                              : matchedAlert.severity === 'warning'
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700 hover:bg-amber-900'
                              : 'bg-blue-900/60 text-blue-300 border border-blue-700 hover:bg-blue-900'
                          }`}
                          title={matchedAlert.description}
                        >
                          <ShieldAlert className="w-3 h-3" />
                          <span>{matchedAlert.category}</span>
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-24 text-slate-500">
                  <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-600" />
                  <p className="text-sm">Click "Convert Configuration" to preview production FortiOS output.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 4. Unified Diff Flow View with Full Color-Coded Blocks */
        <div
          ref={unifiedCodeRef}
          className="min-h-[520px] max-h-[720px] overflow-auto font-mono text-xs p-3 bg-slate-950 space-y-0.5 text-slate-300"
        >
          {displayDiffLines.length > 0 ? (
            displayDiffLines.map((diff, index) => {
              const isAdded = diff.type === 'added';
              const isRemoved = diff.type === 'removed';
              const isModified = diff.type === 'modified';
              const isHighlighted =
                highlightedLine &&
                (diff.targetLineNumber === highlightedLine || diff.sourceLineNumber === highlightedLine);

              return (
                <div
                  key={`unified-${diff.originalIndex}`}
                  id={`unified-line-${diff.originalIndex}`}
                  className={`flex items-start px-2 py-0.5 rounded transition ${
                    isHighlighted
                      ? 'bg-red-950/90 border-l-2 border-red-500 ring-1 ring-red-500'
                      : isAdded
                      ? 'bg-emerald-950/40 text-emerald-200 border-l-2 border-emerald-500'
                      : isRemoved
                      ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 line-through opacity-80'
                      : isModified
                      ? 'bg-amber-950/30 text-amber-200 border-l-2 border-amber-500'
                      : 'hover:bg-slate-900/50 text-slate-400'
                  }`}
                >
                  {/* Source Line Gutter */}
                  <span className="w-9 select-none text-slate-600 text-[10px] text-right pr-2 shrink-0 font-mono">
                    {diff.sourceLineNumber || ''}
                  </span>

                  {/* Target Line Gutter */}
                  <span className="w-9 select-none text-slate-600 text-[10px] text-right pr-2 shrink-0 font-mono">
                    {diff.targetLineNumber || ''}
                  </span>

                  {/* Diff Symbol Column */}
                  <span className="w-5 select-none font-bold text-center shrink-0">
                    {isAdded ? (
                      <span className="text-emerald-400 font-bold">+</span>
                    ) : isRemoved ? (
                      <span className="text-rose-400 font-bold">-</span>
                    ) : isModified ? (
                      <span className="text-amber-400 font-bold">~</span>
                    ) : (
                      <span className="text-slate-700"> </span>
                    )}
                  </span>

                  {/* Line Content */}
                  <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed">
                    {isModified ? (
                      <div className="space-y-0.5">
                        <div className="text-rose-300/80 line-through">
                          {renderSyntax(diff.sourceContent, 'removed')}
                        </div>
                        <div className="text-amber-100 font-semibold">
                          {renderSyntax(diff.targetContent, 'modified')}
                        </div>
                      </div>
                    ) : isRemoved ? (
                      renderSyntax(diff.sourceContent, 'removed')
                    ) : (
                      renderSyntax(diff.targetContent || diff.sourceContent, isAdded ? 'added' : 'unchanged')
                    )}
                  </span>

                  {/* Tag badge */}
                  {isAdded && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300 font-bold border border-emerald-700 shrink-0 ml-2">
                      + ADDED
                    </span>
                  )}
                  {isRemoved && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-300 font-bold border border-rose-700 shrink-0 ml-2">
                      - REMOVED
                    </span>
                  )}
                  {isModified && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-bold border border-amber-700 shrink-0 ml-2">
                      ~ MODIFIED
                    </span>
                  )}

                  {/* Associated Alert Button */}
                  {diff.alert && (
                    <button
                      type="button"
                      onClick={() => onExplainAlert(diff.alert!)}
                      className="ml-2 shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-900/40 text-red-400 border border-red-800 hover:bg-red-900 transition"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>{diff.alert.category}</span>
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>No differences found matching the current search filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
