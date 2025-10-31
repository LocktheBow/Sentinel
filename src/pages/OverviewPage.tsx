import { Alert, Card, Col, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ReportSummaryCard } from '@components/ReportSummaryCard';
import { useReport } from '@/features/report/ReportProvider';
import { countBySeverity, severityOrder } from '@lib/metrics';
import { computeSelectorCollisions } from '@lib/selectorDiff';
import { buildUpgradeMatrix, proxyHasUnexpectedPaths } from '@lib/upgradeMatrix';

const postureScale = {
  Critical: { label: 'Severe', value: 0.92 },
  High: { label: 'High', value: 0.78 },
  Medium: { label: 'Elevated', value: 0.6 },
  Low: { label: 'Guarded', value: 0.4 },
  Info: { label: 'Informed', value: 0.28 },
  'N/A': { label: 'Baseline', value: 0.18 }
};

type PostureKey = keyof typeof postureScale;

const checklistDefinitions = [
  {
    key: 'ban-mixed-patterns',
    title: 'Ban Transparent + UUPS mixing',
    description: 'Ensure TransparentUpgradeableProxy never forwards to UUPS-style upgrade endpoints.',
    keywords: ['transparent', 'uups', 'unauthorized upgrade']
  },
  {
    key: 'explicit-initializers',
    title: 'Initialize with explicit addresses (no msg.sender drift)',
    description: 'Deploy scripts must pass admin/owner explicitly to avoid ownership drift during initialization.',
    keywords: ['msg.sender', 'initializer', 'owner drift']
  },
  {
    key: 'forbid-self-admin',
    title: 'Forbid changeAdmin(proxy == newAdmin)',
    description: 'Block admin self-assignment patterns that can brick upgrades forever.',
    keywords: ['changeadmin', 'address(this)', '_admin_slot']
  },
  {
    key: 'zero-msg-value',
    title: 'Default msg.value == 0 for upgradeToAndCall',
    description: 'Upgrades must sweep funds or forbid value to avoid stuck ETH during migrations.',
    keywords: ['msg.value', 'stuck', 'ETH sink']
  },
  {
    key: 'selector-ci',
    title: 'Selector-collision CI check',
    description: 'Validate 4-byte selectors from implementations against Transparent proxy admin surface.',
    keywords: ['selector', 'collision']
  }
];

type ChecklistStatus = 'at-risk' | 'watching' | 'clear';

const statusColor: Record<ChecklistStatus, string> = {
  'at-risk': '#ff5c5c',
  watching: '#f6c344',
  clear: '#4cd6a5'
};

