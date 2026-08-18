import React from 'react';
import {
  Play,
  Upload,
  Clipboard,
  Trash2,
  Sparkles,
  Settings2,
  ShieldCheck,
  Zap,
  Check,
  FileCode,
  Wrench,
  CheckCircle2,
  Sliders,
  Flame,
} from 'lucide-react';
import { ConversionOptions } from '../types/fortigate';
import { SAMPLE_CONFIGS } from '../data/fortigateModels';

interface ConversionControlsProps {
  options: ConversionOptions;
  onOptionsChange: (newOptions: ConversionOptions) => void;
  onConvert: () => void;
  onLoadPreset: (presetId: string) => void;
  onFileUpload: (file: File) => void;
  onPasteClipboard: () => void;
  onClearConfig: () => void;
  isConverting: boolean;
}

export const ConversionControls: React.FC<ConversionControlsProps> = ({
  options,
  onOptionsChange,
  onConvert,
  onLoadPreset,
  onFileUpload,
  onPasteClipboard,
  onClearConfig,
  isConverting,
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOptionToggle = (key: keyof ConversionOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  const handleMasterAutoFixToggle = () => {
    const nextState = !options.autoFixSyntaxErrors;
    onOptionsChange({
      ...options,
      autoFixSyntaxErrors: nextState,
      // If toggled ON, enable essential sub-remediations
      ...(nextState
        ? {
            fixMatchVipSyntax: true,
            upgradeDeprecatedCiphers: true,
            removeObsoleteNpuRegisters: true,
            generateMissingUuids: true,
            standardizeSslVpnPortal: true,
          }
        : {}),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Presets & Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-red-500" />
            Quick Presets:
          </span>
          {SAMPLE_CONFIGS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onLoadPreset(sample.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title={sample.description}
            >
              {sample.name}
            </button>
          ))}
        </div>

        {/* Upload & Paste Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".conf,.txt,.cfg"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Upload FortiGate .conf file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload .conf</span>
          </button>

          <button
            type="button"
            onClick={onPasteClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-600" />
            <span>Paste</span>
          </button>

          <button
            type="button"
            onClick={onClearConfig}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Clear configuration"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-Fix Master Banner */}
      <div
        onClick={handleMasterAutoFixToggle}
        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          options.autoFixSyntaxErrors
            ? 'bg-gradient-to-r from-red-50/80 via-slate-50 to-white border-red-200 shadow-xs'
            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition ${
              options.autoFixSyntaxErrors
                ? 'bg-red-600 text-white shadow-red-200'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Auto-Fix Engine
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  options.autoFixSyntaxErrors
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {options.autoFixSyntaxErrors ? 'Enabled (Auto-Patch Active)' : 'Disabled (Report Only)'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Automatically patches minor syntax discrepancies, missing policy UUIDs, unquoted strings, deprecated VIP tags, and legacy ciphers without manual intervention.
            </p>
          </div>
        </div>

        {/* Master Switch UI */}
        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <span className="text-xs font-semibold text-slate-500 hidden md:inline">
            {options.autoFixSyntaxErrors ? 'Auto-Remediation On' : 'Manual Audit Only'}
          </span>
          <div
            className={`w-12 h-6 rounded-full relative transition-colors duration-200 p-0.5 ${
              options.autoFixSyntaxErrors ? 'bg-red-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 flex items-center justify-center ${
                options.autoFixSyntaxErrors ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {options.autoFixSyntaxErrors && (
                <Check className="w-3 h-3 text-red-600 stroke-[3]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Engine Preferences & Remediation Rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            Granular Remediation Rules
          </h3>
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-xs text-red-600 hover:text-red-700 font-semibold"
          >
            {showAdvancedOptions ? 'Compact View' : 'All Rules'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Toggle 1: Auto-remap interfaces */}
          <div
            onClick={() => handleOptionToggle('autoRemapInterfaces')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Auto-resolve Interfaces</span>
              <span className="text-[10px] text-slate-500 block">Remap physical ports across generations</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.autoRemapInterfaces ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.autoRemapInterfaces ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 2: SD-WAN to Zones */}
          <div
            onClick={() => handleOptionToggle('modernizeSdwanToZones')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Modernize SD-WAN Zones</span>
              <span className="text-[10px] text-slate-500 block">virtual-wan-link ➔ system sdwan</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.modernizeSdwanToZones ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.modernizeSdwanToZones ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 3: Upgrade weak ciphers */}
          <div
            onClick={() => handleOptionToggle('upgradeDeprecatedCiphers')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Upgrade Legacy Ciphers</span>
              <span className="text-[10px] text-slate-500 block">3DES/MD5 ➔ AES256-GCM / DH19</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.upgradeDeprecatedCiphers ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.upgradeDeprecatedCiphers ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 4: Clean NP6 registers */}
          <div
            onClick={() => handleOptionToggle('removeObsoleteNpuRegisters')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Clean Legacy NPU Regs</span>
              <span className="text-[10px] text-slate-500 block">Strip NP6 fastpath for NP7/SP5</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.removeObsoleteNpuRegisters ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.removeObsoleteNpuRegisters ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 5: Fix match-vip */}
          <div
            onClick={() => handleOptionToggle('fixMatchVipSyntax')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Fix 7.0+ VIP Syntax</span>
              <span className="text-[10px] text-slate-500 block">Strip deprecated 'match-vip enable'</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.fixMatchVipSyntax ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.fixMatchVipSyntax ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 6: Generate Missing UUIDs */}
          <div
            onClick={() => handleOptionToggle('generateMissingUuids')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Generate Policy UUIDs</span>
              <span className="text-[10px] text-slate-500 block">Inject RFC 4122 policy identifiers</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.generateMissingUuids ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.generateMissingUuids ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>

          {/* Toggle 7: Standardize SSL-VPN Portal (Visible in All Rules) */}
          {(showAdvancedOptions || options.standardizeSslVpnPortal) && (
            <div
              onClick={() => handleOptionToggle('standardizeSslVpnPortal')}
              className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
            >
              <div>
                <span className="text-xs font-semibold text-slate-800 block">FortiOS 7.4+ SSL-VPN</span>
                <span className="text-[10px] text-slate-500 block">Enforce tunnel-mode / disable web-mode</span>
              </div>
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  options.standardizeSslVpnPortal ? 'bg-red-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                    options.standardizeSslVpnPortal ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Toggle 8: Migration Audit Header */}
          <div
            onClick={() => handleOptionToggle('addMigrationAuditHeader')}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg cursor-pointer transition border border-slate-100"
          >
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Insert Audit Header</span>
              <span className="text-[10px] text-slate-500 block">Add metadata &amp; timestamp comment</span>
            </div>
            <div
              className={`w-8 h-4 rounded-full relative transition-colors ${
                options.addMigrationAuditHeader ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${
                  options.addMigrationAuditHeader ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="h-20 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            MIGRATION ENGINE STATUS
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Ready for Configuration Conversion
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onConvert}
            disabled={isConverting}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-200 transition-all flex items-center gap-2"
          >
            {isConverting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Generate Converted Config</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
