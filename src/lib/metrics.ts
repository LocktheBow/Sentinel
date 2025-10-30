import type { AuditReport, Finding, Severity } from '@types/report';

export const severityOrder: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Info', 'N/A'];

export function countBySeverity(report: AuditReport): Record<Severity, number> {
  return report.findings.reduce<Record<Severity, number>>((acc, finding) => {
    const severity = finding.details.severity;
    acc[severity] = (acc[severity] ?? 0) + 1;
    return acc;
  }, Object.fromEntries(severityOrder.map((sev) => [sev, 0])) as Record<Severity, number>);
}

export function groupFindingsBySeverity(report: AuditReport): Record<Severity, Finding[]> {
  return report.findings.reduce<Record<Severity, Finding[]>>((acc, finding) => {
    const severity = finding.details.severity;
    if (!acc[severity]) {
      acc[severity] = [];
    }
    acc[severity].push(finding);
    return acc;
  }, Object.fromEntries(severityOrder.map((sev) => [sev, []])) as Record<Severity, Finding[]>);
}

export function severityToIndex(severity: Severity): number {
  const index = severityOrder.indexOf(severity);
  return index === -1 ? severityOrder.length : index;
}

export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => severityToIndex(a.details.severity) - severityToIndex(b.details.severity));
}

export function deriveAttackCapabilities(report: AuditReport): Array<{ capability: string; severity: Severity; description: string }> {
  const capabilities: Array<{ capability: string; severity: Severity; description: string }> = [];
  for (const finding of report.findings) {
    const text = finding.details.economic_impact ?? finding.details.final_conclusion ?? finding.details.description;
    if (!text) continue;

    const capability = extractCapabilityLabel(text);
    capabilities.push({ capability, severity: finding.details.severity, description: text });
  }
  return capabilities;
}

const CAPABILITY_KEYWORDS: Array<{ keyword: RegExp; label: string }> = [
  { keyword: /mint|inflate|seigniorage/i, label: 'Mint or Inflate' },
  { keyword: /drain|steal|seize|withdraw/i, label: 'Seize Assets' },
  { keyword: /freeze|halt|pause/i, label: 'Freeze Operations' },
  { keyword: /brick|permanent|irreversible/i, label: 'Brick Upgrades' },
  { keyword: /downtime|dos|outage/i, label: 'Denial of Service' },
  { keyword: /migration|redeploy/i, label: 'Forced Migration' }
];

function extractCapabilityLabel(text: string): string {
  for (const { keyword, label } of CAPABILITY_KEYWORDS) {
    if (keyword.test(text)) {
      return label;
    }
  }
  return 'Operational Risk';
}
