import { Alert, Card, Empty, Space, Statistic, Typography } from 'antd';
import { useMemo } from 'react';
import { useReport } from '@/features/report/ReportProvider';
import type { Severity } from '@types/report';

export function BeaconPage() {
  const { report } = useReport();

  const cascade = useMemo(() => {
    if (!report) return null;

    const severityWeight: Record<Severity, number> = {
      Critical: 5,
      High: 3,
      Medium: 2,
      Low: 1,
      Info: 0.5,
      'N/A': 0.25
    };

    let beaconAlerts = 0;
    let beaconProxies = 0;
    let downstream = 0;

    report.findings.forEach((finding) => {
      const text = [
        finding.details.description,
        finding.details.final_conclusion,
        finding.details.red_team_argument,
        finding.details.blue_team_argument
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const contracts = new Set((finding.details.contracts_involved ?? []).map((contract) => contract.toLowerCase()));
      const weight = severityWeight[finding.details.severity] ?? 1;

      if (text.includes('beacon') || contracts.has('upgradeablebeacon')) {
        beaconAlerts += weight;
      }
      if (contracts.has('beaconproxy')) {
        beaconProxies += weight;
      }
      if (
        contracts.has('beaconproxy') ||
        contracts.has('upgradeablebeacon') ||
        contracts.has('implementation') ||
        text.includes('downstream')
      ) {
        downstream += weight;
      }
    });

    if (beaconAlerts === 0 && beaconProxies === 0 && downstream === 0) {
      return null;
    }

    const stages = [
      {
        key: 'control-plane',
        label: 'Beacon control plane',
        description: 'Compromised UpgradeableBeacon reprograms every attached proxy.',
        metric: Math.round(beaconAlerts * 10) / 10,
        color: '#5bd5ff'
      },
      {
        key: 'proxy-layer',
        label: 'Beacon proxies',
        description: 'Each BeaconProxy inherits the poisoned implementation address.',
        metric: Math.round(beaconProxies * 10) / 10,
        color: '#8c7bff'
      },
      {
        key: 'downstream-logic',
        label: 'Downstream logic',
        description: 'Runtime implementations execute attacker code against protocol inventory.',
        metric: Math.round(downstream * 10) / 10,
        color: '#f6c344'
      }
    ];

    const maxMetric = Math.max(...stages.map((stage) => stage.metric || 1));

    return stages.map((stage) => ({
      ...stage,
      weight: maxMetric === 0 ? 1 : Math.max(stage.metric / maxMetric, 0.25)
    }));
  }, [report]);

  if (!report) {
    return null;
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Alert
        type="warning"
        showIcon
        message="A compromised beacon can brick or reprogram every BeaconProxy depending on it. Model mitigations and watchdogs to contain blast radius."
      />
      <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
          Beacon blast radius
        </Typography.Title>
        {cascade ? (
          <div className="beacon-timeline">
            {cascade.map((stage, index) => (
              <div key={stage.key} className="beacon-timeline__item">
                <div className="beacon-timeline__rail">
                  <span
                    className="beacon-timeline__marker"
                    style={{ borderColor: stage.color, boxShadow: `0 0 12px ${stage.color}55` }}
                  >
                    <span style={{ background: stage.color }} />
                  </span>
                  {index < cascade.length - 1 ? (
                    <span
                      className="beacon-timeline__connector"
                      style={{ background: `linear-gradient(180deg, ${stage.color}50, transparent)` }}
                    />
                  ) : null}
                </div>
                <div
                  className="beacon-timeline__card"
                  style={{
                    borderColor: `${stage.color}55`,
                    boxShadow: `0 20px 45px rgba(10, 14, 24, 0.45), inset 0 0 0 1px ${stage.color}22`
                  }}
                >
                  <Typography.Text style={{ fontWeight: 700, color: stage.color, fontSize: 15 }}>
                    {stage.label}
                  </Typography.Text>
                  <Typography.Paragraph style={{ color: '#c8d1f5', margin: '10px 0 14px' }}>
                    {stage.description}
                  </Typography.Paragraph>
                  <Statistic
                    value={stage.metric}
                    precision={1}
                    suffix=" risk pts"
                    valueStyle={{ color: '#f4f7ff', fontSize: 22 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No beacon-linked findings in this report" />
        )}
      </Card>
      <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
          Mitigation playbook
        </Typography.Title>
        <Typography.Paragraph style={{ color: '#c8d1f5' }}>
          1. Treat beacons as single points of failure — wrap them in multi-sig governance and automated drift detection.<br />
          2. Monitor beacon return values; a non-contract return bricks dependants instantly.<br />
          3. Keep fallback implementations ready and practice rotations to minimize downtime.
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
