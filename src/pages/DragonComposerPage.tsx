import { Card, Checkbox, Col, Row, Slider, Space, Statistic, Steps, Typography } from 'antd';
import { useMemo, useState } from 'react';

const defaultFlags = {
  transparentUups: true,
  weakAuth: true,
  proxyAdminMismatch: true,
  selfAdmin: false,
  msgSenderDrift: true,
  valueDuringUpgrade: false
};

type FlagKey = keyof typeof defaultFlags;

const flagDefinitions: Array<{ key: FlagKey; label: string; help: string }> = [
  {
    key: 'transparentUups',
    label: 'Transparent proxy forwards to UUPS functions',
    help: 'Transparent proxies forward non-admin calls. If the implementation exposes UUPS upgrade functions, callers can reach them.'
  },
  {
    key: 'weakAuth',
    label: 'authorizeUpgrade is weak or miswired',
    help: 'Missing onlyProxy or misconfigured authorizeUpgrade lets any forwarded call upgrade logic.'
  },
  {
    key: 'proxyAdminMismatch',
    label: 'ProxyAdmin is not the runtime admin',
    help: 'Governance bypass: ProxyAdmin scripts succeed even when an attacker already replaced admin.'
  },
  {
    key: 'selfAdmin',
    label: 'Implementation can set admin to address(this)',
    help: 'Self-assignment bricks Transparent admin operations by trapping fallback.'
  },
  {
    key: 'msgSenderDrift',
    label: 'Initializer uses msg.sender as owner',
    help: 'Deploy scripts accidentally set ProxyAdmin as runtime owner, merging control planes.'
  },
  {
    key: 'valueDuringUpgrade',
    label: 'upgradeToAndCall carries value',
    help: 'ETH sent during upgrades can be trapped at the proxy without a sweep path.'
  }
];

