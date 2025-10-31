import { Anchor, Card, Col, Divider, Row, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useReport } from '@/features/report/ReportProvider';
import { countBySeverity, severityOrder } from '@lib/metrics';

const { Title, Paragraph, Text } = Typography;

type Section = {
  id: string;
  heading: string;
  content: ReactNode;
};

export function SecurityReportPage() {
  const { report, descriptor } = useReport();

  if (!report) {
    return null;
  }

  const severityCounts = useMemo(() => countBySeverity(report), [report]);
  const highestSeverity = useMemo(
    () => severityOrder.find((sev) => severityCounts[sev] > 0) ?? 'Medium',
    [severityCounts]
  );

  const topFindings = useMemo(() => report.findings.slice(0, 8), [report.findings]);

  const sections: Section[] = [
    {
      id: 'executive-summary',
      heading: '1. Executive Summary',
      content: (
        <>
          <Paragraph>
            {descriptor.name} ({descriptor.chain}) was reviewed with Sentinel&apos;s <Text strong>Tiny Recursive Model (TRM)</Text> pipeline.
            TRM iteratively improves its hypotheses—per the <Text italic>Less is More: Recursive Reasoning with Tiny Networks</Text> methodology—until every
            upgrade vector has been stress-tested. The current posture is <Text strong>{highestSeverity}</Text> and the
            portal wiring delivers action items to move toward {descriptor.trmHeadline.toLowerCase()}.
          </Paragraph>
          <Paragraph>
            Key takeaways:
          </Paragraph>
          <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
            {descriptor.trmBullets.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Divider />
          <Title level={4}>What to do this week</Title>
          <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
            {descriptor.todo.map((task) => (
              <li key={task.route}>
                <Text strong>{task.label}</Text> — available at <code>{task.route}</code> (status: {task.done ? 'complete' : 'in progress'}).
              </li>
            ))}
          </ul>
          <Paragraph>
            <Text strong>Risk rating:</Text> TRM confirmed pathways from configuration drift to catastrophic loss. Follow the
            mitigation playbook in Impact → Remediation vs Residual Risk to move from <Text strong>{highestSeverity}</Text> to the
            target posture surfaced by Sentinel.
          </Paragraph>
        </>
      )
    },
    {
      id: 'scope-methodology',
      heading: '2. Scope & Methodology',
      content: (
        <>
          <Title level={4}>2.1 Scope</Title>
          <Paragraph>
            Assessments focus on <Text strong>{descriptor.category}</Text> upgrade flows and their supporting OpenZeppelin primitives.
            Application-layer business logic is synthesised but not audited line-by-line; this keeps the spotlight on upgradeability risk.
          </Paragraph>
          <Title level={4}>2.2 Methodology</Title>
          <Paragraph>
            Sentinel&apos;s TRM mirrors the approach outlined in <Text italic>Less is More: Recursive Reasoning with Tiny Networks</Text>: a compact network
            runs up to sixteen refinement steps, alternating between latent updates and actionable hypotheses. Each iteration produces a diff that guards
            against regression and feeds the portal artefacts (Impact, Attack Surface, Upgrade Matrix, etc.).
          </Paragraph>
          <Paragraph>
            <Text strong>Limitations:</Text> the analysis is static; no live-chain transactions or RPC fork tests were executed. High- and critical-severity
            issues listed below must be validated in staging environments before mainnet action.
          </Paragraph>
        </>
      )
    },
    {
      id: 'trm-highlights',
      heading: '3. TRM Highlights',
      content: (
        <>
          <Paragraph>
            <Text strong>{descriptor.trmHeadline}</Text>
          </Paragraph>
          <Paragraph>
            The bullets below map TRM&apos;s recursive latent improvements to the controls now wired into the Sentinel cockpit:
          </Paragraph>
          <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
            {descriptor.trmBullets.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </>
      )
    },
    {
      id: 'findings-summary',
      heading: '4. Findings (sample)',
      content: (
        <>
          <Paragraph>
            TRM produced {report.findings.length} narratives. The table lists the first {topFindings.length} entries; visit the Findings and Attack Surface
            tabs for the full, filterable corpus.
          </Paragraph>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f7ff' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Severity</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Description</th>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {topFindings.map((finding, index) => (
                  <tr key={`${finding.details.description}-${index}`}>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {finding.details.severity}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {finding.details.description}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{finding.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )
    },
    {
      id: 'risk-register',
      heading: '5. Sentinel task register',
      content: (
        <>
          <Paragraph>
            The Sentinel cockpit tracks rollout progress across every artefact. All items below read live data from the active report and reflect the latest
            TRM iterations.
          </Paragraph>
          <ul style={{ color: '#f4f7ff', paddingLeft: 20 }}>
            {descriptor.todo.map((task) => (
              <li key={`register-${task.route}`}>
                <Text strong>{task.label}</Text> — status: {task.done ? 'complete' : 'pending'}
              </li>
            ))}
          </ul>
        </>
      )
    }
  ];

  const anchorItems = sections.map((section) => ({
    key: section.id,
    href: `#${section.id}`,
    title: section.heading
  }));

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} xl={17}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {sections.map((section) => (
            <Card
              key={section.id}
              id={section.id}
              style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Title level={3} style={{ color: '#f4f7ff' }}>
                {section.heading}
              </Title>
              <div style={{ color: '#c8d1f5' }}>{section.content}</div>
            </Card>
          ))}
        </Space>
      </Col>
      <Col xs={24} xl={7}>
        <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 24 }}>
          <Title level={4} style={{ color: '#f4f7ff' }}>
            Navigation
          </Title>
          <Anchor affix={false} items={anchorItems} style={{ color: '#f4f7ff' }} />
        </Card>
      </Col>
    </Row>
  );
}
