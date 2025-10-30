import type { AuditReport, Finding, Severity } from '@types/report';

export type UpgradePathKey = 'proxyAdmin' | 'implementation' | 'beacon';

export type PathStatus = 'expected' | 'unexpected' | 'blocked';

export interface UpgradeMatrixCell {
  status: PathStatus;
  summary: string;
  severity: Severity;
  findings: string[];
}

export interface UpgradeMatrixRow {
  proxy: string;
  cells: Record<UpgradePathKey, UpgradeMatrixCell>;
}

type MutableRow = {
  proxy: string;
  findings: Finding[];
};

const PROXY_MATCHER = /(TransparentUpgradeableProxy|BeaconProxy|ERC1967Proxy|UpgradeableProxy)/i;

const DEFAULT_SUMMARIES: Record<UpgradePathKey, string> = {
  proxyAdmin: 'Standard upgrade path via ProxyAdmin with explicit governance controls.',
  implementation: 'No implementation self-upgrade path detected.',
  beacon: 'No beacon linkage observed.'
};

const SAFE_SEVERITY: Severity = 'Low';

function bootstrapCell(status: PathStatus, summary: string): UpgradeMatrixCell {
  return {
    status,
    summary,
    severity: SAFE_SEVERITY,
    findings: []
  };
}

function getProxiesFromFinding(finding: Finding): string[] {
  const contracts = finding.details.contracts_involved ?? [];
  const explicit = contracts.filter((name) => PROXY_MATCHER.test(name) && !/ProxyAdmin/i.test(name));

  if (explicit.length > 0) {
    return explicit;
  }

  const textBundle = [finding.details.description, finding.details.final_conclusion, finding.details.attack_scenario]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/transparent/i.test(textBundle)) {
    return ['TransparentUpgradeableProxy'];
  }

  if (/beaconproxy/i.test(textBundle)) {
    return ['BeaconProxy'];
  }

  if (/erc1967proxy/i.test(textBundle)) {
    return ['ERC1967Proxy'];
  }

  return [];
}

function enrichCell(
  cell: UpgradeMatrixCell,
  finding: Finding,
  override: Partial<UpgradeMatrixCell>,
  emphasisSeverity?: Severity
) {
  if (override.status) {
    cell.status = override.status;
  }
  if (override.summary) {
    cell.summary = override.summary;
  }
  if (override.findings) {
    cell.findings.push(...override.findings);
  } else {
    cell.findings.push(finding.details.description);
  }
  if (emphasisSeverity) {
    cell.severity = emphasisSeverity;
  } else if (finding.details.severity) {
    cell.severity = finding.details.severity;
  }
}

function analyseFinding(row: UpgradeMatrixRow, finding: Finding) {
  const text = [
    finding.details.description,
    finding.details.final_conclusion,
    finding.details.red_team_argument,
    finding.details.blue_team_argument
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('uups') || text.includes('upgradeTo') || text.includes('authorizeupgrade')) {
    enrichCell(
      row.cells.implementation,
      finding,
      {
        status: 'unexpected',
        summary:
          finding.details.final_conclusion ??
          'Implementation exposes upgrade surfaces that bypass ProxyAdmin controls.'
      },
      finding.details.severity
    );
  }

  if (text.includes('beacon')) {
    enrichCell(
      row.cells.beacon,
      finding,
      {
        status: 'unexpected',
        summary:
          finding.details.final_conclusion ?? 'Beacon owner can disrupt or replace implementations for dependents.'
      },
      finding.details.severity
    );
  }

  if (text.includes('proxyadmin')) {
    if (text.includes('not the admin') || text.includes('bypass') || text.includes('does not assert')) {
      enrichCell(
        row.cells.proxyAdmin,
        finding,
        {
          status: 'unexpected',
          summary:
            finding.details.final_conclusion ??
            'ProxyAdmin path depends on the proxy retaining ProxyAdmin as admin; misalignment detected.'
        },
        finding.details.severity
      );
    } else {
      enrichCell(row.cells.proxyAdmin, finding, { status: row.cells.proxyAdmin.status }, finding.details.severity);
    }
  }
}

export function buildUpgradeMatrix(report: AuditReport): UpgradeMatrixRow[] {
  const proxyMap = new Map<string, MutableRow>();

  for (const finding of report.findings) {
    const proxies = getProxiesFromFinding(finding);
    if (proxies.length === 0) continue;

    for (const proxy of proxies) {
      const existing = proxyMap.get(proxy);
      if (existing) {
        existing.findings.push(finding);
      } else {
        proxyMap.set(proxy, { proxy, findings: [finding] });
      }
    }
  }

  if (proxyMap.size === 0) {
    proxyMap.set('TransparentUpgradeableProxy', { proxy: 'TransparentUpgradeableProxy', findings: report.findings });
  }

  const rows: UpgradeMatrixRow[] = [];

  for (const { proxy, findings } of proxyMap.values()) {
    const row: UpgradeMatrixRow = {
      proxy,
      cells: {
        proxyAdmin: bootstrapCell('expected', DEFAULT_SUMMARIES.proxyAdmin),
        implementation: bootstrapCell('blocked', DEFAULT_SUMMARIES.implementation),
        beacon: bootstrapCell('blocked', DEFAULT_SUMMARIES.beacon)
      }
    };

    for (const finding of findings) {
      analyseFinding(row, finding);
    }

    rows.push(row);
  }

  return rows;
}

export function proxyHasUnexpectedPaths(row: UpgradeMatrixRow): boolean {
  return Object.values(row.cells).some((cell) => cell.status === 'unexpected');
}
