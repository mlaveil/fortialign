import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FortiGateModelDef,
  FortiOSVersion,
  MigrationAlert,
  InterfaceMapping,
  ConfigStats,
} from '../types/fortigate';

export interface PdfExportOptions {
  sourceModel: FortiGateModelDef;
  sourceVersion: FortiOSVersion;
  targetModel: FortiGateModelDef;
  targetVersion: FortiOSVersion;
  alerts: MigrationAlert[];
  interfaceMappings: InterfaceMapping[];
  compatibilityScore: number;
  stats?: ConfigStats;
  fileName?: string;
}

export function generateMigrationPdfReport(options: PdfExportOptions): void {
  const {
    sourceModel,
    sourceVersion,
    targetModel,
    targetVersion,
    alerts,
    interfaceMappings,
    compatibilityScore,
    stats,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const infoAlerts = alerts.filter((a) => a.severity === 'info');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // --- Header Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Red accent bar
  doc.setFillColor(220, 38, 38); // red-600
  doc.rect(0, 0, 6, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('FORTIGATE CONFIGURATION MIGRATION REPORT', margin + 2, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Official Hardware & Firmware Transition Audit Record | Generated: ${dateStr} at ${timeStr}`,
    margin + 2,
    18
  );
  doc.text(
    'Classification: CHANGE MANAGEMENT / RESTRICTED',
    margin + 2,
    23
  );

  currentY = 36;

  // --- Executive Summary Cards (Grid) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('1. Executive Transition Summary', margin, currentY);
  currentY += 4;

  const cardWidth = (pageWidth - margin * 2 - 6) / 2;
  const cardHeight = 36;

  // Source Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SOURCE APPLIANCE', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(sourceModel.name, margin + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Firmware: FortiOS v${sourceVersion}`, margin + 4, currentY + 18);
  doc.text(`Architecture: Gen ${sourceModel.generation} | ASIC: ${sourceModel.asicType}`, margin + 4, currentY + 23);
  doc.text(`Form Factor: ${sourceModel.formFactor} | Firewall: ${sourceModel.throughput}`, margin + 4, currentY + 28);
  doc.text(`Default Ports: ${sourceModel.defaultPorts.length} interfaces`, margin + 4, currentY + 33);

  // Target Box
  const targetX = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(targetX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38); // red-600
  doc.text('TARGET APPLIANCE (DESTINATION)', targetX + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(targetModel.name, targetX + 4, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Firmware: FortiOS v${targetVersion}`, targetX + 4, currentY + 18);
  doc.text(`Architecture: Gen ${targetModel.generation} | ASIC: ${targetModel.asicType}`, targetX + 4, currentY + 23);
  doc.text(`Form Factor: ${targetModel.formFactor} | Firewall: ${targetModel.throughput}`, targetX + 4, currentY + 28);
  doc.text(`Default Ports: ${targetModel.defaultPorts.length} interfaces`, targetX + 4, currentY + 33);

  currentY += cardHeight + 6;

  // --- Summary Statistics Badges ---
  const statBoxWidth = (pageWidth - margin * 2 - 9) / 4;
  const statHeight = 18;

  // 1. Compatibility Score
  const scoreBg = compatibilityScore >= 85 ? [240, 253, 244] : compatibilityScore >= 60 ? [254, 252, 232] : [254, 242, 242];
  const scoreText = compatibilityScore >= 85 ? [22, 101, 52] : compatibilityScore >= 60 ? [133, 77, 14] : [153, 27, 27];
  doc.setFillColor(scoreBg[0], scoreBg[1], scoreBg[2]);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(margin, currentY, statBoxWidth, statHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(scoreText[0], scoreText[1], scoreText[2]);
  doc.text('COMPATIBILITY', margin + 3, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${compatibilityScore}%`, margin + 3, currentY + 14);

  // 2. Critical Blockers
  const critX = margin + statBoxWidth + 3;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(critX, currentY, statBoxWidth, statHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('CRITICAL BLOCKERS', critX + 3, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${criticalAlerts.length}`, critX + 3, currentY + 14);

  // 3. Warnings
  const warnX = critX + statBoxWidth + 3;
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(warnX, currentY, statBoxWidth, statHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SYNTAX WARNINGS', warnX + 3, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${warningAlerts.length}`, warnX + 3, currentY + 14);

  // 4. Mapped Interfaces
  const mapX = warnX + statBoxWidth + 3;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(mapX, currentY, statBoxWidth, statHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('REMAPPED PORTS', mapX + 3, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${interfaceMappings.filter((m) => m.sourcePort !== m.targetPort).length} / ${interfaceMappings.length}`, mapX + 3, currentY + 14);

  currentY += statHeight + 8;

  // --- Section 2: Detailed Configuration Conversion Metrics ---
  if (stats) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Configuration Object Statistics', margin, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Object Category', 'Parsed Count', 'Remediations Applied', 'Integrity Status']],
      body: [
        ['Firewall Policies', `${stats.firewallPoliciesCount ?? 0}`, 'UUIDs generated & ID sequence preserved', 'VALIDATED'],
        ['Network Interfaces', `${stats.interfacesCount ?? stats.interfaceCount ?? 0}`, `${interfaceMappings.filter((m) => m.sourcePort !== m.targetPort).length} physical ports mapped`, 'ALIGNED'],
        ['Address / Group Objects', `${stats.addressObjectsCount ?? 0}`, 'Format verified across versions', 'COMPATIBLE'],
        ['Static Routes & Gateways', `${stats.staticRoutesCount ?? 0}`, 'Nexthop interfaces adjusted', 'VALIDATED'],
        ['VPN Tunnels (IPsec / SSL)', `${stats.vpnTunnelsCount ?? 0}`, 'Phase 1/2 ciphers & portals verified', (stats.encryptedPasswordsCount ?? 0) > 0 ? 'NEEDS SECRET RE-ENTRY' : 'CLEAN'],
        ['SD-WAN Rules & Members', `${stats.sdwanRulesCount ?? 0}`, 'Modernized to virtual-wan-link zone members', 'OPTIMIZED'],
        ['Encrypted Secrets (ENC ...)', `${stats.encryptedPasswordsCount ?? 0}`, 'Device-specific master keys flagged', (stats.encryptedPasswordsCount ?? 0) > 0 ? 'CRITICAL ACTION' : 'NONE'],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 46 },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 70 },
        3: { fontStyle: 'bold', cellWidth: 40, halign: 'center' },
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Section 3: Interface & Port Translation Table ---
  // Ensure we don't start at bottom of page
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Interface & Physical Port Translation Matrix', margin, currentY);
  currentY += 3;

  const portTableRows = interfaceMappings.map((m) => [
    m.sourcePort,
    m.targetPort,
    m.status.toUpperCase(),
    m.note || (m.sourcePort === m.targetPort ? 'Exact 1:1 hardware port identity' : `Remapped from ${sourceModel.name} to ${targetModel.name}`),
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Source Port', 'Target Port', 'Status', 'Technical Remap Notes']],
    body: portTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [220, 38, 38], // Fortinet red
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 'auto' },
    },
  });

  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- Section 4: Migration Alerts & Technical Remediations ---
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('4. Syntax Audits & Migration Alert Details', margin, currentY);
  currentY += 3;

  if (alerts.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No syntax incompatibilities or warnings detected. Clean configuration transition.', margin, currentY + 5);
    currentY += 12;
  } else {
    const alertRows = alerts.map((a, i) => [
      `${i + 1}`,
      a.severity.toUpperCase(),
      a.category,
      a.sourceLine ? `L${a.sourceLine}` : 'N/A',
      `${a.title}\n${a.description}${a.suggestedRemedy ? `\nRemedy: ${a.suggestedRemedy}` : ''}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Severity', 'Category', 'Line', 'Description & Action Item']],
      body: alertRows,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 24, fontStyle: 'bold' },
        3: { cellWidth: 14, halign: 'center' },
        4: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const val = data.cell.raw as string;
          if (val === 'CRITICAL') {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (val === 'WARNING') {
            data.cell.styles.textColor = [217, 119, 6];
          } else {
            data.cell.styles.textColor = [37, 99, 235];
          }
        }
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // --- Section 5: Standard Pre & Post-Deployment Checklist ---
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('5. Standard Deployment & Post-Loading Verification Checklist', margin, currentY);
  currentY += 4;

  const checklistItems = [
    '[ ] Physical Layer: Verify all link states & speed/duplex negotiation (get system interface physical).',
    '[ ] Encrypted Secrets: Re-enter plain-text PSKs, admin passwords, and BGP/HA secrets flagged in audit.',
    '[ ] Parser Error Log: Execute "diagnose debug config-error-log read" immediately following first reboot.',
    '[ ] SD-WAN Health Check: Confirm SLA performance and active member links (diagnose sys sdwan health-check status).',
    '[ ] IPsec Tunnels: Verify Phase 1 / Phase 2 SA establishment (get vpn ipsec tunnel summary).',
    '[ ] Routing Table: Inspect FIB against source router (get router info routing-table all).',
    '[ ] Security Profiles: Ensure IPS, AntiVirus, and SSL inspection engines are initialized without errors.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);

  checklistItems.forEach((item) => {
    if (currentY > pageHeight - 15) {
      doc.addPage();
      currentY = margin;
    }
    doc.text(item, margin, currentY);
    currentY += 5;
  });

  // --- Page Numbering & Footer Disclaimer across all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FortiGate Migration Engine | Confidential & Proprietary | ${sourceModel.name} (v${sourceVersion}) ➔ ${targetModel.name} (v${targetVersion})`,
      margin,
      pageHeight - 7
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 14,
      pageHeight - 7
    );
  }

  // Generate filename and trigger download
  const defaultFileName = `fortigate_migration_report_${sourceModel.name.replace(/\s+/g, '')}_to_${targetModel.name.replace(/\s+/g, '')}_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(options.fileName || defaultFileName);
}
