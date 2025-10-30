import type { Meta, StoryObj } from '@storybook/react';
import { ParetoChart } from '@components/ParetoChart';
import type { AuditReport } from '@types/report';

const report: AuditReport = {
  security_score: 10,
  findings: [
    {
      source: 'curated',
      details: {
        description: 'Unauthorized upgrade allows draining vaults.',
        severity: 'Critical',
        red_team_argument: 'Forward upgradeTo to seize logic.',
        blue_team_argument: 'Ban Transparent + UUPS mixing.',
        final_conclusion: 'Full TVL at risk without controls.',
        economic_impact: 'Steal assets, brick governance, require migration.',
        attack_scenario: undefined,
        contracts_involved: ['Vault'],
        chained_findings: [],
        line_numbers: [10]
      }
    },
    {
      source: 'analysis',
      details: {
        description: 'Initializer msg.sender drift merges ProxyAdmin and owner roles.',
        severity: 'High',
        blue_team_argument: 'Initialize with explicit addresses.',
        final_conclusion: 'Operational DoS and governance bypass risk.',
        red_team_argument: undefined,
        economic_impact: 'Downtime and forced migration cost.',
        attack_scenario: undefined,
        contracts_involved: ['ProxyAdmin'],
        chained_findings: [],
        line_numbers: []
      }
    }
  ],
  meta: { files: [], project_root: 'storybook', generated_at: Date.now() }
};

const meta: Meta<typeof ParetoChart> = {
  title: 'Visualizations/ParetoChart',
  component: ParetoChart,
  args: {
    report
  }
};

export default meta;

type Story = StoryObj<typeof ParetoChart>;

export const Default: Story = {};
