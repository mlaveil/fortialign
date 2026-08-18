import React from 'react';
import {
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  X,
  Search,
} from 'lucide-react';
import {
  FortiGateModelDef,
  InterfaceMapping,
} from '../types/fortigate';

interface PortMappingMatrixProps {
  isOpen: boolean;
  onClose: () => void;
  sourceModel: FortiGateModelDef;
  targetModel: FortiGateModelDef;
  mappings: InterfaceMapping[];
  onUpdateMapping: (sourcePort: string, targetPort: string) => void;
  onResetMappings: () => void;
}

export const PortMappingMatrix: React.FC<PortMappingMatrixProps> = ({
  isOpen,
  onClose,
  sourceModel,
  targetModel,
  mappings,
  onUpdateMapping,
  onResetMappings,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const filteredMappings = mappings.filter(
    (m) =>
      m.sourcePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.targetPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.note && m.note.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unmappedCount = mappings.filter((m) => m.status === 'unmapped').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Interface &amp; Port Remapping Matrix
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 font-mono font-bold">
                {sourceModel.name} ➔ {targetModel.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical port translations across hardware generations. Firewall policies, routes, and VPNs automatically update.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter interfaces (e.g., wan1, internal, port1)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Unmapped alerts status */}
          <div className="flex items-center gap-2">
            {unmappedCount > 0 ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                {unmappedCount} Unmapped Port{unmappedCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                All Ports Mapped
              </span>
            )}

            <button
              type="button"
              onClick={onResetMappings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Reset to default heuristic mappings"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Auto-Detect Defaults</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Source Interface ({sourceModel.name})</th>
                  <th className="py-2.5 px-3 text-center">Mapping</th>
                  <th className="py-2.5 px-3">Target Interface ({targetModel.name})</th>
                  <th className="py-2.5 px-3">Status / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMappings.map((mapping) => {
                  const isUnmapped = mapping.status === 'unmapped';
                  const isRemapped = mapping.sourcePort !== mapping.targetPort && !isUnmapped;

                  return (
                    <tr
                      key={mapping.sourcePort}
                      className={`hover:bg-slate-50 transition ${
                        isUnmapped ? 'bg-red-50/50' : ''
                      }`}
                    >
                      {/* Source Port */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {mapping.sourcePort}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sourceModel.wanPorts.includes(mapping.sourcePort)
                              ? 'WAN'
                              : sourceModel.haMgmtPorts.includes(mapping.sourcePort)
                              ? 'HA/MGMT'
                              : 'LAN'}
                          </span>
                        </div>
                      </td>

                      {/* Direction Arrow */}
                      <td className="py-2.5 px-3 text-center">
                        <ArrowRight className="w-4 h-4 text-slate-400 inline-block" />
                      </td>

                      {/* Target Port Dropdown */}
                      <td className="py-2.5 px-3">
                        <select
                          value={mapping.targetPort}
                          onChange={(e) => onUpdateMapping(mapping.sourcePort, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono font-medium focus:ring-1 focus:ring-red-500 focus:outline-none shadow-xs"
                        >
                          {targetModel.defaultPorts.map((tgtPort) => (
                            <option key={tgtPort} value={tgtPort}>
                              {tgtPort} {tgtPort === mapping.sourcePort ? '(Exact match)' : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status / Notes */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {isUnmapped ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">
                              Unmapped Deficit
                            </span>
                          ) : isRemapped ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                              Remapped
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                              1:1 Direct Match
                            </span>
                          )}
                          {mapping.note && (
                            <span className="text-[11px] text-slate-500">
                              {mapping.note}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total Source Interfaces: <span className="font-mono font-bold text-slate-800">{mappings.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition"
          >
            Apply &amp; Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