export function OverviewPage() {
  const { report, isLoading, error, descriptor } = useReport();

  const posture = useMemo(() => {
    if (!report) return null;
    const counts = countBySeverity(report);
    const worst = severityOrder.find((sev) => counts[sev] > 0) as PostureKey | undefined;
    const current = worst ? postureScale[worst] : postureScale.Low;
    const target: { label: string; value: number } =
      worst && worst === 'Critical'
        ? { label: 'Moderate', value: 0.5 }
        : worst && worst === 'High'
          ? { label: 'Guarded', value: 0.38 }
          : { label: 'Moderate', value: 0.45 };
    return { current, target, counts };
  }, [report]);

  const collisions = useMemo(() => (report ? computeSelectorCollisions(report) : []), [report]);

  const checklist = useMemo(() => {
    if (!report) return [];

    const textBundle = report.findings
      .map((finding) =>
        [
          finding.details.description,
          finding.details.final_conclusion,
          finding.details.red_team_argument,
          finding.details.blue_team_argument
        ]
          .filter(Boolean)
          .join(' ')
      )
      .join(' ')
      .toLowerCase();

    const proxyIssues = report ? buildUpgradeMatrix(report).some(proxyHasUnexpectedPaths) : false;

    return checklistDefinitions.map((item) => {
      let matched = false;
      switch (item.key) {
        case 'selector-ci':
          matched = collisions.length > 0 || textBundle.includes('selector clash');
          break;
        case 'ban-mixed-patterns':
          matched = collisions.length > 0 || (textBundle.includes('transparent') && textBundle.includes('uups'));
          break;
        case 'explicit-initializers':
          matched = /msg\.sender/.test(textBundle) && /initializer/.test(textBundle);
          break;
        case 'forbid-self-admin':
          matched = /changeadmin/.test(textBundle) || /address\(this\)/.test(textBundle) || /_admin_slot/.test(textBundle);
          break;
        case 'zero-msg-value':
          matched = textBundle.includes('msg.value') && textBundle.includes('upgrade');
          break;
        default:
          matched = proxyIssues;
      }

      const status: ChecklistStatus = matched ? 'at-risk' : proxyIssues ? 'watching' : 'clear';
      return { ...item, status };
    });
  }, [report, collisions]);

  if (isLoading && !report) {
    return (
      <Space align="center" style={{ width: '100%', minHeight: '60vh', justifyContent: 'center' }}>
        <Spin size="large" />
      </Space>
    );
  }

  if (error) {
    return <Alert type="error" message={error.message} showIcon />;
  }

  if (!report || !posture) {
    return null;
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={3} style={{ color: '#f4f7ff', marginBottom: 4 }}>
              Risk posture
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#c8d1f5', marginBottom: 24 }}>
              {descriptor.shortName ?? descriptor.name} currently carries a <strong>{posture.current.label}</strong> posture.
              TRM-backed mitigations target a <strong>{posture.target.label}</strong> posture by hardening upgrade flows
              and removing selector-collision footguns that surfaced during recursive analysis.
            </Typography.Paragraph>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <PostureGauge title="Current" color="#ff5c5c" value={posture.current.value} label={posture.current.label} />
              </Col>
              <Col xs={24} md={12}>
                <PostureGauge title="Post remediation" color="#4cd6a5" value={posture.target.value} label={posture.target.label} />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <ReportSummaryCard report={report} descriptor={descriptor} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              What to do this week
            </Typography.Title>
            <List
              dataSource={checklist}
              renderItem={(item) => (
                <List.Item style={{ alignItems: 'flex-start' }}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space size={12} align="center">
                      <Tag color={statusColor[item.status]}>
                        {item.status === 'at-risk' ? 'At risk' : item.status === 'watching' ? 'Watching' : 'On track'}
                      </Tag>
                      <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{item.title}</Typography.Text>
                    </Space>
                    <Typography.Paragraph style={{ color: '#c8d1f5', margin: 0 }}>
                      {item.description}
                    </Typography.Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Severity spread
            </Typography.Title>
            <Row gutter={[16, 16]}>
              {severityOrder.map((severity) => (
                <Col span={12} key={severity}>
                  <Statistic
                    title={<Typography.Text style={{ color: '#768196' }}>{severity}</Typography.Text>}
                    value={posture.counts[severity]}
                    valueStyle={{ color: '#f4f7ff', fontSize: 28 }}
                  />
                </Col>
              ))}
            </Row>
            <Alert
              style={{ marginTop: 24 }}
              showIcon
              type="warning"
              message="Critical risk stems from Transparent + UUPS mixing and governance bypass. Fix these first to collapse cascading findings."
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Sentinel portal rollout
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#c8d1f5' }}>
              Every section of the Sentinel cockpit is wired to the TRM findings for {descriptor.shortName ?? descriptor.name}.
              Use the quick links below to jump between artefacts.
            </Typography.Paragraph>
            <List
              dataSource={descriptor.todo}
              renderItem={(task) => (
                <List.Item>
                  <Space align="center" size={12} style={{ width: '100%' }}>
                    <Tag color={task.done ? '#4cd6a5' : '#f6c344'}>{task.done ? 'Done' : 'Review'}</Tag>
                    <Link to={task.route} style={{ color: '#f4f7ff' }}>
                      {task.label}
                    </Link>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function PostureGauge({
  title,
  label,
  value,
  color
}: {
  title: string;
  label: string;
  value: number;
  color: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const percentage = Math.round(clamped * 100);
  const progressDeg = clamped * 360;
  const gradient = `conic-gradient(${color} ${progressDeg}deg, rgba(91, 213, 255, 0.12) ${progressDeg}deg 360deg)`;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Text style={{ color: '#768196', textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography.Text>
      <div className="risk-gauge">
        <div className="risk-gauge__ring" style={{ background: gradient }}>
          <div className="risk-gauge__center">
            <Typography.Text style={{ color: '#768196', textTransform: 'uppercase', fontSize: 12 }}>
              {label}
            </Typography.Text>
            <Typography.Text style={{ color: '#f4f7ff', fontSize: 32, fontWeight: 700 }}>
              {percentage}%
            </Typography.Text>
          </div>
        </div>
      </div>
    </Space>
  );
}
