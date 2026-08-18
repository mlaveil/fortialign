import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Filter,
  KeyRound,
  Cpu,
  Layers,
  FileCode,
  Search,
} from 'lucide-react';
import { MigrationAlert, AlertSeverity, AlertCategory } from '../types/fortigate';

interface AlertNotificationCenterProps {
  alerts: MigrationAlert[];
  onJumpToLine?: (lineNumber: number) => void;
  onExplainAlertWithAi: (alert: MigrationAlert) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AlertNotificationCenter: React.FC<AlertNotificationCenterProps> = ({
  alerts,
  onJumpToLine,
  onExplainAlertWithAi,
  isOpen,
  onToggle,
}) => {
  const [selectedSeverity, setSelectedSeverity] = React.useState<AlertSeverity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState<AlertCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copiedSnippetId, setCopiedSnippetId] = React.useState<string | null>(null);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;
  const autoFixedCount = alerts.filter((a) => a.appliedFix).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && alert.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        (alert.sourceBlock && alert.sourceBlock.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopySnippet = (snippet: string, alertId: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(alertId);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const getAlertCardStyle = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return {
          container: 'bg-red-50/90 border-red-100 hover:border-red-200',
          title: 'text-red-900',
          desc: 'text-red-700',
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />,
        };
      case 'warning':
        return {
          container: 'bg-amber-50/90 border-amber-100 hover:border-amber-200',
          title: 'text-amber-900',
          desc: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />,
        };
      case 'info':
        return {
          container: 'bg-blue-50/90 border-blue-100 hover:border-blue-200',
          title: 'text-blue-900',
          desc: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />,
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Syntax Alerts &amp; Rule Audits
          </h3>
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">
            {alerts.length} {alerts.length === 1 ? 'ISSUE' : 'ISSUES'}
          </span>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedSeverity('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              selectedSeverity === 'ALL'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('critical')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              selectedSeverity === 'critical'
                ? 'bg-red-600 text-white'
                : 'text-red-700 bg-red-50 hover:bg-red-100'
            }`}
          >
            Critical ({criticalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('warning')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              selectedSeverity === 'warning'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            Warnings ({warningCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedSeverity('info')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              selectedSeverity === 'info'
                ? 'bg-blue-600 text-white'
                : 'text-blue-800 bg-blue-50 hover:bg-blue-100'
            }`}
          >
            Info ({infoCount})
          </button>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="p-3 bg-white border-b border-slate-100">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search syntax alerts (e.g., match-vip, wan1, 3des)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="p-4 space-y-3 max-h-[480px] overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-slate-700">No syntax issues detected</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Configuration is fully compliant.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getAlertCardStyle(alert.severity);

            return (
              <div
                key={alert.id}
                className={`p-3.5 border rounded-lg transition-all ${style.container}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-start gap-2">
                    {style.icon}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs font-bold ${style.title}`}>
                          {alert.title}
                        </h4>
                        {alert.appliedFix && (
                          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            AUTO-FIXED
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${style.desc}`}>
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {alert.sourceLine && onJumpToLine && (
                      <button
                        type="button"
                        onClick={() => onJumpToLine(alert.sourceLine!)}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 transition"
                      >
                        L:{alert.sourceLine}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onExplainAlertWithAi(alert)}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 hover:text-indigo-600 border border-slate-200 transition"
                      title="AI Deep Analysis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    </button>
                  </div>
                </div>

                {/* Remediation Snippet */}
                {alert.remediationSnippet && (
                  <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                    <pre className="text-[10px] font-mono text-slate-700 bg-white/80 px-2 py-1 rounded border border-slate-200 overflow-x-auto flex-1">
                      {alert.remediationSnippet}
                    </pre>
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(alert.remediationSnippet!, alert.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shrink-0"
                    >
                      {copiedSnippetId === alert.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
