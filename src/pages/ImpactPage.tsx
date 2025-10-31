import { Alert, Card, Col, Row, Typography } from 'antd';
import { useMemo } from 'react';
import { ParetoChart } from '@components/ParetoChart';
import { RemediationImpact } from '@components/RemediationImpact';
import { countBySeverity } from '@lib/metrics';
import { useReport } from '@/features/report/ReportProvider';

export function ImpactPage() {
  const { report, descriptor } = useReport();

  const remediationModel = useMemo(() => {
    if (!report) return null;
    const counts = countBySeverity(report);
    const totalRisk = counts.Critical * 40 + counts.High * 20 + counts.Medium * 10 + counts.Low * 5;
    const steps = [
      {
        key: 'mixed-patterns',
        label: 'Ban Transparent + UUPS mixing',
        delta: Math.round(counts.Critical * 30 + counts.High * 10),
        description: 'Blocking role-confused upgrades kills the fastest takeover chain.'
      },
      {
        key: 'initializer-discipline',
        label: 'Initializer discipline',
        delta: Math.round(counts.High * 8 + counts.Medium * 5),
        description:
          'Explicit initializers stop msg.sender drift and runtime governance bypass.'
      },
      {
        key: 'selector-ci',
        label: 'Selector collision CI',
        delta: Math.round(counts.Medium * 6 + counts.Low * 3),
        description: 'CI guardrails catch admin-selector reuse before deployment.'
      },
      {
        key: 'runbooks',
        label: 'Upgrade runbooks & monitoring',
        delta: Math.round(counts.Low * 4),
        description: 'Operational hygiene keeps admins from bricking or leaking value mid-upgrade.'
      }
    ];

    const totalDelta = steps.reduce((sum, step) => sum + step.delta, 0);
    const residual = Math.max(totalRisk - totalDelta, Math.round(totalRisk * 0.2));

    return {
      totalRisk,
      residualRisk: residual,
      steps
    };
  }, [report]);

  if (!report || !remediationModel) {
    return null;
  }

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} xl={12}>
        <Card
          style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)', overflow: 'visible' }}
        >
          <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
            Loss model Pareto — {descriptor.shortName ?? descriptor.name}
          </Typography.Title>
          <Typography.Paragraph style={{ color: '#c8d1f5' }}>
            Bars show the most damaging capabilities TRM realised against {descriptor.shortName ?? descriptor.name}; the line
            tracks cumulative mitigation coverage as you land the listed controls.
          </Typography.Paragraph>
          <div style={{ background: '#141823', padding: '4px 0 16px', borderRadius: 12 }}>
            <ParetoChart report={report} />
          </div>
        </Card>
      </Col>
      <Col xs={24} xl={12}>
        <Card
          style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)', overflow: 'visible' }}
        >
          <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
            Remediation vs residual risk
          </Typography.Title>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Stacked timeline shows how week-one mitigations burn down architectural risk. Residual coverage holds until migration and monitoring mature."
          />
          <RemediationImpact
            totalRisk={remediationModel.totalRisk}
            residualRisk={remediationModel.residualRisk}
            steps={remediationModel.steps}
          />
        </Card>
      </Col>
    </Row>
  );
}
