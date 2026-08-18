import { FortiGateModelDef } from '../types/fortigate';

export const FORTIGATE_MODELS: FortiGateModelDef[] = [
  // ==========================================
  // E-SERIES (SOC3 / CP9 / NP6 / NP6lite / NP6XLite)
  // ==========================================
  {
    id: 'FG-30E',
    name: 'FortiGate 30E',
    generation: 'E',
    asicType: 'SOC3',
    throughput: '950 Mbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan', 'lan1', 'lan2', 'lan3', 'lan4'],
    lanPorts: ['lan1', 'lan2', 'lan3', 'lan4'],
    wanPorts: ['wan'],
    sfpPorts: [],
    fortiLinkPorts: ['lan4'],
    haMgmtPorts: [],
    notes: 'Legacy entry-level desktop appliance with integrated SOC3 ASIC.',
  },
  {
    id: 'FG-40E',
    name: 'FortiGate 40E',
    generation: 'E',
    asicType: 'SOC3/NP6lite',
    throughput: '3 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['internal5'],
    haMgmtPorts: [],
    notes: 'Legacy SOC3 architecture. Internal switch on internal1-5.',
  },
  {
    id: 'FG-50E',
    name: 'FortiGate 50E / 51E',
    generation: 'E',
    asicType: 'SOC3',
    throughput: '2.5 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'internal6', 'internal7'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'internal6', 'internal7'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['internal7'],
    haMgmtPorts: [],
    notes: 'SOC3 small office firewall with internal hardware switch.',
  },
  {
    id: 'FG-60E',
    name: 'FortiGate 60E / 61E',
    generation: 'E',
    asicType: 'SOC3/NP6lite',
    throughput: '3 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'internal6', 'internal7'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'internal6', 'internal7'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['internal7'],
    haMgmtPorts: ['dmz'],
    notes: 'Standard 60E desktop model. 7 internal ports in internal hardware switch.',
  },
  {
    id: 'FG-80E',
    name: 'FortiGate 80E / 81E',
    generation: 'E',
    asicType: 'CP9/NP6lite',
    throughput: '4 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'sfp1', 'sfp2'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['sfp1', 'sfp2'],
    fortiLinkPorts: ['port12'],
    haMgmtPorts: ['dmz'],
    notes: 'CP9 processor with discrete GE ports & SFP shared slots.',
  },
  {
    id: 'FG-90E',
    name: 'FortiGate 90E / 91E',
    generation: 'E',
    asicType: 'CP9/NP6lite',
    throughput: '4 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'sfp1', 'sfp2'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['sfp1', 'sfp2'],
    fortiLinkPorts: ['port12'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'High-density branch desktop firewall with dual WAN & shared SFP.',
  },
  {
    id: 'FG-100E',
    name: 'FortiGate 100E / 101E',
    generation: 'E',
    asicType: 'CP9/NP6lite',
    throughput: '7.4 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port15', 'port16'],
    fortiLinkPorts: ['port13', 'port14'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'Popular 1RU enterprise appliance. Shared SFP on port15-16.',
  },
  {
    id: 'FG-140E',
    name: 'FortiGate 140E / 140E-POE',
    generation: 'E',
    asicType: 'CP9/NP6lite',
    throughput: '7.4 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'port23', 'port24', 'port25', 'port26', 'port27', 'port28', 'port29', 'port30', 'port31', 'port32', 'port33', 'port34', 'port35', 'port36', 'port37', 'port38', 'port39', 'port40'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'port23', 'port24', 'port25', 'port26', 'port27', 'port28', 'port29', 'port30', 'port31', 'port32', 'port33', 'port34', 'port35', 'port36', 'port37', 'port38'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port39', 'port40'],
    fortiLinkPorts: ['port37', 'port38'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'High-density switch integration 1RU model with 40 RJ45/SFP ports.',
  },
  {
    id: 'FG-200E',
    name: 'FortiGate 200E / 201E',
    generation: 'E',
    asicType: 'CP9/NP6lite',
    throughput: '20 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port15', 'port16', 'port17', 'port18'],
    fortiLinkPorts: ['port13', 'port14'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'Dual CP9 NP6lite campus firewall with 4x SFP slots.',
  },
  {
    id: 'FG-300E',
    name: 'FortiGate 300E / 301E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '32 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'sfp1', 'sfp2', 'sfp3', 'sfp4'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['sfp1', 'sfp2', 'sfp3', 'sfp4'],
    fortiLinkPorts: ['sfp3', 'sfp4'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'Dedicated NP6 hardware offload with 4x GE SFP transceivers.',
  },
  {
    id: 'FG-400E',
    name: 'FortiGate 400E / 401E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '32 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'sfp1', 'sfp2', 'sfp3', 'sfp4', 'sfp5', 'sfp6', 'sfp7', 'sfp8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['sfp1', 'sfp2', 'sfp3', 'sfp4', 'sfp5', 'sfp6', 'sfp7', 'sfp8'],
    fortiLinkPorts: ['sfp7', 'sfp8'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'Mid-enterprise NP6 firewall with 8x dedicated SFP ports.',
  },
  {
    id: 'FG-500E',
    name: 'FortiGate 500E / 501E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '36 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'sfp1', 'sfp2', 'sfp3', 'sfp4', 'sfp5', 'sfp6', 'sfp7', 'sfp8', 'x1', 'x2'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['sfp1', 'sfp2', 'sfp3', 'sfp4', 'sfp5', 'sfp6', 'sfp7', 'sfp8', 'x1', 'x2'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'Campus core firewall with dual 10GE SFP+ (x1, x2) uplinks.',
  },
  {
    id: 'FG-600E',
    name: 'FortiGate 600E / 601E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '36 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'x1', 'x2'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['port17', 'port18', 'x1', 'x2'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Enterprise high-performance firewall with 10GE x1/x2 uplinks.',
  },
  {
    id: 'FG-800E',
    name: 'FortiGate 800E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '42 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'x1', 'x2', 'x3', 'x4'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'x1', 'x2', 'x3', 'x4'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'High throughput enterprise core with 4x 10GE SFP+ and dual NP6.',
  },
  {
    id: 'FG-900E',
    name: 'FortiGate 900E / 901E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '52 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'x1', 'x2', 'x3', 'x4'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['port17', 'port18', 'port19', 'port20', 'port21', 'port22', 'x1', 'x2', 'x3', 'x4'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'High-end campus gateway with dual NP6 ASICs and 4x 10GE SFP+ slots.',
  },
  {
    id: 'FG-1100E',
    name: 'FortiGate 1100E / 1101E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '80 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'port17', 'port18'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'port17', 'port18'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Data center border firewall with 2x 25GE SFP28 and 8x 10GE SFP+ slots.',
  },
  {
    id: 'FG-2200E',
    name: 'FortiGate 2200E / 2201E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '158 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port19', 'port20', 'port21', 'port22', 'port23', 'port24'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port19', 'port20', 'port21', 'port22', 'port23', 'port24'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Data center core firewall with 4x 25GE SFP28 and multiple NP6 units.',
  },
  {
    id: 'FG-3300E',
    name: 'FortiGate 3300E / 3301E',
    generation: 'E',
    asicType: 'CP9/NP6',
    throughput: '218 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'x17', 'x18'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'x17', 'x18'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Ultra-scale data center appliance with 4x 40GE/100GE QSFP28 ports.',
  },

  // ==========================================
  // F-SERIES (SOC4 / CP9 / NP7 / NP7lite)
  // ==========================================
  {
    id: 'FG-40F',
    name: 'FortiGate 40F / 41F',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '5 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan', 'lan1', 'lan2', 'lan3', 'a', 'fortilink'],
    lanPorts: ['lan1', 'lan2', 'lan3'],
    wanPorts: ['wan'],
    sfpPorts: [],
    fortiLinkPorts: ['a', 'fortilink'],
    haMgmtPorts: [],
    notes: 'SOC4 entry model. Note "wan" single port vs legacy "wan1/wan2".',
  },
  {
    id: 'FG-60F',
    name: 'FortiGate 60F / 61F',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '10 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'a', 'b', 'fortilink'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['a', 'b', 'fortilink'],
    haMgmtPorts: ['dmz'],
    notes: 'Best-selling SOC4 model. Has dedicated a & b FortiLink ports.',
  },
  {
    id: 'FG-70F',
    name: 'FortiGate 70F / 71F',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '10 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'a', 'b', 'fortilink'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['a', 'b', 'fortilink'],
    haMgmtPorts: [],
    notes: 'Higher memory SOC4 model with dual power supply capability.',
  },
  {
    id: 'FG-80F',
    name: 'FortiGate 80F / 81F / 80F-Bypass',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '10 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'sfp1', 'sfp2', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['sfp1', 'sfp2'],
    fortiLinkPorts: ['fortilink', 'port5', 'port6'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'Discrete SFP/GE bypass ports with dedicated HA and MGMT.',
  },
  {
    id: 'FG-90F',
    name: 'FortiGate 90F / 91F',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '12 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'sfp1', 'sfp2', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['sfp1', 'sfp2'],
    fortiLinkPorts: ['fortilink'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'High-density branch SOC4 model with dedicated SFP slots.',
  },
  {
    id: 'FG-100F',
    name: 'FortiGate 100F / 101F',
    generation: 'F',
    asicType: 'SOC4/NP7lite',
    throughput: '20 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20'],
    fortiLinkPorts: ['x1', 'x2', 'fortilink'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'Industry benchmark 1RU firewall with dual 10GE SFP+ (x1, x2).',
  },
  {
    id: 'FG-200F',
    name: 'FortiGate 200F / 201F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '27 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'x3', 'x4', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port17', 'port18', 'port19', 'port20'],
    fortiLinkPorts: ['x1', 'x2', 'fortilink'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'NP7 dedicated acceleration chip with 4x 10GE SFP+ slots.',
  },
  {
    id: 'FG-400F',
    name: 'FortiGate 400F / 401F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '80 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Campus core firewall with 8x 10GE/25GE SFP28 and NP7 ASIC.',
  },
  {
    id: 'FG-600F',
    name: 'FortiGate 600F / 601F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '140 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Next-gen enterprise core firewall with 8x 25GE/10GE SFP28 slots.',
  },
  {
    id: 'FG-900F',
    name: 'FortiGate 900F / 901F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '165 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'High-performance core firewall with 25GE SFP28 and NP7 hyperscale engine.',
  },
  {
    id: 'FG-1000F',
    name: 'FortiGate 1000F / 1001F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '198 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'port9', 'port10', 'port11', 'port12'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Data center core firewall with 4x 100GE QSFP28 and 8x 25GE SFP28 ports.',
  },
  {
    id: 'FG-1800F',
    name: 'FortiGate 1800F / 1801F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '198 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port17', 'port18', 'port19', 'port20'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12'],
    wanPorts: ['port13', 'port14', 'port15', 'port16'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port17', 'port18', 'port19', 'port20'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Hyperscale carrier firewall with 4x 40GE QSFP+ and 16x 25GE/10GE SFP28 slots.',
  },
  {
    id: 'FG-2600F',
    name: 'FortiGate 2600F / 2601F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '198 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port17', 'port18', 'port19', 'port20'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port17', 'port18', 'port19', 'port20'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Dual NP7 high performance data center firewall with 4x 100GE QSFP28 ports.',
  },
  {
    id: 'FG-3000F',
    name: 'FortiGate 3000F / 3001F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '397 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port9', 'port10', 'port11', 'port12'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port9', 'port10', 'port11', 'port12'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'High-end data center firewall with 6x 100GE QSFP28 and 16x 25GE SFP28.',
  },
  {
    id: 'FG-3200F',
    name: 'FortiGate 3200F / 3201F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '397 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port5', 'port6', 'port7', 'port8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Hyperscale 400 Gbps firewall with 4x 400GE QSFP-DD ports.',
  },
  {
    id: 'FG-3500F',
    name: 'FortiGate 3500F / 3501F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '600 Gbps',
    formFactor: '3RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port5', 'port6', 'port7', 'port8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Enterprise core & data center border firewall with multiple NP7 engines.',
  },
  {
    id: 'FG-4200F',
    name: 'FortiGate 4200F / 4201F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '800 Gbps',
    formFactor: '3RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port5', 'port6', 'port7', 'port8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Hyperscale data center firewall with 8x 100GE QSFP28 and 16x 25GE SFP28.',
  },
  {
    id: 'FG-4400F',
    name: 'FortiGate 4400F / 4401F',
    generation: 'F',
    asicType: 'CP9/NP7',
    throughput: '1.2 Tbps',
    formFactor: '4RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port5', 'port6', 'port7', 'port8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Terabit-class data center firewall with 6x NP7 network processors.',
  },

  // ==========================================
  // G-SERIES (SOC5 / SP5 / CP10 / NP7)
  // ==========================================
  {
    id: 'FG-40G',
    name: 'FortiGate 40G / 41G',
    generation: 'G',
    asicType: 'SOC5/SP5',
    throughput: '10 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'lan1', 'lan2', 'lan3', 'lan4', 'a', 'fortilink'],
    lanPorts: ['lan1', 'lan2', 'lan3', 'lan4'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['a', 'fortilink'],
    haMgmtPorts: [],
    notes: 'SP5 Security Processing Unit 5 with extreme power efficiency.',
  },
  {
    id: 'FG-70G',
    name: 'FortiGate 70G / 71G',
    generation: 'G',
    asicType: 'SOC5/SP5',
    throughput: '15 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'internal1', 'internal2', 'internal3', 'internal4', 'internal5', 'a', 'b', 'fortilink'],
    lanPorts: ['internal1', 'internal2', 'internal3', 'internal4', 'internal5'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: [],
    fortiLinkPorts: ['a', 'b', 'fortilink'],
    haMgmtPorts: [],
    notes: 'High speed branch appliance powered by SP5 ASIC.',
  },
  {
    id: 'FG-90G',
    name: 'FortiGate 90G / 91G',
    generation: 'G',
    asicType: 'SOC5/SP5',
    throughput: '28 Gbps',
    formFactor: 'Desktop',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'sfp1', 'sfp2', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['sfp1', 'sfp2'],
    fortiLinkPorts: ['fortilink'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'SP5 desktop powerhouse with 10GE SFP+ and 2.5GE RJ45.',
  },
  {
    id: 'FG-120G',
    name: 'FortiGate 120G / 121G',
    generation: 'G',
    asicType: 'SOC5/SP5',
    throughput: '40 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'x3', 'x4', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'x3', 'x4'],
    fortiLinkPorts: ['x1', 'x2', 'fortilink'],
    haMgmtPorts: ['mgmt', 'ha', 'dmz'],
    notes: 'G-series 1RU campus firewall with 4x 10GE SFP+ and SP5 crypto acceleration.',
  },
  {
    id: 'FG-200G',
    name: 'FortiGate 200G / 201G',
    generation: 'G',
    asicType: 'CP10/NP7',
    throughput: '50 Gbps',
    formFactor: '1RU',
    defaultPorts: ['wan1', 'wan2', 'dmz', 'mgmt', 'ha', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'fortilink'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16'],
    wanPorts: ['wan1', 'wan2'],
    sfpPorts: ['port17', 'port18', 'port19', 'port20', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    fortiLinkPorts: ['x1', 'x2', 'fortilink'],
    haMgmtPorts: ['mgmt', 'ha'],
    notes: 'Ultra fast dual CP10/NP7 hardware with 8x 10GE/25GE SFP28.',
  },
  {
    id: 'FG-600G',
    name: 'FortiGate 600G / 601G',
    generation: 'G',
    asicType: 'CP10/NP7',
    throughput: '180 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Next-gen enterprise core firewall with CP10 & NP7 ASICs and 25GE interfaces.',
  },
  {
    id: 'FG-900G',
    name: 'FortiGate 900G / 901G',
    generation: 'G',
    asicType: 'CP10/NP7',
    throughput: '220 Gbps',
    formFactor: '1RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10', 'port11', 'port12', 'port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['port13', 'port14', 'port15', 'port16', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'High-density 25GE SFP28 enterprise campus aggregation firewall.',
  },
  {
    id: 'FG-1000G',
    name: 'FortiGate 1000G / 1001G',
    generation: 'G',
    asicType: 'CP10/NP7',
    throughput: '250 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'port9', 'port10', 'port11', 'port12'],
    lanPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port9', 'port10', 'port11', 'port12'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'port9', 'port10', 'port11', 'port12'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Enterprise campus core & data center border firewall with 100GE QSFP28 slots.',
  },
  {
    id: 'FG-3200G',
    name: 'FortiGate 3200G / 3201G',
    generation: 'G',
    asicType: 'CP10/NP7',
    throughput: '500 Gbps',
    formFactor: '2RU',
    defaultPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2', 'port1', 'port2', 'port3', 'port4', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16', 'port5', 'port6', 'port7', 'port8'],
    lanPorts: ['port1', 'port2', 'port3', 'port4'],
    wanPorts: ['port5', 'port6', 'port7', 'port8'],
    sfpPorts: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10', 'x11', 'x12', 'x13', 'x14', 'x15', 'x16'],
    fortiLinkPorts: ['x1', 'x2'],
    haMgmtPorts: ['mgmt1', 'mgmt2', 'ha1', 'ha2'],
    notes: 'Hyperscale 400GE data center core firewall with next-gen CP10/NP7 acceleration.',
  },

  // ==========================================
  // VIRTUAL APPLIANCE (VM)
  // ==========================================
  {
    id: 'FG-VM64',
    name: 'FortiGate VM64 (KVM / ESXi / AWS / Azure / GCP)',
    generation: 'VM',
    asicType: 'vNP/DPDK',
    throughput: 'Scalable (vCPU)',
    formFactor: 'Virtual',
    defaultPorts: ['port1', 'port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8', 'port9', 'port10'],
    lanPorts: ['port2', 'port3', 'port4', 'port5', 'port6', 'port7', 'port8'],
    wanPorts: ['port1'],
    sfpPorts: [],
    fortiLinkPorts: ['port9', 'port10'],
    haMgmtPorts: ['port1', 'port2'],
    notes: 'Generic Virtual Appliance with sequential vNIC ports (port1-port10+).',
  },
];

export function getModelById(id: string): FortiGateModelDef {
  return (
    FORTIGATE_MODELS.find((m) => m.id === id) ||
    FORTIGATE_MODELS[3] // default FG-60E
  );
}

// Sample FortiOS configuration presets for instant demonstration and testing
export const SAMPLE_CONFIGS = [
  {
    id: 'fg60e-to-fg60f',
    name: 'FortiGate 60E (v6.2) ➔ FortiGate 60F (v7.4)',
    description: 'Branch 60E with SD-WAN, IPsec VPN (3DES/MD5 legacy proposal), internal switch on internal1-7, and legacy VIP.',
    sourceModel: 'FG-60E',
    sourceVersion: '6.2' as const,
    targetModel: 'FG-60F',
    targetVersion: '7.4' as const,
    config: `#config-version=FG60E-6.02-FW-build1234-20190510
#conf_file_ver=891726481729
#buildno=1234
#global_vdom=1
config system global
    set hostname "CORP-BRANCH-60E"
    set timezone 04
    set admintimeout 30
    set switch-controller enable
end
config system interface
    edit "wan1"
        set vdom "root"
        set mode dhcp
        set distance 5
        set type physical
        set role wan
        set snmp-index 1
    next
    edit "wan2"
        set vdom "root"
        set ip 198.51.100.2 255.255.255.0
        set allowaccess ping https ssh
        set type physical
        set role wan
        set snmp-index 2
    next
    edit "dmz"
        set vdom "root"
        set ip 172.16.10.1 255.255.255.0
        set allowaccess ping
        set type physical
        set role dmz
        set snmp-index 3
    next
    edit "internal"
        set vdom "root"
        set ip 192.168.1.99 255.255.255.0
        set allowaccess ping https ssh http
        set type hard-switch
        set role lan
        set snmp-index 4
    next
    edit "internal1"
        set vdom "root"
        set type physical
        set snmp-index 5
    next
    edit "internal6"
        set vdom "root"
        set type physical
        set snmp-index 10
    next
    edit "internal7"
        set vdom "root"
        set type physical
        set snmp-index 11
    next
end
config system virtual-wan-link
    set status enable
    config members
        edit 1
            set interface "wan1"
            set gateway 198.51.100.1
            set weight 10
        next
        edit 2
            set interface "wan2"
            set gateway 203.0.113.1
            set weight 20
        next
    end
end
config firewall address
    edit "LAN_Subnet"
        set subnet 192.168.1.0 255.255.255.0
    next
    edit "Remote_HQ"
        set subnet 10.0.0.0 255.0.0.0
    next
end
config firewall vip
    edit "Web_Server_VIP"
        set extip 198.51.100.25
        set mappedip "192.168.1.50"
        set extintf "wan1"
        set portforward enable
        set protocol tcp
        set extport 8080
        set mappedport 80
    next
end
config vpn ipsec phase1-interface
    edit "HQ_Tunnel"
        set interface "wan1"
        set peertype any
        set net-device disable
        set proposal 3des-md5 des-sha1
        set dpd enable
        set dhgrp 2 5
        set remote-gw 198.51.100.100
        set psksecret ENC f2J9xZ19AbCDE
    next
end
config vpn ipsec phase2-interface
    edit "HQ_Tunnel_p2"
        set phase1name "HQ_Tunnel"
        set proposal 3des-md5
        set dhgrp 2 5
        set src-subnet 192.168.1.0 255.255.255.0
        set dst-subnet 10.0.0.0 255.0.0.0
    next
end
config firewall policy
    edit 1
        set name "LAN_to_WAN_Internet"
        set srcintf "internal"
        set dstintf "wan1" "wan2"
        set srcaddr "LAN_Subnet"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set match-vip enable
    next
    edit 2
        set name "VPN_to_HQ"
        set srcintf "internal"
        set dstintf "HQ_Tunnel"
        set srcaddr "LAN_Subnet"
        set dstaddr "Remote_HQ"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
`,
  },
  {
    id: 'fg100e-to-fg120g',
    name: 'FortiGate 100E (v6.4) ➔ FortiGate 120G (v7.6)',
    description: 'Enterprise 100E with NP6 fastpath registers, 16 physical ports, SD-WAN rules, and transition to SP5 ASIC on 120G.',
    sourceModel: 'FG-100E',
    sourceVersion: '6.4' as const,
    targetModel: 'FG-120G',
    targetVersion: '7.6' as const,
    config: `#config-version=FG100E-6.04-FW-build1803-20210215
#conf_file_ver=910283716294
config system global
    set hostname "CAMPUS-CORE-100E"
    set timezone 04
end
config system npu
    set fastpath enable
    set capwap-offload enable
    set ipsec-offload enable
end
config system interface
    edit "wan1"
        set vdom "root"
        set mode static
        set ip 203.0.113.10 255.255.255.240
        set allowaccess ping https ssh
        set type physical
        set role wan
    next
    edit "wan2"
        set vdom "root"
        set mode static
        set ip 198.51.100.10 255.255.255.240
        set allowaccess ping https ssh
        set type physical
        set role wan
    next
    edit "mgmt"
        set vdom "root"
        set ip 192.168.1.1 255.255.255.0
        set allowaccess ping https ssh http
        set type physical
        set role lan
    next
    edit "port1"
        set vdom "root"
        set ip 10.10.1.1 255.255.255.0
        set allowaccess ping
        set type physical
    next
    edit "port2"
        set vdom "root"
        set ip 10.10.2.1 255.255.255.0
        set allowaccess ping
        set type physical
    next
    edit "port13"
        set vdom "root"
        set type physical
    next
    edit "port14"
        set vdom "root"
        set type physical
    next
end
config router static
    edit 1
        set gateway 203.0.113.1
        set device "wan1"
    next
    edit 2
        set gateway 198.51.100.1
        set device "wan2"
        set distance 20
    next
end
config firewall policy
    edit 10
        set name "Campus_Outbound"
        set srcintf "port1" "port2"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end
`,
  },
  {
    id: 'fg200e-to-fg200f',
    name: 'FortiGate 200E (v6.0) ➔ FortiGate 200F (v7.2)',
    description: 'Data center 200E transition to NP7-accelerated 200F with 10GE SFP+ uplinks.',
    sourceModel: 'FG-200E',
    sourceVersion: '6.0' as const,
    targetModel: 'FG-200F',
    targetVersion: '7.2' as const,
    config: `#config-version=FG200E-6.00-FW-build0366-20181010
config system global
    set hostname "DC-EDGE-200E"
end
config system interface
    edit "wan1"
        set vdom "root"
        set ip 198.51.100.5 255.255.255.0
        set allowaccess ping https ssh
        set type physical
    next
    edit "wan2"
        set vdom "root"
        set ip 203.0.113.5 255.255.255.0
        set allowaccess ping https ssh
        set type physical
    next
    edit "port1"
        set vdom "root"
        set ip 172.16.1.1 255.255.255.0
        set allowaccess ping
        set type physical
    next
    edit "port15"
        set vdom "root"
        set type physical
    next
    edit "port16"
        set vdom "root"
        set type physical
    next
end
config firewall policy
    edit 1
        set name "LAN_to_WAN"
        set srcintf "port1"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end
`,
  },
];
