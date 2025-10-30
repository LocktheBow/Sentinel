import type { Meta, StoryObj } from '@storybook/react';
import { AttackGraph } from '@components/AttackGraph';
import type { AuditReport } from '@types/report';

const sampleReport: AuditReport = {
  security_score: 12,
  findings: [
    {
      source: 'curated',
      details: {
        description: 'Transparent proxy forwards to UUPS implementation exposing upgradeTo.',
        severity: 'Critical',
        red_team_argument: '0x3659cfe6 forwarded via proxy allows unauthorized upgrade.',
        blue_team_argument: 'Ban Transparent + UUPS mixing.',
        final_conclusion: 'Unauthorized upgrade path exists.',
        attack_scenario: '1) Forwarded upgradeTo; 2) Swap implementation; 3) Rewrite admin slot.',
        economic_impact: 'Full TVL at risk.',
        contracts_involved: ['TransparentUpgradeableProxy', 'ProxyAdmin'],
        chained_findings: ['Proxy forwards non-admin calls to implementation.'],
        line_numbers: [42]
      }
    },
    {
      source: 'deep_adversarial',
      details: {
        description: 'ProxyAdmin upgrade functions do not assert current admin.',
        severity: 'High',
        red_team_argument: 'changeProxyAdmin forwards and hits implementation.',
        blue_team_argument: 'Scripts must assert admin before calling.',
        final_conclusion: 'Governance bypass when admin drift occurs.',
        attack_scenario: '1) Admin drift; 2) ProxyAdmin calls upgrade; 3) Delegatecall executes mal logic.',
        economic_impact: 'Operational DoS and takeover.',
        contracts_involved: ['ProxyAdmin', 'TransparentUpgradeableProxy'],
        chained_findings: ['Transparent proxy admin selectors collide.'],
        line_numbers: [17]
      }
    }
  ],
  meta: { files: [], project_root: 'storybook', generated_at: Date.now() }
};

const meta: Meta<typeof AttackGraph> = {
  id: 'visualizations-attackgraph',
  title: 'Visualizations/AttackGraph',
  component: AttackGraph,
  args: {
    report: sampleReport,
    height: 420
  }
};

export default meta;

type Story = StoryObj<typeof AttackGraph>;

export const Default: Story = {};
