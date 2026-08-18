import {
  FortiGateModelDef,
  FortiOSVersion,
  MigrationAlert,
  InterfaceMapping,
  ConversionOptions,
  ConversionResult,
  ConfigStats,
} from '../types/fortigate';
import { FortiOSParser, ASTNode, ParseResult } from './parser';
import { getModelById } from '../data/fortigateModels';

export class FortiOSConverter {
  private parser: FortiOSParser;

  constructor() {
    this.parser = new FortiOSParser();
  }

  /**
   * Generates default port mapping table between source and target FortiGate models.
   */
  public generateDefaultPortMappings(
    sourceModel: FortiGateModelDef,
    targetModel: FortiGateModelDef
  ): InterfaceMapping[] {
    const mappings: InterfaceMapping[] = [];
    const targetPorts = [...targetModel.defaultPorts];

    sourceModel.defaultPorts.forEach((srcPort) => {
      let targetPort = '';
      let status: 'mapped' | 'unmapped' | 'custom' = 'unmapped';
      let note = '';

      // Direct exact match (e.g. wan1 -> wan1, port1 -> port1)
      if (targetPorts.includes(srcPort)) {
        targetPort = srcPort;
        status = 'mapped';
      }
      // WAN normalization (e.g. wan -> wan1 or wan1 -> wan)
      else if (srcPort === 'wan1' && targetPorts.includes('wan')) {
        targetPort = 'wan';
        status = 'mapped';
        note = 'Mapped dual-wan to single WAN port';
      } else if (srcPort === 'wan' && targetPorts.includes('wan1')) {
        targetPort = 'wan1';
        status = 'mapped';
      }
      // Internal / LAN switch translation (e.g. internal -> lan or port1-port4)
      else if (srcPort === 'internal' && targetPorts.includes('lan')) {
        targetPort = 'lan';
        status = 'mapped';
      } else if (srcPort.startsWith('internal') && targetPorts.includes(srcPort)) {
        targetPort = srcPort;
        status = 'mapped';
      } else if (srcPort.startsWith('internal')) {
        const num = parseInt(srcPort.replace('internal', ''), 10);
        const correspondingLan = `lan${num}`;
        const correspondingPort = `port${num}`;

        if (targetPorts.includes(correspondingLan)) {
          targetPort = correspondingLan;
          status = 'mapped';
          note = `Remapped internal${num} ➔ ${correspondingLan}`;
        } else if (targetPorts.includes(correspondingPort)) {
          targetPort = correspondingPort;
          status = 'mapped';
          note = `Remapped internal${num} ➔ ${correspondingPort}`;
        } else {
          // If port doesn't exist on smaller model (e.g. 60E internal7 -> 60F which only has internal1-5)
          targetPort = targetPorts[0] || 'port1';
          status = 'unmapped';
          note = `Hardware port deficit on target ${targetModel.name}. Manual port reassignment required!`;
        }
      }
      // Shared SFP ports (e.g. port15/16 on 100E -> x1/x2 or port15/16 on 100F)
      else if (srcPort === 'sfp1' && targetPorts.includes('port15')) {
        targetPort = 'port15';
        status = 'mapped';
      } else if (srcPort === 'sfp2' && targetPorts.includes('port16')) {
        targetPort = 'port16';
        status = 'mapped';
      } else {
        // Fallback or unmapped
        targetPort = targetPorts.includes(srcPort) ? srcPort : targetPorts[0] || 'port1';
        status = targetPorts.includes(srcPort) ? 'mapped' : 'unmapped';
        if (status === 'unmapped') {
          note = `Target ${targetModel.name} does not natively have '${srcPort}'.`;
        }
      }

      mappings.push({
        sourcePort: srcPort,
        targetPort,
        status,
        note,
      });
    });

    return mappings;
  }

