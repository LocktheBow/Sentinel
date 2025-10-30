import { Drawer, Space, Tag, Typography, Divider, List, Descriptions } from 'antd';
import type { Finding } from '@types/report';
import { DangerousContentGuard } from './DangerousContentGuard';

export type EvidenceDrawerProps = {
  open: boolean;
  finding?: Finding;
  onClose: () => void;
};

const severityColor: Record<string, string> = {
  Critical: '#ff5c5c',
  High: '#ff955c',
  Medium: '#f6c344',
  Low: '#4cd6a5',
  Info: '#6c8cff',
  'N/A': '#768196'
};

function formatScenario(scenario?: string) {
  if (!scenario) return [] as string[];
  const steps = scenario
    .split(/\d+\)\s*/)
    .map((step) => step.trim())
    .filter(Boolean);
  if (steps.length > 0) {
    return steps;
  }
  return scenario
    .split(/\n|\r|-/)
    .map((step) => step.trim())
    .filter(Boolean);
}

export function EvidenceDrawer({ open, finding, onClose }: EvidenceDrawerProps) {
  if (!finding) {
    return <Drawer open={open} onClose={onClose} width={520} title="Evidence" destroyOnClose />;
  }

  const details = finding.details;
  const steps = formatScenario(details.attack_scenario);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      styles={{ body: { background: '#141823' } }}
      title={
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={8} align="center">
            <Tag color={severityColor[details.severity] ?? '#5bd5ff'}>{details.severity}</Tag>
            <Typography.Text style={{ color: '#c8d1f5' }}>{finding.source}</Typography.Text>
          </Space>
          <Typography.Title level={4} style={{ margin: 0, color: '#f4f7ff' }}>
            {details.description}
          </Typography.Title>
        </Space>
      }
      destroyOnClose
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {details.final_conclusion ? (
          <section>
            <Typography.Title level={5} style={{ color: '#f4f7ff' }}>
              Final conclusion
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#d7defc' }}>
              {details.final_conclusion}
            </Typography.Paragraph>
          </section>
        ) : null}

        {steps.length ? (
          <section>
            <Typography.Title level={5} style={{ color: '#f4f7ff' }}>
              Attack surface storyboard
            </Typography.Title>
            <List
              dataSource={steps}
              renderItem={(item, index) => (
                <List.Item style={{ paddingInline: 0, color: '#d7defc' }}>
                  <Space align="start" size={12}>
                    <Tag color="#5bd5ff">{index + 1}</Tag>
                    <Typography.Paragraph style={{ margin: 0 }}>{item}</Typography.Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          </section>
        ) : null}

        {details.blue_team_argument ? (
          <section>
            <Typography.Title level={5} style={{ color: '#f4f7ff' }}>
              Blue team narrative
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#87f0c4' }}>
              {details.blue_team_argument}
            </Typography.Paragraph>
          </section>
        ) : null}

        {details.red_team_argument ? (
          <section>
            <DangerousContentGuard text={details.red_team_argument} />
          </section>
        ) : null}

        {details.economic_impact ? (
          <section>
            <Typography.Title level={5} style={{ color: '#f4f7ff' }}>
              Economic impact
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#f6c344' }}>
              {details.economic_impact}
            </Typography.Paragraph>
          </section>
        ) : null}

        <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <Descriptions
          column={1}
          labelStyle={{ color: '#768196' }}
          contentStyle={{ color: '#d7defc' }}
        >
          {details.contracts_involved?.length ? (
            <Descriptions.Item label="Contracts">
              <Space wrap>{details.contracts_involved.map((contract) => <Tag key={contract}>{contract}</Tag>)}</Space>
            </Descriptions.Item>
          ) : null}
          {details.line_numbers?.length ? (
            <Descriptions.Item label="Line numbers">
              <Typography.Text>{details.line_numbers.join(', ')}</Typography.Text>
            </Descriptions.Item>
          ) : null}
          {details.chained_findings?.length ? (
            <Descriptions.Item label="Chained findings">
              <List
                dataSource={details.chained_findings}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          ) : null}
        </Descriptions>
      </Space>
    </Drawer>
  );
}
