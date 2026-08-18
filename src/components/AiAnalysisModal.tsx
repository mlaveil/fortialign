import React from 'react';
import {
  Sparkles,
  X,
  Send,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileCode,
  Terminal,
} from 'lucide-react';
import { FortiGateModelDef, FortiOSVersion, MigrationAlert } from '../types/fortigate';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceModel: FortiGateModelDef;
  sourceVersion: FortiOSVersion;
  targetModel: FortiGateModelDef;
  targetVersion: FortiOSVersion;
  configSnippet: string;
  alerts: MigrationAlert[];
  activeAlertToExplain?: MigrationAlert | null;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  sourceModel,
  sourceVersion,
  targetModel,
  targetVersion,
  configSnippet,
  alerts,
  activeAlertToExplain,
}) => {
  const [analysisText, setAnalysisText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = React.useState<string>('');
  const [copied, setCopied] = React.useState<boolean>(false);

  const fetchAnalysis = async (promptOverride?: string) => {
    setLoading(true);
    try {
      if (activeAlertToExplain && !promptOverride) {
        const res = await fetch('/api/gemini/explain-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert: activeAlertToExplain,
            sourceModel: sourceModel.name,
            targetModel: targetModel.name,
            sourceVersion,
            targetVersion,
          }),
        });
        const data = await res.json();
        setAnalysisText(data.explanation || data.error || 'No analysis available.');
      } else {
        const res = await fetch('/api/gemini/analyze-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceModel: sourceModel.name,
            sourceVersion,
            targetModel: targetModel.name,
            targetVersion,
            configSnippet,
            alerts,
            customPrompt: promptOverride || customPrompt,
          }),
        });
        const data = await res.json();
        setAnalysisText(
          data.analysis || data.fallbackAnalysis || data.error || 'Analysis complete.'
        );
      }
    } catch (err: any) {
      setAnalysisText(`Error generating AI analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, activeAlertToExplain]);

  const handleSendCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    fetchAnalysis(customPrompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  FortiOS AI Migration Architect
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Architectural inspection for FortiGate {sourceModel.name} (v{sourceVersion}) ➔ {targetModel.name} (v{targetVersion})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Copy Analysis"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Analyzing hardware ASICs, breaking syntax, and validation commands...
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 text-green-400 rounded-xl p-5 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto shadow-inner whitespace-pre-wrap">
              {analysisText}
            </div>
          )}
        </div>

        {/* Custom Prompt Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form onSubmit={handleSendCustomPrompt} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a specific FortiOS question (e.g. 'How do I diagnose IPsec phase 1 on 60F?')..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
