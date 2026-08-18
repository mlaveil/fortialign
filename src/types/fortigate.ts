export type FortiGateGeneration = 'E' | 'F' | 'G' | 'VM';

export type AsicType =
  | 'SOC3'
  | 'SOC3/NP6lite'
  | 'CP9/NP6lite'
  | 'CP9/NP6'
  | 'SOC4/NP7lite'
  | 'CP9/NP7'
  | 'SOC5/SP5'
  | 'CP10/NP7'
  | 'vNP'
  | 'vNP/DPDK';

export interface FortiGateModelDef {
  id: string;
  name: string;
  generation: FortiGateGeneration;
  asicType: AsicType;
  throughput: string;
  formFactor: 'Desktop' | '1RU' | '2RU' | '3RU' | '4RU' | 'Chassis' | 'Virtual' | 'Rugged';
  defaultPorts: string[];
  lanPorts: string[];
  wanPorts: string[];
  sfpPorts: string[];
  fortiLinkPorts: string[];
  haMgmtPorts: string[];
  notes: string;
}

export type FortiOSVersion =
  | '5.6'
  | '6.0'
  | '6.2'
  | '6.4'
  | '7.0'
  | '7.2'
  | '7.4'
  | '7.6';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertCategory =
  | 'interface'
  | 'syntax_deprecated'
  | 'security_cipher'
  | 'hardware_npu'
  | 'sdwan'
  | 'secret_credential'
  | 'ha_mgmt'
  | 'utm_profile'
  | 'routing'
  | 'vip_nat';

export interface MigrationAlert {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  sourceLine?: number;
  sourceBlock?: string;
  targetLine?: number;
  suggestedRemedy?: string;
  remediationSnippet?: string;
  autoFixable?: boolean;
  appliedFix?: boolean;
}

export interface InterfaceMapping {
  sourcePort: string;
  targetPort: string;
  status: 'mapped' | 'unmapped' | 'custom' | 'split';
  sourceSpeed?: string;
  targetSpeed?: string;
  note?: string;
}

export interface ConversionOptions {
  autoFixSyntaxErrors: boolean;
  autoRemapInterfaces: boolean;
  modernizeSdwanToZones: boolean;
  upgradeDeprecatedCiphers: boolean;
  removeObsoleteNpuRegisters: boolean;
  stripEncryptedPasswords: boolean;
  reindexPolicyIds: boolean;
  generateMissingUuids: boolean;
  fixMatchVipSyntax: boolean;
  standardizeSslVpnPortal: boolean;
  addMigrationAuditHeader: boolean;
  preserveCustomComments: boolean;
}

export interface ConfigStats {
  totalLines: number;
  firewallPoliciesCount: number;
  addressObjectsCount: number;
  interfaceCount: number;
  interfacesCount?: number;
  vpnTunnelsCount: number;
  sdwanRulesCount: number;
  staticRoutesCount: number;
  vipCount: number;
  encryptedPasswordsCount?: number;
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  sourceLineNumber?: number;
  targetLineNumber?: number;
  sourceContent?: string;
  targetContent?: string;
  alert?: MigrationAlert;
}

export interface ConversionResult {
  convertedConfig: string;
  alerts: MigrationAlert[];
  stats: ConfigStats;
  interfaceMappings: InterfaceMapping[];
  compatibilityScore: number; // 0 to 100
  durationMs: number;
}