  /**
   * Main configuration conversion routine.
   */
  public convert(
    sourceConfig: string,
    sourceModelId: string,
    sourceVersion: FortiOSVersion,
    targetModelId: string,
    targetVersion: FortiOSVersion,
    customPortMappings: InterfaceMapping[],
    options: ConversionOptions
  ): ConversionResult {
    const startTime = performance.now();
    const sourceModel = getModelById(sourceModelId);
    const targetModel = getModelById(targetModelId);

    const parseResult: ParseResult = this.parser.parse(sourceConfig);
    const alerts: MigrationAlert[] = [];
    let alertIdCounter = 1;

    const createAlert = (
      severity: MigrationAlert['severity'],
      category: MigrationAlert['category'],
      title: string,
      description: string,
      sourceLine?: number,
      sourceBlock?: string,
      suggestedRemedy?: string,
      remediationSnippet?: string,
      autoFixable: boolean = false
    ): MigrationAlert => {
      const alert: MigrationAlert = {
        id: `alert-${alertIdCounter++}`,
        severity,
        category,
        title,
        description,
        sourceLine,
        sourceBlock,
        suggestedRemedy,
        remediationSnippet,
        autoFixable,
        appliedFix: false,
      };
      alerts.push(alert);
      return alert;
    };

    // Port mapping lookup map
    const portMap = new Map<string, string>();
    customPortMappings.forEach((m) => {
      portMap.set(m.sourcePort, m.targetPort);
    });

    // Check for unmapped interface alerts
    customPortMappings
      .filter((m) => m.status === 'unmapped')
      .forEach((m) => {
        createAlert(
          'critical',
          'interface',
          `Unmapped Source Interface: '${m.sourcePort}'`,
          `Source hardware ${sourceModel.name} uses physical port '${m.sourcePort}', which does not natively exist on target ${targetModel.name}. Target model ports: [${targetModel.defaultPorts.join(', ')}].`,
          undefined,
          `config system interface -> edit "${m.sourcePort}"`,
          `Reassign '${m.sourcePort}' to one of the target's available ports (e.g. '${m.targetPort}') or aggregate into a VLAN/switch.`,
          `# Recommended CLI Remap:\nconfig system interface\n    edit "${m.targetPort}"\n        # assign configuration from ${m.sourcePort}\n    next\nend`
        );
      });

    // Check Hardware generation changes (E -> F -> G)
    if (sourceModel.generation === 'E' && (targetModel.generation === 'F' || targetModel.generation === 'G')) {
      createAlert(
        'warning',
        'hardware_npu',
        `ASIC Architecture Upgrade: ${sourceModel.asicType} ➔ ${targetModel.asicType}`,
        `Migrating from E-Series (${sourceModel.asicType}) to ${targetModel.generation}-Series (${targetModel.asicType}). Legacy NP6 hardware registers (such as fastpath, capwap-offload, host-dsw-tag) will be modernized or stripped to prevent boot-time parser errors on ${targetModel.name}.`,
        undefined,
        'config system npu',
        'Verify hardware acceleration parameters in target FortiOS using "diagnose npu np7" or "diagnose npu sp5".',
        'config system npu\n    set capwap-offload disable\nend'
      );
    }

    // Check FortiOS Version jump
    const srcVerNum = parseFloat(sourceVersion);
    const tgtVerNum = parseFloat(targetVersion);
    if (tgtVerNum >= 7.0 && srcVerNum < 7.0) {
      createAlert(
        'info',
        'syntax_deprecated',
        `Major FortiOS Architecture Transition: v${sourceVersion} ➔ v${targetVersion}`,
        `Upgrading across the FortiOS 7.0 boundary. Key changes include: removal of 'match-vip enable' (VIPs now match implicitly in dstaddr), SD-WAN Zone hierarchy standardization, and strict cipher enforcement.`,
        undefined,
        'config firewall policy / config system sdwan',
        'Review firewall policies and SD-WAN rules post-migration.',
        undefined,
        true
      );
    }

    // Traverse and transform the AST lines
    const stats: ConfigStats = {
      totalLines: parseResult.totalLines,
      firewallPoliciesCount: 0,
      addressObjectsCount: 0,
      interfaceCount: 0,
      vpnTunnelsCount: 0,
      sdwanRulesCount: 0,
      staticRoutesCount: 0,
      vipCount: 0,
    };

    const outputLines: string[] = [];

    // Header generation
    if (options.addMigrationAuditHeader) {
      outputLines.push(`# =========================================================================`);
      outputLines.push(`# FortiGate Migration Engine Automated Converted Config`);
      outputLines.push(`# Source: ${sourceModel.name} (FortiOS v${sourceVersion})`);
      outputLines.push(`# Target: ${targetModel.name} (FortiOS v${targetVersion}) [ASIC: ${targetModel.asicType}]`);
      outputLines.push(`# Converted Timestamp: ${new Date().toISOString()}`);
      outputLines.push(`# =========================================================================`);
    }

    // Process nodes recursively
    this.processNodeList(
      parseResult.rootNodes,
      outputLines,
      sourceModel,
      targetModel,
      sourceVersion,
      targetVersion,
      portMap,
      options,
      alerts,
      createAlert,
      stats
    );

    // Finalize stats helper properties
    stats.interfacesCount = stats.interfaceCount;
    stats.encryptedPasswordsCount = alerts.filter((a) => a.category === 'secret_credential').length;

    // Compute Compatibility Score
    let score = 100;
    const unresolvedCriticals = alerts.filter((a) => a.severity === 'critical' && !a.appliedFix).length;
    const unresolvedWarnings = alerts.filter((a) => a.severity === 'warning' && !a.appliedFix).length;
    const autoFixedCount = alerts.filter((a) => a.appliedFix).length;
    
    score -= unresolvedCriticals * 15;
    score -= unresolvedWarnings * 4;
    // Small bonus for clean automatic remediation
    if (autoFixedCount > 0 && unresolvedCriticals === 0) {
      score = Math.min(100, score + 2);
    }
    score = Math.max(0, Math.min(100, score));

    const convertedConfig = outputLines.join('\n');
    const durationMs = Math.round(performance.now() - startTime);

    return {
      convertedConfig,
      alerts,
      stats,
      interfaceMappings: customPortMappings,
      compatibilityScore: score,
      durationMs,
    };
  }

