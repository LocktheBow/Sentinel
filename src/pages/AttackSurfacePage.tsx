import { Alert, Card, Col, Row, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { AttackGraph, EvidenceDrawer } from '@components/index';
import { useReport } from '@/features/report/ReportProvider';
import { sortFindingsBySeverity } from '@lib/metrics';
import type { Finding } from '@types/report';

export function AttackSurfacePage() {
  const { report } = useReport();
  const [selectedFinding, setSelectedFinding] = useState<Finding | undefined>();

  const orderedFindings = useMemo(() => (report ? sortFindingsBySeverity(report.findings) : []), [report]);

  if (!report) {
    return null;
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Alert
        message="Click any node to open evidence. Scroll or use the +/− buttons to zoom, and drag to pan the attack surface map."
        type="info"
        showIcon
      />
      <AttackGraph
        report={report}
        onSelect={(finding) => {
          setSelectedFinding(finding);
        }}
      />
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Critical chains
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#c8d1f5' }}>
              These findings link Transparent forwarding, UUPS exposures, and governance bypass into end-to-end attack
              paths. Treat every element as part of the same dragon.
            </Typography.Paragraph>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {orderedFindings.map((finding) => (
                <Card
                  key={finding.details.description}
                  size="small"
                  style={{ background: '#1b212e', border: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => setSelectedFinding(finding)}
                  hoverable
                >
                  <Space direction="vertical" size={4}>
                    <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>
                      {finding.details.severity} · {finding.details.description}
                    </Typography.Text>
                    <Typography.Text style={{ color: '#8fa3d9' }}>
                      {finding.details.final_conclusion ?? finding.details.description}
                    </Typography.Text>
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
              Attack surface legend
            </Typography.Title>
            <Typography.Paragraph style={{ color: '#c8d1f5' }}>
              Colors map to severity: red = critical, amber = high, gold = medium, teal = low. Edge flow is left-to-right,
              following the attack storyboard from precondition to business impact.
            </Typography.Paragraph>
            <Typography.Paragraph style={{ color: '#c8d1f5' }}>
              Nodes in grey are virtual nodes derived from chained findings where evidence lives elsewhere in the report.
              Click through to see which root finding they expand from.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
      <EvidenceDrawer open={Boolean(selectedFinding)} finding={selectedFinding} onClose={() => setSelectedFinding(undefined)} />
    </Space>
  );
}
