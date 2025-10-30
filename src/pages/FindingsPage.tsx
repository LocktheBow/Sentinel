import { Card, Col, Empty, List, Row, Select, Space, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { SheetComponent } from '@antv/s2-react';
import type { S2Options } from '@antv/s2';
import { useReport } from '@/features/report/ReportProvider';
import { severityOrder } from '@lib/metrics';
import { DangerousContentGuard, EvidenceDrawer } from '@components/index';
import type { Finding } from '@types/report';
import '@antv/s2-react/dist/s2-react.min.css';

export function FindingsPage() {
  const { report } = useReport();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [drawerFinding, setDrawerFinding] = useState<Finding | undefined>();

  const pivotData = useMemo(() => {
    if (!report) return { dataCfg: undefined, options: undefined, sources: [] as string[] };

    const sources = Array.from(new Set(report.findings.map((finding) => finding.source)));

    const dataCfg = {
      fields: {
        rows: ['severity'],
        columns: ['source'],
        values: ['count'],
        valueInCols: true
      },
      meta: [
        { field: 'severity', name: 'Severity' },
        { field: 'source', name: 'Source' },
        { field: 'count', name: 'Count' }
      ],
      data: report.findings.map((finding) => ({
        severity: finding.details.severity,
        source: finding.source,
        count: 1
      }))
    };

    const options: S2Options = {
      width: 760,
      height: 320,
      totals: {
        row: {
          showGrandTotals: true
        },
        col: {
          showGrandTotals: true
        }
      },
      style: {
        cellCfg: {
          height: 48
        }
      }
    };

    return { dataCfg, options, sources };
  }, [report]);

  const filteredFindings = useMemo(() => {
    if (!report) return [] as Finding[];
    return report.findings.filter((finding) => {
      const severityMatch = selectedSeverity === 'All' || finding.details.severity === selectedSeverity;
      const sourceMatch = selectedSource === 'All' || finding.source === selectedSource;
      return severityMatch && sourceMatch;
    });
  }, [report, selectedSeverity, selectedSource]);

  if (!report || !pivotData.dataCfg || !pivotData.options) {
    return <Empty description="No findings" />;
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }} bodyStyle={{ padding: 16 }}>
        <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
          Severity × Source matrix
        </Typography.Title>
        <SheetComponent sheetType="pivot" dataCfg={pivotData.dataCfg} options={pivotData.options} adaptive />
      </Card>

      <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Typography.Text style={{ color: '#c8d1f5' }}>Filter by severity</Typography.Text>
            <Select
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              style={{ width: '100%', marginTop: 8 }}
              options={[{ value: 'All', label: 'All severities' }, ...severityOrder.map((sev) => ({ value: sev, label: sev }))]}
            />
          </Col>
          <Col xs={24} md={8}>
            <Typography.Text style={{ color: '#c8d1f5' }}>Filter by source</Typography.Text>
            <Select
              value={selectedSource}
              onChange={setSelectedSource}
              style={{ width: '100%', marginTop: 8 }}
              options={[{ value: 'All', label: 'All sources' }, ...pivotData.sources.map((source) => ({ value: source, label: source }))]}
            />
          </Col>
        </Row>
        <List
          style={{ marginTop: 24 }}
          dataSource={filteredFindings}
          renderItem={(finding) => (
            <List.Item>
              <Card
                style={{ background: '#1b212e', border: '1px solid rgba(255,255,255,0.05)', width: '100%' }}
                onClick={() => setDrawerFinding(finding)}
                hoverable
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Space size={12} align="center">
                    <Tag color={severityColorMap[finding.details.severity]}>{finding.details.severity}</Tag>
                    <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{finding.source}</Typography.Text>
                  </Space>
                  <Typography.Text style={{ color: '#c8d1f5' }}>{finding.details.description}</Typography.Text>
                  {finding.details.blue_team_argument ? (
                    <Typography.Paragraph style={{ color: '#87f0c4', margin: 0 }}>
                      {finding.details.blue_team_argument}
                    </Typography.Paragraph>
                  ) : null}
                  {finding.details.red_team_argument ? (
                    <DangerousContentGuard text={finding.details.red_team_argument} heading={null} />
                  ) : null}
                </Space>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <EvidenceDrawer open={Boolean(drawerFinding)} finding={drawerFinding} onClose={() => setDrawerFinding(undefined)} />
    </Space>
  );
}

const severityColorMap: Record<string, string> = {
  Critical: '#ff5c5c',
  High: '#ff955c',
  Medium: '#f6c344',
  Low: '#4cd6a5',
  Info: '#6c8cff',
  'N/A': '#768196'
};