  private processNodeList(
    nodes: ASTNode[],
    output: string[],
    srcModel: FortiGateModelDef,
    tgtModel: FortiGateModelDef,
    srcVer: FortiOSVersion,
    tgtVer: FortiOSVersion,
    portMap: Map<string, string>,
    options: ConversionOptions,
    alerts: MigrationAlert[],
    createAlert: Function,
    stats: ConfigStats
  ) {
    nodes.forEach((node) => {
      this.processNode(
        node,
        output,
        srcModel,
        tgtModel,
        srcVer,
        tgtVer,
        portMap,
        options,
        alerts,
        createAlert,
        stats
      );
    });
  }

  private processNode(
    node: ASTNode,
    output: string[],
    srcModel: FortiGateModelDef,
    tgtModel: FortiGateModelDef,
    srcVer: FortiOSVersion,
    tgtVer: FortiOSVersion,
    portMap: Map<string, string>,
    options: ConversionOptions,
    alerts: MigrationAlert[],
    createAlert: Function,
    stats: ConfigStats
  ) {
    const indent = ' '.repeat(node.indent);

    if (node.type === 'comment') {
      let commentText = node.rawLine;
      // Update config version comment header
      if (commentText.startsWith('#config-version=')) {
        const buildTag = this.getBuildTag(tgtModel.id, tgtVer);
        commentText = `#config-version=${buildTag}`;
      }
      if (options.preserveCustomComments || commentText.startsWith('#config-version')) {
        output.push(commentText);
      }
      return;
    }

    if (node.type === 'config') {
      const sectionName = (node.name || '').toLowerCase();

      // Stats
      if (sectionName === 'firewall policy') stats.firewallPoliciesCount += (node.children || []).length;
      if (sectionName === 'firewall address') stats.addressObjectsCount += (node.children || []).length;
      if (sectionName === 'system interface') stats.interfaceCount += (node.children || []).length;
      if (sectionName.includes('vpn ipsec phase1')) stats.vpnTunnelsCount += (node.children || []).length;
      if (sectionName.includes('system sdwan') || sectionName.includes('virtual-wan-link') || sectionName.includes('link-load-balance')) {
        stats.sdwanRulesCount += (node.children || []).length;
      }
      if (sectionName === 'router static') stats.staticRoutesCount += (node.children || []).length;
      if (sectionName === 'firewall vip') stats.vipCount += (node.children || []).length;

      // Handle Legacy Link Load Balance / Virtual-WAN-Link migration to modern SD-WAN
      if (
        (sectionName === 'system link-load-balance' || sectionName === 'system virtual-wan-link') &&
        parseFloat(tgtVer) >= 6.4 &&
        options.modernizeSdwanToZones
      ) {
        const alert = createAlert(
          'warning',
          'sdwan',
          `Legacy SD-WAN Structure Modernized: '${sectionName}' ➔ 'config system sdwan'`,
          `Transformed legacy ${sectionName} configuration into modern FortiOS ${tgtVer} 'config system sdwan' with dedicated SD-WAN zone 'virtual-wan-link' and member interfaces.`,
          node.lineNumber,
          node.rawLine,
          'Review SD-WAN health-check and rule priorities in FortiOS WebUI (Network > SD-WAN).',
          `config system sdwan\n    config zone\n        edit "virtual-wan-link"\n        next\n    end\nend`,
          true
        );
        alert.appliedFix = true;

        output.push(`${indent}config system sdwan`);
        output.push(`${indent}    set status enable`);
        output.push(`${indent}    config zone`);
        output.push(`${indent}        edit "virtual-wan-link"`);
        output.push(`${indent}        next`);
        output.push(`${indent}    end`);

        // Convert members
        if (node.children) {
          const membersNode = node.children.find((c) => c.type === 'config' && c.name?.includes('members'));
          if (membersNode && membersNode.children) {
            output.push(`${indent}    config members`);
            membersNode.children.forEach((memberEdit) => {
              if (memberEdit.type === 'edit') {
                output.push(`${indent}        edit ${memberEdit.name}`);
                output.push(`${indent}            set zone "virtual-wan-link"`);
                memberEdit.children?.forEach((child) => {
                  if (child.type === 'set') {
                    const values = this.remapTokens(child.values || [], portMap);
                    output.push(`${indent}            set ${child.key} ${values.join(' ')}`);
                  }
                });
                output.push(`${indent}        next`);
              }
            });
            output.push(`${indent}    end`);
          }
        }
        output.push(`${indent}end`);
        return;
      }

      // Handle Hardware NPU block
      if (sectionName === 'system npu' && (options.removeObsoleteNpuRegisters || options.autoFixSyntaxErrors)) {
        if (tgtModel.generation === 'F' || tgtModel.generation === 'G') {
          const alert = createAlert(
            'info',
            'hardware_npu',
            `Optimized NPU Registers for ${tgtModel.asicType}`,
            `Auto-remediated legacy NP6-specific registers (fastpath, capwap-offload) that are natively replaced by the ${tgtModel.asicType} ASIC fast-path processing pipelines.`,
            node.lineNumber,
            node.rawLine,
            'No manual intervention required; hardware acceleration runs automatically.',
            undefined,
            true
          );
          alert.appliedFix = true;

          output.push(`${indent}config system npu`);
          output.push(`${indent}    # Auto-optimized for ${tgtModel.name} (${tgtModel.asicType})`);
          output.push(`${indent}end`);
          return;
        }
      }

      // SSL-VPN Web Portal deprecation alert in FortiOS 7.4+
      if (sectionName.includes('vpn ssl web portal') && parseFloat(tgtVer) >= 7.4) {
        const shouldAutoFixSslVpn = options.autoFixSyntaxErrors || options.standardizeSslVpnPortal;
        const alert = createAlert(
          shouldAutoFixSslVpn ? 'info' : 'critical',
          'syntax_deprecated',
          `SSL-VPN Web Mode / Bookmarks Deprecated in FortiOS ${tgtVer}`,
          `Fortinet has deprecated SSL-VPN Web Mode (portal bookmarks, reverse proxy) starting in FortiOS 7.4.0+ due to security hardening. Tunnel Mode is retained, but Web Mode bookmarks will be ignored or cause syntax errors on target FortiGate.`,
          node.lineNumber,
          node.rawLine,
          'Migrate Web Mode users to FortiClient IPsec / SSL-VPN Tunnel Mode or Fortinet Universal ZTNA.',
          'config vpn ssl web portal\n    edit "full-access"\n        set tunnel-mode enable\n        set web-mode disable\n    next\nend',
          true
        );
        if (shouldAutoFixSslVpn) {
          alert.appliedFix = true;
          output.push(`${indent}config vpn ssl web portal`);
          output.push(`${indent}    edit "full-access"`);
          output.push(`${indent}        set tunnel-mode enable`);
          output.push(`${indent}        set web-mode disable`);
          output.push(`${indent}    next`);
          output.push(`${indent}end`);
          return;
        }
      }

      // Standard config block output
      output.push(node.rawLine);
      if (node.children) {
        this.processNodeList(
          node.children,
          output,
          srcModel,
          tgtModel,
          srcVer,
          tgtVer,
          portMap,
          options,
          alerts,
          createAlert,
          stats
        );
      }
      output.push(`${indent}end`);
      return;
    }

    if (node.type === 'edit') {
      let editId = node.name || '';
      // Remap edit ID if this is an interface edit
      if (node.parent && node.parent.name === 'system interface') {
        const remapped = portMap.get(editId);
        if (remapped && remapped !== editId) {
          const alert = createAlert(
            'info',
            'interface',
            `Interface Definition Renamed: '${editId}' ➔ '${remapped}'`,
            `Physical interface '${editId}' on ${srcModel.name} remapped to '${remapped}' on ${tgtModel.name}.`,
            node.lineNumber,
            node.rawLine,
            undefined,
            undefined,
            true
          );
          alert.appliedFix = true;
          editId = remapped;
        }
      }

      output.push(`${indent}edit "${editId}"`);

      // Auto-inject missing UUID for firewall policies
      const isFirewallPolicy = node.parent && (node.parent.name === 'firewall policy' || node.parent.name === 'firewall security-policy');
      const hasUuid = node.children?.some((c) => c.type === 'set' && (c.key || '').toLowerCase() === 'uuid');
      if (isFirewallPolicy && !hasUuid && (options.generateMissingUuids || options.autoFixSyntaxErrors)) {
        const generatedUuid = this.generateUuid();
        const alert = createAlert(
          'info',
          'syntax_deprecated',
          `Missing Policy UUID Auto-Generated: policy '${editId}'`,
          `FortiOS best practices and FortiManager compliance mandate unique UUIDs for firewall policies. Injected RFC 4122 compliant UUID '${generatedUuid}'.`,
          node.lineNumber,
          node.rawLine,
          'UUID auto-generated for policy compliance.',
          `set uuid ${generatedUuid}`,
          true
        );
        alert.appliedFix = true;
        output.push(`${indent}    set uuid ${generatedUuid}`);
      }

      if (node.children) {
        this.processNodeList(
          node.children,
          output,
          srcModel,
          tgtModel,
          srcVer,
          tgtVer,
          portMap,
          options,
          alerts,
          createAlert,
          stats
        );
      }
      output.push(`${indent}next`);
      return;
    }

    if (node.type === 'set') {
      const key = (node.key || '').toLowerCase();
      let values = [...(node.values || [])];

      // Check for Encrypted Passwords / PSK / Secrets
      const hasEncSecret = values.some((v) => v === 'ENC' || v.startsWith('ENC'));
      if (hasEncSecret) {
        createAlert(
          'critical',
          'secret_credential',
          `Hardware-Encrypted Secret Detected: 'set ${node.key}'`,
          `The configuration contains an encrypted password or pre-shared key ('ENC ...') on line ${node.lineNumber}. FortiOS encryption uses device-specific hardware salt. These credentials CANNOT be automatically decrypted by target ${tgtModel.name} and will fail to authenticate!`,
          node.lineNumber,
          node.rawLine,
          `Re-enter the plain text secret for 'set ${node.key}' in FortiOS CLI or FortiManager after uploading the configuration.`,
          `# Action Required: Update secret in plaintext\nset ${node.key} "YOUR_PLAINTEXT_SECRET_HERE"`
        );
      }

      // Check for deprecated match-vip enable in FortiOS 7.0+
      if (key === 'match-vip' && parseFloat(tgtVer) >= 7.0) {
        if (options.fixMatchVipSyntax || options.autoFixSyntaxErrors) {
          const alert = createAlert(
            'info',
            'syntax_deprecated',
            `Deprecated 'match-vip enable' Stripped`,
            `In FortiOS 7.0+, 'set match-vip enable' was removed from firewall policies because VIPs in 'dstaddr' automatically trigger VIP matching. Auto-fixed by removing command to avoid CLI parser error.`,
            node.lineNumber,
            node.rawLine,
            'No manual intervention needed. Handled automatically by FortiOS 7.x.',
            undefined,
            true
          );
          alert.appliedFix = true;
          return; // omit from output
        }
      }

      // Auto-Fix: Quote unquoted string comments/descriptions with spaces
      if (
        options.autoFixSyntaxErrors &&
        ['comments', 'comment', 'description', 'alias'].includes(key) &&
        values.length > 1 &&
        !values[0].startsWith('"')
      ) {
        const joined = `"${values.join(' ').replace(/"/g, '')}"`;
        const alert = createAlert(
          'info',
          'syntax_deprecated',
          `Auto-Quoted CLI Parameter: 'set ${node.key}'`,
          `String literal containing spaces on line ${node.lineNumber} was enclosed in double quotes (${joined}) to prevent FortiOS CLI parser truncation.`,
          node.lineNumber,
          node.rawLine,
          'Enclosed parameter in double quotes.',
          `set ${node.key} ${joined}`,
          true
        );
        alert.appliedFix = true;
        values = [joined];
      }

      // Check for Weak / Deprecated Cryptographic Ciphers in IPsec
      if (key === 'proposal') {
        const rawProposal = values.join(' ').toLowerCase();
        const weakCiphers = ['des', '3des', 'md5', 'des-sha1', '3des-md5', '3des-sha1'];
        const isWeak = weakCiphers.some((c) => rawProposal.includes(c));

        if (isWeak) {
          const canAutoFix = options.upgradeDeprecatedCiphers || options.autoFixSyntaxErrors;
          const alert = createAlert(
            'critical',
            'security_cipher',
            `Deprecated/Insecure IPsec Proposal: '${values.join(' ')}'`,
            `Line ${node.lineNumber} configures legacy encryption algorithms (DES/3DES/MD5) that are cryptographically broken, unaccelerated on ${tgtModel.asicType}, and disabled in FortiOS ${tgtVer} default security standards.`,
            node.lineNumber,
            node.rawLine,
            `Upgrade phase proposals to AES-256-GCM or AES-256 with SHA-256 hash.`,
            `set proposal aes256gcm aes256-sha256\nset dhgrp 14 19 20`,
            canAutoFix
          );

          if (canAutoFix) {
            alert.appliedFix = true;
            values = ['aes256gcm', 'aes256-sha256'];
          }
        }
      }

      // Check for weak DH Groups (DH 1, 2, 5)
      if (key === 'dhgrp') {
        const rawDh = values.join(' ');
        if (rawDh.includes('1') || rawDh.includes('2') || rawDh.includes('5')) {
          const canAutoFix = options.upgradeDeprecatedCiphers || options.autoFixSyntaxErrors;
          const alert = createAlert(
            'warning',
            'security_cipher',
            `Legacy Diffie-Hellman Group: 'set dhgrp ${rawDh}'`,
            `Diffie-Hellman groups 1, 2, and 5 (768/1024-bit modulus) provide inadequate security for modern enterprise networks.`,
            node.lineNumber,
            node.rawLine,
            `Upgrade to DH Group 14 (2048-bit), Group 19 (256-bit ECP), or Group 20 (384-bit ECP).`,
            `set dhgrp 14 19 20`,
            canAutoFix
          );

          if (canAutoFix) {
            alert.appliedFix = true;
            values = ['14', '19', '20'];
          }
        }
      }

      // Check for HA Heartbeat interfaces remap
      if (key === 'hbdev') {
        // e.g. "ha" 50 "port14" 50
        const remappedTokens = this.remapTokens(values, portMap);
        values = remappedTokens;
      }

      // Remap Interface tokens in any command (srcintf, dstintf, interface, device, extintf, etc.)
      if (
        options.autoRemapInterfaces &&
        [
          'srcintf',
          'dstintf',
          'interface',
          'device',
          'extintf',
          'hbdev',
          'session-sync-dev',
        ].includes(key)
      ) {
        values = this.remapTokens(values, portMap);
      }

      output.push(`${indent}set ${node.key} ${values.join(' ')}`);
      return;
    }

    if (node.type === 'unset') {
      output.push(node.rawLine);
      return;
    }

    if (node.type === 'raw') {
      output.push(node.rawLine);
      return;
    }
  }

  private remapTokens(tokens: string[], portMap: Map<string, string>): string[] {
    return tokens.map((token) => {
      const clean = token.replace(/^"(.*)"$/, '$1');
      if (portMap.has(clean)) {
        const target = portMap.get(clean)!;
        return token.startsWith('"') ? `"${target}"` : target;
      }
      return token;
    });
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getBuildTag(modelId: string, version: FortiOSVersion): string {
    const rawModel = modelId.replace('FG-', '').replace('-', '');
    const verClean = version.replace('.', '0');
    return `${rawModel}-${verClean}-FW-build${Math.floor(1000 + Math.random() * 8000)}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  }
}
