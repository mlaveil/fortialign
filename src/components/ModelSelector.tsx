import React from 'react';
import {
  Cpu,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Server,
  Zap,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import {
  FortiGateModelDef,
  FortiOSVersion,
  FortiGateGeneration,
} from '../types/fortigate';
import { FORTIGATE_MODELS } from '../data/fortigateModels';

interface ModelSelectorProps {
  sourceModel: FortiGateModelDef;
  sourceVersion: FortiOSVersion;
  targetModel: FortiGateModelDef;
  targetVersion: FortiOSVersion;
  onSourceModelChange: (model: FortiGateModelDef) => void;
  onSourceVersionChange: (ver: FortiOSVersion) => void;
  onTargetModelChange: (model: FortiGateModelDef) => void;
  onTargetVersionChange: (ver: FortiOSVersion) => void;
  onSwapModels: () => void;
}

const FIRMWARE_VERSIONS: FortiOSVersion[] = [
  '5.6',
  '6.0',
  '6.2',
  '6.4',
  '7.0',
  '7.2',
  '7.4',
  '7.6',
];

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  sourceModel,
  sourceVersion,
  targetModel,
  targetVersion,
  onSourceModelChange,
  onSourceVersionChange,
  onTargetModelChange,
  onTargetVersionChange,
  onSwapModels,
}) => {
  const [sourceGenFilter, setSourceGenFilter] = React.useState<FortiGateGeneration | 'ALL'>('ALL');
  const [targetGenFilter, setTargetGenFilter] = React.useState<FortiGateGeneration | 'ALL'>('ALL');

  const filteredSourceModels =
    sourceGenFilter === 'ALL'
      ? FORTIGATE_MODELS
      : FORTIGATE_MODELS.filter((m) => m.generation === sourceGenFilter);

  const filteredTargetModels =
    targetGenFilter === 'ALL'
      ? FORTIGATE_MODELS
      : FORTIGATE_MODELS.filter((m) => m.generation === targetGenFilter);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Hardware Platform &amp; Firmware Alignment
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="font-semibold text-slate-700">{sourceModel.name}</span>
          <span className="text-red-500">➔</span>
          <span className="font-semibold text-red-600">{targetModel.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Source Appliance Box */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Source Appliance
            </label>
            <span className="text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold bg-white text-slate-700 border-slate-300">
              {sourceModel.generation}-Series
            </span>
          </div>

          <div className="space-y-3">
            {/* Gen Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Platform Generation
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ALL', 'E', 'F', 'G', 'VM'] as const).map((gen) => (
                  <button
                    key={`src-gen-${gen}`}
                    type="button"
                    onClick={() => setSourceGenFilter(gen)}
                    className={`py-1.5 rounded-lg border-2 text-xs font-bold transition ${
                      sourceGenFilter === gen
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {gen === 'ALL' ? 'All' : `${gen}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hardware Model
              </label>
              <select
                value={sourceModel.id}
                onChange={(e) => {
                  const m = FORTIGATE_MODELS.find((item) => item.id === e.target.value);
                  if (m) onSourceModelChange(m);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
              >
                {filteredSourceModels.map((m) => (
                  <option key={`src-opt-${m.id}`} value={m.id}>
                    {m.name} ({m.generation}-Series • {m.asicType} • {m.throughput})
                  </option>
                ))}
              </select>
            </div>

            {/* Firmware Version */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                FortiOS Source Firmware
              </label>
              <select
                value={sourceVersion}
                onChange={(e) => onSourceVersionChange(e.target.value as FortiOSVersion)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
              >
                {FIRMWARE_VERSIONS.map((ver) => (
                  <option key={`src-ver-${ver}`} value={ver}>
                    FortiOS v{ver} {parseFloat(ver) < 6.4 ? '(Legacy Syntax)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Specs bar */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span>{sourceModel.asicType}</span>
              </span>
              <span>{sourceModel.defaultPorts.length} Ports</span>
            </div>
          </div>
        </div>

        {/* Center Swap Arrow */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={onSwapModels}
            className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-red-600 border border-slate-200 flex items-center justify-center shadow-sm transition hover:scale-105"
            title="Swap Source and Target Models"
          >
            <ArrowRightLeft className="w-4 h-4 text-red-600" />
          </button>
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cross-Gen
            </span>
            <div className="text-[11px] font-bold text-red-600">
              {sourceModel.generation} ➔ {targetModel.generation}
            </div>
          </div>
        </div>

        {/* Target Appliance Box */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Target Appliance
            </label>
            <span className="text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold bg-red-50 text-red-600 border-red-200">
              {targetModel.generation}-Series
            </span>
          </div>

          <div className="space-y-3">
            {/* Gen Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Platform Generation
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ALL', 'E', 'F', 'G', 'VM'] as const).map((gen) => (
                  <button
                    key={`tgt-gen-${gen}`}
                    type="button"
                    onClick={() => setTargetGenFilter(gen)}
                    className={`py-1.5 rounded-lg border-2 text-xs font-bold transition ${
                      targetGenFilter === gen
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {gen === 'ALL' ? 'All' : `${gen}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hardware Model
              </label>
              <select
                value={targetModel.id}
                onChange={(e) => {
                  const m = FORTIGATE_MODELS.find((item) => item.id === e.target.value);
                  if (m) onTargetModelChange(m);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
              >
                {filteredTargetModels.map((m) => (
                  <option key={`tgt-opt-${m.id}`} value={m.id}>
                    {m.name} ({m.generation}-Series • {m.asicType} • {m.throughput})
                  </option>
                ))}
              </select>
            </div>

            {/* Firmware Version */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                FortiOS Target Firmware
              </label>
              <select
                value={targetVersion}
                onChange={(e) => onTargetVersionChange(e.target.value as FortiOSVersion)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-red-500 focus:outline-none shadow-sm"
              >
                {FIRMWARE_VERSIONS.map((ver) => (
                  <option key={`tgt-ver-${ver}`} value={ver}>
                    FortiOS v{ver} {ver === '7.6' ? '(Latest FortiOS 7.6)' : ver === '7.4' ? '(Enterprise Recommended)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Specs bar */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-red-500" />
                <span>{targetModel.asicType}</span>
              </span>
              <span>{targetModel.throughput}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
