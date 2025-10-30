import { Alert, Typography } from 'antd';
import type { ReactNode } from 'react';
import { sanitizeDangerousContent } from '@lib/guardrails';

type DangerousContentGuardProps = {
  text?: string | null;
  heading?: ReactNode;
};

export function DangerousContentGuard({ text, heading }: DangerousContentGuardProps) {
  const { sanitized, suppressed } = sanitizeDangerousContent(text);

  if (!sanitized) {
    return null;
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {heading ?? (
        <Typography.Title level={5} style={{ margin: 0 }}>
          Red Team Narrative (sanitized)
        </Typography.Title>
      )}
      {suppressed ? (
        <Alert
          type="warning"
          message="Potentially harmful payloads were removed from this narrative."
          showIcon
        />
      ) : null}
      <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
        {sanitized}
      </Typography.Paragraph>
    </div>
  );
}