export function DragonComposerPage() {
  const [flags, setFlags] = useState(defaultFlags);
  const [tvl, setTvl] = useState(250); // millions
  const [exposure, setExposure] = useState(80); // percent of TVL reachable
  const [detectionLatency, setDetectionLatency] = useState(36); // hours

  const metrics = useMemo(() => computeImpact(flags, tvl, exposure, detectionLatency), [flags, tvl, exposure, detectionLatency]);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Misconfiguration toggles
            </Typography.Title>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {flagDefinitions.map((flag) => (
                <Card
                  key={flag.key}
                  size="small"
                  style={{ background: '#1b212e', border: '1px solid rgba(255,255,255,0.05)' }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <Checkbox
                    checked={flags[flag.key]}
                    onChange={(event) => setFlags((prev) => ({ ...prev, [flag.key]: event.target.checked }))}
                  >
                    <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{flag.label}</Typography.Text>
                  </Checkbox>
                  <Typography.Paragraph style={{ color: '#8fa3d9', margin: 0 }}>{flag.help}</Typography.Paragraph>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Scenario sliders
            </Typography.Title>
            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <div>
                <Typography.Text style={{ color: '#c8d1f5' }}>Total value locked (USD millions)</Typography.Text>
                <Slider min={50} max={1000} value={tvl} onChange={(value) => setTvl(Array.isArray(value) ? value[0] : value)} tooltip={{ formatter: (v) => `$${v}M` }} />
              </div>
              <div>
                <Typography.Text style={{ color: '#c8d1f5' }}>Exposed portion of TVL (%)</Typography.Text>
                <Slider min={0} max={100} value={exposure} onChange={(value) => setExposure(Array.isArray(value) ? value[0] : value)} tooltip={{ formatter: (v) => `${v}%` }} />
              </div>
              <div>
                <Typography.Text style={{ color: '#c8d1f5' }}>Detection latency (hours)</Typography.Text>
                <Slider min={1} max={168} value={detectionLatency} onChange={(value) => setDetectionLatency(Array.isArray(value) ? value[0] : value)} tooltip={{ formatter: (v) => `${v}h` }} />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Economic impact bands
            </Typography.Title>
            <Space size={24} wrap>
              <Statistic
                title={<Typography.Text style={{ color: '#768196' }}>Most likely loss</Typography.Text>}
                value={`$${metrics.mostLikelyLoss.toLocaleString()}M`}
                valueStyle={{ color: '#f6c344', fontSize: 28 }}
              />
              <Statistic
                title={<Typography.Text style={{ color: '#768196' }}>Worst-case loss</Typography.Text>}
                value={`$${metrics.worstCaseLoss.toLocaleString()}M`}
                valueStyle={{ color: '#ff5c5c', fontSize: 28 }}
              />
              <Statistic
                title={<Typography.Text style={{ color: '#768196' }}>Stuck funds</Typography.Text>}
                value={`$${metrics.stuckFunds.toLocaleString()}M`}
                valueStyle={{ color: '#8c7bff', fontSize: 28 }}
              />
            </Space>
            <Typography.Paragraph style={{ color: '#c8d1f5', marginTop: 24 }}>
              Unauthorized upgrade paths combined with governance misalignment expose {metrics.exposedValue.toLocaleString()}M of TVL.
              Bricking the admin or trapping value during upgrades makes redeployment costs non-trivial even when assets are not stolen.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Storyboard (defensive simulation)
            </Typography.Title>
            <Steps
              direction="vertical"
              current={metrics.highlightIndex}
              items={metrics.steps.map((step) => ({
                title: step.title,
                description: step.description,
                status: step.active ? 'process' : 'wait'
              }))}
            />
            <Typography.Paragraph style={{ color: '#768196', marginTop: 16 }}>
              Educational only. No exploit code is generated or stored. Each step maps to a finding in the report with
              recommended controls.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

type ComposerMetrics = {
  mostLikelyLoss: number;
  worstCaseLoss: number;
  stuckFunds: number;
  exposedValue: number;
  highlightIndex: number;
  steps: Array<{ title: string; description: string; active: boolean }>;
};

function computeImpact(flags: typeof defaultFlags, tvl: number, exposurePercent: number, detectionLatency: number): ComposerMetrics {
  const exposedValue = (tvl * exposurePercent) / 100;
  const detectionFactor = Math.min(1, detectionLatency / 72);

  const unauthorizedUpgrade = flags.transparentUups && flags.weakAuth;
  const governanceBypass = flags.proxyAdminMismatch || flags.msgSenderDrift;
  const brickingRisk = flags.selfAdmin;
  const stuckFunds = flags.valueDuringUpgrade ? Number((exposedValue * 0.05).toFixed(2)) : 0;

  const mostLikelyLoss = Number(
    (
      exposedValue *
      (unauthorizedUpgrade ? 0.6 : 0.15) *
      (governanceBypass ? 1 : 0.7) *
      detectionFactor
    ).toFixed(2)
  );

  const worstCaseLoss = Number(
    (
      exposedValue * (unauthorizedUpgrade ? 1 : 0.25) +
      (brickingRisk ? exposedValue * 0.4 : 0) +
      stuckFunds
    ).toFixed(2)
  );

  const steps = [
    {
      title: 'Surface',
      description: 'Transparent proxy forwards non-admin calls to implementation exposing UUPS upgrade endpoints.',
      active: flags.transparentUups
    },
    {
      title: 'Trigger',
      description: 'Weak or miswired authorizeUpgrade lets a forwarded call swap in malicious logic.',
      active: unauthorizedUpgrade
    },
    {
      title: 'Escalation',
      description: 'Malicious logic rewrites EIP-1967 slots, seizing admin or pointing to hostile code.',
      active: governanceBypass
    },
    {
      title: 'Fallout',
      description: 'Admin is set to address(this) or owner drifts, bricking legitimate upgrades and controls.',
      active: brickingRisk || flags.msgSenderDrift
    },
    {
      title: 'Economic impact',
      description: 'TVL at risk plus migration and downtime costs triggered by trapped funds or halted upgrades.',
      active: unauthorizedUpgrade || brickingRisk || stuckFunds > 0
    }
  ];

  const highlightIndex = steps.findIndex((step) => step.active) === -1 ? 0 : steps.findIndex((step) => step.active);

  return {
    mostLikelyLoss,
    worstCaseLoss,
    stuckFunds,
    exposedValue: Number(exposedValue.toFixed(2)),
    highlightIndex,
    steps
  };
}
