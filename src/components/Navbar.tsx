import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Sparkles,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRightLeft,
  FileDown,
} from 'lucide-react';
import { FortiGateModelDef, FortiOSVersion, MigrationAlert } from '../types/fortigate';

interface NavbarProps {
  sourceModel: FortiGateModelDef;
  sourceVersion: FortiOSVersion;
  targetModel: FortiGateModelDef;
  targetVersion: FortiOSVersion;
  alerts: MigrationAlert[];
  compatibilityScore: number;
  activeTab: 'workbench' | 'matrix' | 'alerts' | 'report';
  onTabChange: (tab: 'workbench' | 'matrix' | 'alerts' | 'report') => void;
  onOpenAiAnalysis: () => void;
  onOpenReport: () => void;
  onOpenPortMapping: () => void;
  onDownloadConfig: () => void;
  onExportPdf?: () => void;
  onToggleAlerts: () => void;
  isAlertsOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  sourceModel,
  sourceVersion,
  targetModel,
  targetVersion,
  alerts,
  compatibilityScore,
  activeTab,
  onTabChange,
  onOpenAiAnalysis,
  onOpenReport,
  onOpenPortMapping,
  onDownloadConfig,
  onExportPdf,
  onToggleAlerts,
  isAlertsOpen,
}) => {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm sticky top-0 z-30">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-sm">
          <div className="w-4 h-4 border-2 border-white rotate-45"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
            FortiGate <span className="text-red-600">Conversion</span> Engine
          </span>
          <span className="text-[10px] text-slate-400 font-mono -mt-0.5 hidden sm:inline">
            E ⇄ F ⇄ G Hardware &amp; FortiOS Normalizer
          </span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
        <button
          onClick={() => onTabChange('workbench')}
          className={`h-16 flex items-center pt-1 border-b-2 transition ${
            activeTab === 'workbench'
              ? 'text-red-600 border-red-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Workbench
        </button>

        <button
          onClick={() => {
            onTabChange('matrix');
            onOpenPortMapping();
          }}
          className={`h-16 flex items-center pt-1 border-b-2 transition ${
            activeTab === 'matrix'
              ? 'text-red-600 border-red-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Model Mapping
        </button>

        <button
          onClick={() => {
            onTabChange('alerts');
            if (!isAlertsOpen) onToggleAlerts();
          }}
          className={`h-16 flex items-center pt-1 border-b-2 transition gap-1.5 ${
            activeTab === 'alerts'
              ? 'text-red-600 border-red-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Syntax Alerts</span>
          {alerts.length > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                criticalCount > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {alerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onTabChange('report');
            onOpenReport();
          }}
          className={`h-16 flex items-center pt-1 border-b-2 transition gap-1.5 ${
            activeTab === 'report'
              ? 'text-red-600 border-red-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Report</span>
        </button>
      </nav>

      {/* Right Controls & Engine Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Export PDF Button */}
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
            title="Download PDF Migration Report"
          >
            <FileDown className="w-3.5 h-3.5 text-red-600" />
            <span>Export PDF</span>
          </button>
        )}

        {/* AI Architect Button */}
        <button
          onClick={onOpenAiAnalysis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">AI Migration Audit</span>
        </button>

        {/* Download Converted Config */}
        <button
          onClick={onDownloadConfig}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200 transition-all"
          title="Download Converted FortiGate Config (.conf)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .conf</span>
        </button>
      </div>
    </header>
  );
};
