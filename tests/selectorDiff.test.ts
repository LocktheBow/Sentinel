import { describe, expect, it } from 'vitest';
import { computeSelectorCollisions } from '@lib/selectorDiff';
import type { AuditReport } from '@types/report';

const mockReport: AuditReport = {
  security_score: 10,
  findings: [
    {
      source: 'curated',
      details: {
        description: 'Implementation exposes upgradeTo and upgradeToAndCall while behind TransparentUpgradeableProxy.',
        severity: 'Critical',
        red_team_argument: 'Invoke 0x3659CFE6 via proxy to seize logic.',
        blue_team_argument: 'Ban Transparent + UUPS mixing.',
        final_conclusion: 'Unauthorized upgrade path via selector clash.',
        attack_scenario: undefined,
        economic_impact: undefined,
        line_numbers: [42],
        contracts_involved: ['TransparentUpgradeableProxy', 'MockImplementation'],
        chained_findings: ['Proxy forwards non-admin calls to implementation.']
      }
    },
    {
      source: 'deep_adversarial',
      details: {
        description: 'ProxyAdmin changeAdmin without asserting admin collides with implementation changeAdmin(address).',
        severity: 'High',
        red_team_argument: 'Call changeAdmin(address) through proxy to reassign admin.',
        blue_team_argument: 'Preflight getProxyAdmin.',
        final_conclusion: 'Selector clash enables governance bypass.',
        attack_scenario: undefined,
        economic_impact: undefined,
        line_numbers: [13],
        contracts_involved: ['ProxyAdmin', 'TransparentUpgradeableProxy'],
        chained_findings: []
      }
    }
  ],
  meta: { files: [], project_root: 'mock', generated_at: Date.now() }
};

describe('computeSelectorCollisions', () => {
  it('flags Transparent + UUPS selector clashes', () => {
    const collisions = computeSelectorCollisions(mockReport);
    expect(collisions.length).toBeGreaterThan(1);
    const selectors = collisions.map((collision) => collision.selector.toLowerCase());
    expect(selectors).toContain('0x3659cfe6');
    expect(selectors).toContain('0x8f283970');
  });

  it('deduplicates collisions per finding source', () => {
    const extendedReport: AuditReport = {
      ...mockReport,
      findings: [...mockReport.findings, mockReport.findings[0]]
    };
    const collisions = computeSelectorCollisions(extendedReport);
    expect(collisions.filter((item) => item.selector === '0x3659cfe6')).toHaveLength(1);
  });
});
