import { Alert, Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import { useReport } from '@/features/report/ReportProvider';
import { buildUpgradeMatrix, type UpgradeMatrixCell, proxyHasUnexpectedPaths } from '@lib/upgradeMatrix';

export function UpgradeMatrixPage() {
  const { report } = useReport();

  const dataSource = useMemo(() => {
    if (!report) return [];
    return buildUpgradeMatrix(report).map((row) => ({
      key: row.proxy,
      proxy: row.proxy,
      proxyAdmin: row.cells.proxyAdmin,
      implementation: row.cells.implementation,
      beacon: row.cells.beacon,
      attention: proxyHasUnexpectedPaths(row)
    }));
  }, [report]);

  if (!report) {
    return null;
  }

  const columns: ColumnsType<(typeof dataSource)[number]> = [
    {
      title: 'Proxy',
      dataIndex: 'proxy',
      width: 200,
      render: (text) => <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{text}</Typography.Text>
    },
    {
      title: 'ProxyAdmin path',
      dataIndex: 'proxyAdmin',
      render: (cell: UpgradeMatrixCell) => <MatrixCell cell={cell} />
    },
    {
      title: 'Implementation path',
      dataIndex: 'implementation',
      render: (cell: UpgradeMatrixCell) => <MatrixCell cell={cell} />
    },
    {
      title: 'Beacon path',
      dataIndex: 'beacon',
      render: (cell: UpgradeMatrixCell) => <MatrixCell cell={cell} />
    }
  ];

  return (
    <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
        Upgrade path matrix
      </Typography.Title>
      <Typography.Paragraph style={{ color: '#c8d1f5' }}>
        Rows show proxies, columns show who can change implementations. Unexpected upgrade paths highlight when
        Transparent proxies mix with UUPS logic or when beacons create shared single points of failure.
      </Typography.Paragraph>
      <Alert
        style={{ marginBottom: 16 }}
        type="warning"
        showIcon
        message="Investigate any 'unexpected' cells — they represent bypasses or secondary upgrade paths outside governance."
      />
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered={false}
        rowClassName={(record) => (record.attention ? 'matrix-row-attention' : '')}
        style={{ background: 'transparent' }}
      />
    </Card>
  );
}

const statusColor: Record<string, string> = {
  expected: '#4cd6a5',
  unexpected: '#ff5c5c',
  blocked: '#6c8cff'
};

function MatrixCell({ cell }: { cell: UpgradeMatrixCell }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Tag color={statusColor[cell.status]} style={{ alignSelf: 'flex-start' }}>
        {cell.status === 'expected' ? 'Expected' : cell.status === 'blocked' ? 'Blocked' : 'Unexpected'}
      </Tag>
      <Typography.Text style={{ color: '#c8d1f5' }}>{cell.summary}</Typography.Text>
      {cell.findings.length ? (
        <Typography.Text style={{ color: '#768196', fontSize: 12 }}>
          Evidence: {cell.findings.slice(0, 2).join('; ')}
        </Typography.Text>
      ) : null}
    </div>
  );
}
