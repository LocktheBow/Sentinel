import { Card, Space, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { countBySeverity, severityOrder } from '@lib/metrics';
import type { AuditReport, Severity } from '@types/report';
import type { ReportDescriptor } from '@data/reportCatalog';

type ReportSummaryCardProps = {
  report: AuditReport;
  descriptor: ReportDescriptor;
};

const severityPalette: Record<Severity, string> = {
  Critical: '#ff5c5c',
  High: '#ff955c',
  Medium: '#f6c344',
  Low: '#4cd6a5',
  Info: '#6c8cff',
  'N/A': '#768196'
};

export function ReportSummaryCard({ report, descriptor }: ReportSummaryCardProps) {
  const generatedAt = report.meta?.generated_at;
  const generatedAtDisplay =
    typeof generatedAt === 'number'
      ? dayjs.unix(generatedAt).format('YYYY-MM-DD HH:mm:ss ZZ')
      : '—';

  const fileCount = report.meta?.files?.length ?? 0;
  const severityCounts = countBySeverity(report);
  const nonZeroSeverities = severityOrder.filter((severity) => severityCounts[severity] > 0);

  return (
    <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography.Title level={4} style={{ color: '#f4f7ff', marginBottom: 8 }}>
        {descriptor.name}
      </Typography.Title>
      <Typography.Paragraph style={{ color: '#c8d1f5', marginBottom: 24 }}>
        {descriptor.summary}
      </Typography.Paragraph>
      <Space size={8} wrap style={{ marginBottom: 16 }}>
        <Tag color="geekblue">{descriptor.chain}</Tag>
        <Tag color="cyan">{descriptor.category}</Tag>
      </Space>
      <Space size={24} wrap style={{ width: '100%' }}>
        <Statistic
          title="Security score"
          value={report.security_score}
          valueStyle={{ color: '#f6c344', fontSize: 28 }}
        />
        <Statistic
          title="Findings analyzed"
          value={report.findings.length}
          valueStyle={{ color: '#f4f7ff' }}
        />
        <Statistic
          title="Contracts referenced"
          value={fileCount}
          valueStyle={{ color: '#5bd5ff' }}
        />
      </Space>
      <Space direction="vertical" size={12} style={{ marginTop: 24, width: '100%' }}>
        <Typography.Text style={{ color: '#c8d1f5' }}>
          Generated at: <Typography.Text style={{ color: '#f4f7ff' }}>{generatedAtDisplay}</Typography.Text>
        </Typography.Text>
        <Typography.Text style={{ color: '#c8d1f5' }}>
          Project root: <Typography.Text style={{ color: '#f4f7ff' }}>{report.meta?.project_root ?? '—'}</Typography.Text>
        </Typography.Text>
        {nonZeroSeverities.length ? (
          <Space size={8} wrap>
            {nonZeroSeverities.map((severity) => (
              <Tag
                key={severity}
                style={{ background: `${severityPalette[severity]}33`, color: severityPalette[severity], border: 'none' }}
              >
                {severity} × {severityCounts[severity]}
              </Tag>
            ))}
          </Space>
        ) : null}
      </Space>
    </Card>
  );
}
