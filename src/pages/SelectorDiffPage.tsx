import { Alert, Space } from 'antd';
import { SelectorTable } from '@components/SelectorTable';
import { computeSelectorCollisions } from '@lib/selectorDiff';
import { useReport } from '@/features/report/ReportProvider';

export function SelectorDiffPage() {
  const { report } = useReport();

  if (!report) {
    return null;
  }

  const collisions = computeSelectorCollisions(report);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Alert
        type={collisions.length ? 'warning' : 'success'}
        showIcon
        message={
          collisions.length
            ? 'Selectors collide with Transparent proxy admin functions. Harden CI gates before deploying.'
            : 'No collisions detected in this report. Keep selector CI enforced for future upgrades.'
        }
      />
      <SelectorTable collisions={collisions} />
    </Space>
  );
}
