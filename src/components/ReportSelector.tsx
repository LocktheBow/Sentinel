import { Select, Space, Tag, Typography } from 'antd';
import { useReport } from '@/features/report/ReportProvider';
import { reportCatalog, type ReportId } from '@data/reportCatalog';

export function ReportSelector() {
  const { reportId, setReportId, descriptor, isLoading } = useReport();

  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Typography.Text style={{ color: '#768196', fontSize: 12, letterSpacing: 1 }}>
        Active dataset
      </Typography.Text>
      <Select<ReportId>
        value={reportId}
        loading={isLoading}
        onChange={setReportId}
        style={{ width: '100%' }}
        options={reportCatalog.map((report) => ({
          value: report.id,
          label: report.shortName ?? report.name
        }))}
      />
      <Typography.Text style={{ color: '#8fa3d9', fontSize: 12 }}>
        {descriptor.chain}
      </Typography.Text>
      <Tag color="blue" style={{ borderRadius: 12, width: 'fit-content' }}>
        {descriptor.category}
      </Tag>
    </Space>
  );
}
