import { Card, Col, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { useReport } from '@/features/report/ReportProvider';

const slots = [
  { key: '_ADMIN_SLOT', label: 'EIP-1967 admin slot' },
  { key: '_IMPLEMENTATION_SLOT', label: 'EIP-1967 implementation slot' },
  { key: '_BEACON_SLOT', label: 'EIP-1967 beacon slot' }
];

export function SlotsPage() {
  const { report } = useReport();

  const insights = useMemo(() => {
    if (!report) return [] as Array<{ slot: string; severity: string; evidence: string[] }>;
    return slots.map((slot) => {
      const evidence = report.findings
        .filter((finding) => finding.details.description.includes(slot.key) || (finding.details.final_conclusion ?? '').includes(slot.key))
        .map((finding) => `${finding.details.severity}: ${finding.details.description}`);
      const severity = evidence.some((item) => item.startsWith('Critical'))
        ? 'Critical'
        : evidence.some((item) => item.startsWith('High'))
          ? 'High'
          : evidence.some((item) => item.startsWith('Medium'))
            ? 'Medium'
            : 'Low';
      return { slot: slot.label, severity, evidence };
    });
  }, [report]);

  if (!report) {
    return null;
  }

  return (
    <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
        EIP-1967 slot watchboard
      </Typography.Title>
      <Typography.Paragraph style={{ color: '#c8d1f5' }}>
        These slots decide who controls upgrades and which code executes. Monitor them like production infrastructure.
      </Typography.Paragraph>
      <Row gutter={[24, 24]}>
        {insights.map((item) => (
          <Col xs={24} md={8} key={item.slot}>
            <Card style={{ background: '#1b212e', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Tag color={severityColor[item.severity]}>{item.severity}</Tag>
                <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{item.slot}</Typography.Text>
                <Statistic
                  title={<Typography.Text style={{ color: '#768196' }}>Observations</Typography.Text>}
                  value={item.evidence.length}
                  valueStyle={{ color: '#f4f7ff' }}
                />
                <List
                  size="small"
                  dataSource={item.evidence}
                  renderItem={(evidence) => (
                    <List.Item style={{ background: 'transparent', paddingInline: 0 }}>
                      <Typography.Text style={{ color: '#c8d1f5', fontSize: 12 }}>{evidence}</Typography.Text>
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

const severityColor: Record<string, string> = {
  Critical: '#ff5c5c',
  High: '#ff955c',
  Medium: '#f6c344',
  Low: '#4cd6a5'
};
