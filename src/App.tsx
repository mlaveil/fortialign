import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Zap,
  FileDown,
} from 'lucide-react';
import {
  FortiGateModelDef,
  FortiOSVersion,
  MigrationAlert,
  InterfaceMapping,
  ConversionOptions,
  ConversionResult,
  DiffLine,
  ConfigStats,
} from './types/fortigate';
import {
  FORTIGATE_MODELS,
  SAMPLE_CONFIGS,
  getModelById,
} from './data/fortigateModels';
import { FortiOSConverter } from './engine/converter';
import { DiffEngine } from './engine/diffEngine';
import { generateMigrationPdfReport } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { ModelSelector } from './components/ModelSelector';
import { ConversionControls } from './components/ConversionControls';
import { AlertNotificationCenter } from './components/AlertNotificationCenter';
import { DiffViewer } from './components/DiffViewer';
import { PortMappingMatrix } from './components/PortMappingMatrix';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { MigrationReportModal } from './components/MigrationReportModal';

export default function App() {
  const converter = useMemo(() => new FortiOSConverter(), []);
  const diffEngine = useMemo(() => new DiffEngine(), []);

  // Appliance state
  const [sourceModel, setSourceModel] = useState<FortiGateModelDef>(FORTIGATE_MODELS[1]); // FG-60E
  const [sourceVersion, setSourceVersion] = useState<FortiOSVersion>('6.2');
  const [targetModel, setTargetModel] = useState<FortiGateModelDef>(FORTIGATE_MODELS[7]); // FG-60F
  const [targetVersion, setTargetVersion] = useState<FortiOSVersion>('7.4');

  // Active top-level navigation tab
  const [activeTab, setActiveTab] = useState<'workbench' | 'matrix' | 'alerts' | 'report'>('workbench');

  // Config text
  const [sourceConfig, setSourceConfig] = useState<string>(SAMPLE_CONFIGS[0].config);
  const [targetConfig, setTargetConfig] = useState<string>('');

  // Port mappings state
  const [portMappings, setPortMappings] = useState<InterfaceMapping[]>(() =>
    converter.generateDefaultPortMappings(FORTIGATE_MODELS[1], FORTIGATE_MODELS[7])
  );

  // Conversion Options
  const [options, setOptions] = useState<ConversionOptions>({
    autoFixSyntaxErrors: true,
    autoRemapInterfaces: true,
    modernizeSdwanToZones: true,
    upgradeDeprecatedCiphers: true,
    removeObsoleteNpuRegisters: true,
    stripEncryptedPasswords: false,
    reindexPolicyIds: false,
    generateMissingUuids: true,
    fixMatchVipSyntax: true,
    standardizeSslVpnPortal: true,
    addMigrationAuditHeader: true,
    preserveCustomComments: true,
  });

  // Results & Alerts
  const [alerts, setAlerts] = useState<MigrationAlert[]>([]);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [stats, setStats] = useState<ConfigStats | undefined>(undefined);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(100);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // Modals & Panels
  const [isPortMappingOpen, setIsPortMappingOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(true);
  const [activeAlertToExplain, setActiveAlertToExplain] = useState<MigrationAlert | null>(null);

  // Execute Conversion
  const runConversion = useCallback(() => {
    setIsConverting(true);
    try {
      const result: ConversionResult = converter.convert(
        sourceConfig,
        sourceModel.id,
        sourceVersion,
        targetModel.id,
        targetVersion,
        portMappings,
        options
      );

      setTargetConfig(result.convertedConfig);
      setAlerts(result.alerts);
      setStats(result.stats);
      setCompatibilityScore(result.compatibilityScore);

      const diffs = diffEngine.computeDiff(
        sourceConfig,
        result.convertedConfig,
        result.alerts
      );
      setDiffLines(diffs);
    } catch (err) {
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  }, [
    converter,
    diffEngine,
    sourceConfig,
    sourceModel.id,
    sourceVersion,
    targetModel.id,
    targetVersion,
    portMappings,
    options,
  ]);

  // Run conversion on initial load or when model mappings change
  useEffect(() => {
    runConversion();
  }, [sourceModel, targetModel, sourceVersion, targetVersion, portMappings, options]);

  // Handle Model Changes
  const handleSourceModelChange = (model: FortiGateModelDef) => {
    setSourceModel(model);
    const newMappings = converter.generateDefaultPortMappings(model, targetModel);
    setPortMappings(newMappings);
  };

  const handleTargetModelChange = (model: FortiGateModelDef) => {
    setTargetModel(model);
    const newMappings = converter.generateDefaultPortMappings(sourceModel, model);
    setPortMappings(newMappings);
  };

  const handleSwapModels = () => {
    const prevSrc = sourceModel;
    const prevSrcVer = sourceVersion;
    const prevTgt = targetModel;
    const prevTgtVer = targetVersion;

    setSourceModel(prevTgt);
    setSourceVersion(prevTgtVer);
    setTargetModel(prevSrc);
    setTargetVersion(prevSrcVer);

    const newMappings = converter.generateDefaultPortMappings(prevTgt, prevSrc);
    setPortMappings(newMappings);
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_CONFIGS.find((p) => p.id === presetId);
    if (!preset) return;

    const src = getModelById(preset.sourceModel);
    const tgt = getModelById(preset.targetModel);

    setSourceModel(src);
    setSourceVersion(preset.sourceVersion);
    setTargetModel(tgt);
    setTargetVersion(preset.targetVersion);
    setSourceConfig(preset.config);

    const newMappings = converter.generateDefaultPortMappings(src, tgt);
    setPortMappings(newMappings);
  };

  // File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setSourceConfig(content);
      }
    };
    reader.readAsText(file);
  };

  // Paste Clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceConfig(text);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  // Update Individual Port Mapping
  const handleUpdatePortMapping = (sourcePort: string, newTargetPort: string) => {
    setPortMappings((prev) =>
      prev.map((m) =>
        m.sourcePort === sourcePort
          ? {
              ...m,
              targetPort: newTargetPort,
              status: sourcePort === newTargetPort ? 'mapped' : 'custom',
              note: `Custom user remap ➔ ${newTargetPort}`,
            }
          : m
      )
    );
  };

  const handleResetPortMappings = () => {
    const defaults = converter.generateDefaultPortMappings(sourceModel, targetModel);
    setPortMappings(defaults);
  };

  // Jump to code line from Alert Card
  const handleJumpToLine = (lineNumber: number) => {
    setHighlightedLine(lineNumber);
    const el = document.getElementById(`diff-line-${lineNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // AI Explain Alert
  const handleExplainAlert = (alert: MigrationAlert) => {
    setActiveAlertToExplain(alert);
    setIsAiModalOpen(true);
  };

  // Download Target Converted File
  const handleDownloadConfig = () => {
    const blob = new Blob([targetConfig], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fortigate_${targetModel.name.replace(/\s+/g, '_')}_v${targetVersion}_${new Date().toISOString().slice(0, 10)}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export PDF Migration Audit Report
  const handleExportPdf = () => {
    generateMigrationPdfReport({
      sourceModel,
      sourceVersion,
      targetModel,
      targetVersion,
      alerts,
      interfaceMappings: portMappings,
      compatibilityScore,
      stats,
    });
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const parsedLinesCount = targetConfig ? targetConfig.split('\n').length : sourceConfig.split('\n').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        sourceModel={sourceModel}
        sourceVersion={sourceVersion}
        targetModel={targetModel}
        targetVersion={targetVersion}
        alerts={alerts}
        compatibilityScore={compatibilityScore}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAiAnalysis={() => {
          setActiveAlertToExplain(null);
          setIsAiModalOpen(true);
        }}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenPortMapping={() => setIsPortMappingOpen(true)}
        onDownloadConfig={handleDownloadConfig}
        onExportPdf={handleExportPdf}
        onToggleAlerts={() => setIsAlertsOpen(!isAlertsOpen)}
        isAlertsOpen={isAlertsOpen}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hardware & Firmware Alignment Selector */}
        <ModelSelector
          sourceModel={sourceModel}
          sourceVersion={sourceVersion}
          targetModel={targetModel}
          targetVersion={targetVersion}
          onSourceModelChange={handleSourceModelChange}
          onSourceVersionChange={setSourceVersion}
          onTargetModelChange={handleTargetModelChange}
          onTargetVersionChange={setTargetVersion}
          onSwapModels={handleSwapModels}
        />

        {/* Engine Controls & Remediation Rules */}
        <ConversionControls
          options={options}
          onOptionsChange={setOptions}
          onConvert={runConversion}
          onLoadPreset={handleLoadPreset}
          onFileUpload={handleFileUpload}
          onPasteClipboard={handlePasteClipboard}
          onClearConfig={() => setSourceConfig('')}
          isConverting={isConverting}
        />

        {/* 2-Column Responsive Workspace: Alerts & Stats on Left/Right, Diff Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Diff Terminal Viewer */}
          <div className="lg:col-span-8 space-y-6">
            <DiffViewer
              sourceConfig={sourceConfig}
              targetConfig={targetConfig}
              diffLines={diffLines}
              stats={stats}
              alerts={alerts}
              onSourceChange={setSourceConfig}
              onExplainAlert={handleExplainAlert}
              highlightedLine={highlightedLine}
            />
          </div>

          {/* Right Sidebar: Syntax Alerts & Conversion Stats Tile */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Syntax Alerts Component */}
            <AlertNotificationCenter
              alerts={alerts}
              onJumpToLine={handleJumpToLine}
              onExplainAlertWithAi={handleExplainAlert}
              isOpen={isAlertsOpen}
              onToggle={() => setIsAlertsOpen(!isAlertsOpen)}
            />

            {/* Sleek Stats Tile */}
            <div className="bg-slate-800 rounded-xl p-5 text-white flex flex-col shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Conversion Statistics
                </h4>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex items-center gap-1 text-[10px] font-semibold text-red-400 hover:text-red-300 transition"
                  title="Download PDF report"
                >
                  <FileDown className="w-3 h-3" />
                  <span>PDF Export</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="flex flex-col">
                  <span className="text-2xl font-light font-mono">{compatibilityScore}%</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Compatibility
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-light text-green-400 font-mono">0.8s</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Process Time
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-light font-mono">{parsedLinesCount}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Lines Parsed
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-2xl font-light font-mono ${criticalCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                    {criticalCount}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                    Fatal Errors
                  </span>
                </div>
              </div>

              {/* Action bar inside stats card */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Download Audit PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition"
                >
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <PortMappingMatrix
        isOpen={isPortMappingOpen}
        onClose={() => {
          setIsPortMappingOpen(false);
          setActiveTab('workbench');
        }}
        sourceModel={sourceModel}
        targetModel={targetModel}
        mappings={portMappings}
        onUpdateMapping={handleUpdatePortMapping}
        onResetMappings={handleResetPortMappings}
      />

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setActiveAlertToExplain(null);
        }}
        sourceModel={sourceModel}
        sourceVersion={sourceVersion}
        targetModel={targetModel}
        targetVersion={targetVersion}
        configSnippet={sourceConfig}
        alerts={alerts}
        activeAlertToExplain={activeAlertToExplain}
      />

      <MigrationReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setActiveTab('workbench');
        }}
        sourceModel={sourceModel}
        sourceVersion={sourceVersion}
        targetModel={targetModel}
        targetVersion={targetVersion}
        alerts={alerts}
        interfaceMappings={portMappings}
        compatibilityScore={compatibilityScore}
        stats={stats}
      />

      {/* Footer */}
      <footer className="h-12 bg-slate-900 text-slate-400 flex items-center justify-between px-4 sm:px-8 shrink-0 text-[11px] font-medium border-t border-slate-800">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5 text-slate-300 font-mono">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            PARSER CORE V2.4.1
          </span>
          <span className="hidden sm:inline font-mono">E_F_G_MAPPING_DB: v2024.08</span>
          <span className="hidden md:inline font-mono">SYNTAX_AUDIT: ACTIVE</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="hidden sm:inline font-mono">USER: STK_ADMIN_01</span>
          <span className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono text-[10px]">
            PRODUCTION ENVIRONMENT
          </span>
        </div>
      </footer>
    </div>
  );
}
