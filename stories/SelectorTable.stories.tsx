import type { Meta, StoryObj } from '@storybook/react';
import { SelectorTable } from '@components/SelectorTable';
import { computeSelectorCollisions } from '@lib/selectorDiff';
import type { AuditReport } from '@types/report';

const report: AuditReport = {
  security_score: 8,
  findings: [
    {
      source: 'curated',
      details: {
        description: 'Implementation exposes upgradeTo / upgradeToAndCall behind Transparent proxy.',
        severity: 'Critical',
        red_team_argument: '0x3659cfe6 and 0x4f1ef286 reachable from proxy.',
        blue_team_argument: 'Remove UUPS functions or enforce authorizeUpgrade.',
        final_conclusion: 'Selector clash leads to unauthorized upgrade.',
        attack_scenario: undefined,
        economic_impact: undefined,
        contracts_involved: ['TransparentUpgradeableProxy'],
        chained_findings: [],
        line_numbers: [33]
      }
    }
  ],
  meta: { files: [], project_root: 'storybook', generated_at: Date.now() }
};

const collisions = computeSelectorCollisions(report);

const meta: Meta<typeof SelectorTable> = {
  title: 'Visualizations/SelectorTable',
  component: SelectorTable,
  args: {
    collisions,
    height: 260
  }
};

export default meta;

type Story = StoryObj<typeof SelectorTable>;

export const Default: Story = {};
