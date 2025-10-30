import { Space, Typography } from 'antd';

type RemediationStep = {
  key: string;
  label: string;
  delta: number;
  description: string;
};

type RemediationImpactProps = {
  totalRisk: number;
  residualRisk: number;
  steps: RemediationStep[];
};

export function RemediationImpact({ totalRisk, residualRisk, steps }: RemediationImpactProps) {
  const reductions = steps.reduce((sum, step) => sum + Math.max(0, step.delta), 0);
  const scale = totalRisk || 1;

  return (
    <Space direction="vertical" size={20} style={{ width: '100%', overflow: 'visible' }}>
      <div className="remediation-track">
        <div
          className="remediation-track__segment remediation-track__segment--current"
          style={{ flexGrow: Math.max(scale, 1) }}
        >
          <span className="remediation-track__title">Current risk</span>
          <strong>{totalRisk}</strong>
        </div>
        {steps.map((step) => (
          <div
            key={step.key}
            className="remediation-track__segment remediation-track__segment--action"
            style={{ flexGrow: Math.max(step.delta, 0.5) }}
          >
            <span className="remediation-track__title">{step.label}</span>
            <strong>-{step.delta}</strong>
          </div>
        ))}
        <div
          className="remediation-track__segment remediation-track__segment--residual"
          style={{ flexGrow: Math.max(residualRisk, 1) }}
        >
          <span className="remediation-track__title">Residual</span>
          <strong>{Math.max(residualRisk, 0)}</strong>
        </div>
      </div>
      <div className="remediation-track__legend">
        <Typography.Text style={{ color: '#c8d1f5' }}>
          Total risk reduction:{' '}
          <Typography.Text style={{ color: '#4cd6a5', fontWeight: 600 }}>
            -{Math.round(reductions * 10) / 10}
          </Typography.Text>
        </Typography.Text>
        <Typography.Text style={{ color: '#c8d1f5' }}>
          Residual benchmark:{' '}
          <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>
            {Math.max(residualRisk, 0)}
          </Typography.Text>
        </Typography.Text>
      </div>
      <div className="remediation-step-list">
        {steps.map((step) => (
          <div key={`${step.key}-detail`} className="remediation-step">
            <div className="remediation-step__badge">-{step.delta}</div>
            <div className="remediation-step__content">
              <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>
                {step.label}
              </Typography.Text>
              <Typography.Paragraph style={{ color: '#c8d1f5', margin: 0 }}>
                {step.description}
              </Typography.Paragraph>
            </div>
          </div>
        ))}
      </div>
    </Space>
  );
}
