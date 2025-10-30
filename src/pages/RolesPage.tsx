import { CheckCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Card, List, Space, Typography } from 'antd';
import { useMemo } from 'react';
import { useReport } from '@/features/report/ReportProvider';

const checks = [
  {
    key: 'admin-vs-owner',
    title: 'Proxy admin is distinct from runtime owner/pauser',
    keywords: ['owner drift', 'msg.sender initializer', 'runtime owner'],
    remediation: 'Initialize with explicit owner addresses that differ from ProxyAdmin to preserve split of duties.'
  },
  {
    key: 'admin-forwarding',
    title: 'Admin account cannot reach implementation functions',
    keywords: ['transparent proxy', 'selector clash', 'admin fallback'],
    remediation: 'Keep admin-only accounts separate and avoid exposing implementation selectors that shadow admin ops.'
  },
  {
    key: 'upgrade-runbooks',
    title: 'Upgrade runbook asserts proxy.admin() == ProxyAdmin before mutations',
    keywords: ['ProxyAdmin does not assert', 'changeProxyAdmin', 'upgradeAndCall'],
    remediation: 'CI and scripts must verify getProxyAdmin(proxy) == ProxyAdmin before calling upgrades.'
  }
];

export function RolesPage() {
  const { report } = useReport();

  const evaluated = useMemo(() => {
    if (!report) return [] as typeof checks;
    const corpus = report.findings
      .map((finding) =>
        [finding.details.description, finding.details.red_team_argument, finding.details.blue_team_argument]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      )
      .join(' ');

    return checks.map((check) => {
      const hit = check.keywords.some((keyword) => corpus.includes(keyword.toLowerCase()));
      return { ...check, status: hit ? 'warn' : 'ok' };
    });
  }, [report]);

  if (!report) {
    return null;
  }

  return (
    <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Typography.Title level={4} style={{ color: '#f4f7ff' }}>
        Role split watchdog
      </Typography.Title>
      <Typography.Paragraph style={{ color: '#c8d1f5' }}>
        Transparent proxies break if admin and runtime owners blur together. Use this checklist as an operational guard.
      </Typography.Paragraph>
      <List
        itemLayout="vertical"
        dataSource={evaluated}
        renderItem={(item) => (
          <List.Item>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space size={12} align="start">
                {item.status === 'warn' ? (
                  <WarningTwoTone twoToneColor="#ff5c5c" />
                ) : (
                  <CheckCircleTwoTone twoToneColor="#4cd6a5" />
                )}
                <Typography.Text style={{ color: '#f4f7ff', fontWeight: 600 }}>{item.title}</Typography.Text>
              </Space>
              <Typography.Paragraph style={{ color: '#c8d1f5', margin: 0 }}>{item.remediation}</Typography.Paragraph>
              {item.status === 'warn' ? (
                <Typography.Text style={{ color: '#f6c344' }}>
                  Warning triggered by findings referencing: {item.keywords.join(', ')}
                </Typography.Text>
              ) : (
                <Typography.Text style={{ color: '#768196' }}>No warnings detected in current report.</Typography.Text>
              )}
            </Space>
          </List.Item>
        )}
      />
    </Card>
  );
}
