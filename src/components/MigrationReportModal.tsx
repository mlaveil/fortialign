import React, { useState } from 'react';
import {
  FileText,
  X,
  Download,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  FileCheck2,
  Sparkles,
  BarChart3,
  ListOrdered,
  FileDown,
} from 'lucide-react';
import {
  FortiGateModelDef,
  FortiOSVersion,
  MigrationAlert,
  InterfaceMapping,
  ConfigStats,
} from '../types/fortigate';
import { generateMigrationPdfReport } from '../utils/pdfExport';

interface MigrationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceModel: FortiGateModelDef;
  sourceVersion: FortiOSVersion;
  targetModel: FortiGateModelDef;
  targetVersion: FortiOSVersion;
  alerts: MigrationAlert[];
  interfaceMappings: InterfaceMapping[];
  compatibilityScore: number;
  stats?: ConfigStats;
}

export const MigrationReportModal: React.FC<MigrationReportModalProps> = ({
  isOpen,
  onClose,
  sourceModel,
  sourceVersion,
  targetModel,
  targetVersion,
  alerts,
  interfaceMappings,
  compatibilityScore,
  stats,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  if (!isOpen) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const infoCount = alerts.filter((a) => a.severity === 'info').length;
  const remappedCount = interfaceMappings.filter((m) => m.sourcePort !== m.targetPort).length;

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      generateMigrationPdfReport({
        sourceModel,
        sourceVersion,
        targetModel,
        targetVersion,
        alerts,
        interfaceMappings,
        compatibilityScore,
        stats,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const generateMarkdownReport = (): string => {
    return `# FortiGate Hardware & Firmware Migration Audit Report
Generated: ${new Date().toISOString()}

## Executive Summary
- **Source Appliance**: FortiGate ${sourceModel.name} (FortiOS v${sourceVersion}) [ASIC: ${sourceModel.asicType}]
- **Target Appliance**: FortiGate ${targetModel.name} (FortiOS v${targetVersion}) [ASIC: ${targetModel.asicType}]
- **Overall Migration Readiness Score**: ${compatibilityScore}/100
- **Identified Issues**: ${criticalCount} Critical Blockers, ${warningCount} Warnings, ${infoCount} Optimizations.
${
  stats
    ? `
## Configuration Statistics & Summary
- **Firewall Policies**: ${stats.firewallPoliciesCount}
- **Interfaces Parsed**: ${stats.interfacesCount} (${remappedCount} remapped)
- **Address & Group Objects**: ${stats.addressObjectsCount}
- **Static Routes & Gateways**: ${stats.staticRoutesCount}
- **VPN Tunnels**: ${stats.vpnTunnelsCount}
- **SD-WAN Rules**: ${stats.sdwanRulesCount}
- **Encrypted Passwords Flagged**: ${stats.encryptedPasswordsCount}
`
    : ''
}

## Port & Interface Translations
| Source Interface | Target Interface | Translation Status | Notes |
|---|---|---|---|
${interfaceMappings.map((m) => `| \`${m.sourcePort}\` | \`${m.targetPort}\` | ${m.status.toUpperCase()} | ${m.note || '-'} |`).join('\n')}

## Migration Alerts & Syntax Remediations
${
  alerts.length > 0
    ? alerts
        .map(
          (a, i) => `### ${i + 1}. [${a.severity.toUpperCase()}] ${a.title}
- **Category**: ${a.category}
- **Source Line**: ${a.sourceLine || 'N/A'}
- **Description**: ${a.description}
- **Recommended Remediation**: ${a.suggestedRemedy || 'None required.'}
${a.remediationSnippet ? `\`\`\`bash\n${a.remediationSnippet}\n\`\`\`` : ''}
`
        )
        .join('\n')
    : 'No syntax alerts detected. Clean configuration.'
}

## Pre- & Post-Loading Verification Checklist
- [ ] Verify physical interfaces on ${targetModel.name} link up (\`get system interface physical\`).
- [ ] Re-enter plaintext secrets for all \`ENC ...\` lines flagged in critical alerts.
- [ ] Confirm SD-WAN member health check status (\`diagnose sys sdwan health-check status\`).
- [ ] Validate IPsec tunnel establishment (\`get vpn ipsec tunnel summary\`).
- [ ] Verify static route table and default gateways (\`get router info routing-table all\`).
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = generateMarkdownReport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fortigate_migration_audit_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  FortiGate Migration Audit Report
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  PDF &amp; MD Export
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official hardware transition, port mapping, and compliance change record
              </p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm transition"
              title="Generate and download high-resolution PDF report with tables and stats"
            >
              {pdfSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
              title="Download as Markdown file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Download .MD</span>
            </button>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
              title="Copy Markdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* 1. Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                Readiness Score
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono flex items-center gap-2">
                <span>{compatibilityScore}%</span>
                {compatibilityScore >= 80 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {compatibilityScore >= 85
                  ? 'High confidence - suitable for production deployment.'
                  : 'Action required on critical items before loading.'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                Detected Issues &amp; Flags
              </div>
              <div className="text-xs font-semibold text-slate-800 space-y-1 mt-1">
                <div className="flex justify-between">
                  <span className="text-red-600">Critical Blockers:</span>
                  <span className="font-mono font-bold">{criticalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">Syntax Warnings:</span>
                  <span className="font-mono font-bold">{warningCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Optimizations:</span>
                  <span className="font-mono font-bold">{infoCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                Hardware Transition
              </div>
              <div className="text-xs font-mono text-slate-700 mt-1 space-y-0.5">
                <div className="font-semibold text-slate-900">{sourceModel.name} ({sourceModel.asicType})</div>
                <div className="text-red-500 font-bold flex items-center gap-1">
                  <span>↓ FortiOS v{sourceVersion} ➔ v{targetVersion}</span>
                </div>
                <div className="text-slate-900 font-bold">{targetModel.name} ({targetModel.asicType})</div>
              </div>
            </div>
          </div>

          {/* 2. Configuration Object Statistics Breakdown */}
          {stats && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-red-600" />
                  Configuration Object &amp; Remediation Statistics
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Engine Parsed &amp; Normalized
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Firewall Policies
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {stats.firewallPoliciesCount}
                  </div>
                  <span className="text-[10px] text-slate-400">UUIDs aligned</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Interfaces Mapped
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {remappedCount} / {stats.interfacesCount}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Ports translated</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Address Objects
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {stats.addressObjectsCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Subnets &amp; FQDNs</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Static Routes
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {stats.staticRoutesCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Gateways aligned</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    VPN Tunnels
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {stats.vpnTunnelsCount}
                  </div>
                  <span className="text-[10px] text-slate-400">IPsec / SSL VPN</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    SD-WAN Rules
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {stats.sdwanRulesCount}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Zone-based syntax</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Encrypted Secrets
                  </span>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${stats.encryptedPasswordsCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {stats.encryptedPasswordsCount}
                  </div>
                  <span className="text-[10px] text-red-500 font-semibold">Flagged for re-entry</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Target Form Factor
                  </span>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                    {targetModel.formFactor}
                  </div>
                  <span className="text-[10px] text-slate-400">{targetModel.throughput}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Section: Port Mapping Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-red-600" />
              Interface Translation Summary ({interfaceMappings.length} ports)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-[11px]">
              {interfaceMappings.map((m) => (
                <div
                  key={m.sourcePort}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-xs"
                >
                  <span className="text-slate-700 font-bold">{m.sourcePort}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-red-600 font-bold">{m.targetPort}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Section: Pre- & Post-Migration Validation Steps */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-red-600" />
              Post-Migration Verification Procedures
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-mono font-bold">1.</span>
                <span>Restore target configuration via FortiGate WebUI (<strong>System &gt; Configuration &gt; Restore</strong>) or FortiManager device database.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-mono font-bold">2.</span>
                <span>Execute <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono font-semibold">diagnose debug config-error-log read</code> to confirm 0 parse errors on boot.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-mono font-bold">3.</span>
                <span>Re-enter plaintext credentials for flagged <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono font-semibold">ENC ...</code> IPsec PSKs or Admin secrets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-mono font-bold">4.</span>
                <span>Verify IPsec phase 1 &amp; 2 tunnel status with <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono font-semibold">get vpn ipsec tunnel summary</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-mono font-bold">5.</span>
                <span>Verify SD-WAN health-checks with <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-mono font-semibold">diagnose sys sdwan health-check status</code>.</span>
              </li>
            </ul>
          </div>

          {/* Quick PDF Export Banner at Bottom */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
            <div>
              <h4 className="font-bold text-xs text-white">Need an official PDF for change approval?</h4>
              <p className="text-[11px] text-slate-300">
                Exports complete executive summary, object tables, remapped ports, and security audit checklist.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF Document'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
