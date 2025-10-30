import { Empty, Typography } from 'antd';
import { useMemo } from 'react';
import type { AuditReport, Severity } from '@types/report';
import { deriveAttackCapabilities } from '@lib/metrics';

export type ParetoChartProps = {
  report: AuditReport;
};

const severityWeight: Record<Severity, number> = {
  Critical: 5,
  High: 3,
  Medium: 2,
  Low: 1,
  Info: 0.5,
  'N/A': 0.25
};

type ParetoRow = {
  capability: string;
  score: number;
  count: number;
  cumulative: number;
};

function aggregateCapabilities(report: AuditReport): ParetoRow[] {
  const bucket = new Map<string, { score: number; count: number }>();

  deriveAttackCapabilities(report).forEach((item) => {
    const weight = severityWeight[item.severity] ?? 1;
    const entry = bucket.get(item.capability);
    if (entry) {
      entry.score += weight;
      entry.count += 1;
    } else {
      bucket.set(item.capability, { score: weight, count: 1 });
    }
  });

  const entries = Array.from(bucket.entries())
    .map(([capability, value]) => ({ capability, ...value }))
    .sort((a, b) => b.score - a.score);

  const total = entries.reduce((sum, entry) => sum + entry.score, 0) || 1;
  let running = 0;

  return entries.map((entry) => {
    running += entry.score;
    return {
      capability: entry.capability,
      score: Math.round(entry.score * 10) / 10,
      count: entry.count,
      cumulative: Math.round((running / total) * 1000) / 10
    };
  });
}

export function ParetoChart({ report }: ParetoChartProps) {
  const rows = useMemo(() => aggregateCapabilities(report), [report]);

  if (!rows.length) {
    return <Empty description="No economic impact data" />;
  }

  const totalScore = rows.reduce((sum, row) => sum + row.score, 0) || 1;

  return (
    <div className="pareto-chart">
      <div className="pareto-chart__header">
        <Typography.Text className="pareto-chart__header-capability">Capability</Typography.Text>
        <Typography.Text className="pareto-chart__header-score">Risk pts</Typography.Text>
        <Typography.Text className="pareto-chart__header-cumulative">Cumulative</Typography.Text>
      </div>
      {rows.map((row) => (
        <div className="pareto-chart__row" key={row.capability}>
          <div className="pareto-chart__label">
            <Typography.Text>{row.capability}</Typography.Text>
            <Typography.Text type="secondary">×{row.count}</Typography.Text>
          </div>
          <div className="pareto-chart__bar">
            <div
              className="pareto-chart__bar-fill"
              style={{ width: `${Math.min(100, (row.score / totalScore) * 100)}%` }}
            />
          </div>
          <div className="pareto-chart__metrics">
            <Typography.Text>{row.score.toFixed(1)}</Typography.Text>
            <Typography.Text type="secondary">{row.cumulative.toFixed(1)}%</Typography.Text>
          </div>
        </div>
      ))}
    </div>
  );
}
