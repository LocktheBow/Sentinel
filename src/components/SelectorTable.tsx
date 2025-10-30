import { Card, Empty, Tag, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { S2Options } from '@antv/s2';
import { SheetComponent } from '@antv/s2-react';
import type { SelectorCollision } from '@lib/selectorDiff';
import '@antv/s2-react/dist/s2-react.min.css';

export type SelectorTableProps = {
  collisions: SelectorCollision[];
  height?: number;
};

type Size = { width: number; height: number };

export function SelectorTable({ collisions, height = 320 }: SelectorTableProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size>({ width: 600, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setSize({ width: entry.contentRect.width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  const dataCfg = useMemo(
    () => ({
      fields: {
        columns: ['selector', 'signature', 'severity', 'source', 'excerpt']
      },
      meta: [
        { field: 'selector', name: 'Selector' },
        { field: 'signature', name: 'Signature' },
        { field: 'severity', name: 'Severity' },
        { field: 'source', name: 'Source' },
        { field: 'excerpt', name: 'Excerpt' }
      ],
      data: collisions.map((collision) => ({
        selector: collision.selector,
        signature: collision.signature,
        severity: collision.severity,
        source: collision.source,
        excerpt: collision.excerpt
      }))
    }),
    [collisions]
  );

  const options: S2Options = useMemo(
    () => ({
      width: size.width,
      height: size.height,
      showSeriesNumber: true,
      style: {
        cellCfg: {
          height: 52,
          valuesCfg: {
            textAlign: 'left'
          }
        },
        colCfg: {
          widthByFieldValue: {
            selector: 140,
            signature: 220,
            severity: 120,
            source: 160,
            excerpt: 360
          }
        }
      }
    }),
    [size]
  );

  if (collisions.length === 0) {
    return (
      <Card style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Empty description="No selector collisions detected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <div ref={containerRef}>
      <Card
        style={{ background: '#141823', border: '1px solid rgba(255,255,255,0.08)' }}
        bodyStyle={{ padding: 16 }}
      >
      <Typography.Title level={5} style={{ color: '#f4f7ff' }}>
        Selector collision matrix
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ color: '#c8d1f5' }}>
        Comparing implementation selectors against Transparent proxy admin selectors.
      </Typography.Paragraph>
      <SheetComponent sheetType="table" dataCfg={dataCfg} options={options} adaptive />
        <Typography.Paragraph style={{ marginTop: 12, color: '#768196' }}>
          <Tag color="#ff5c5c">Action</Tag> Resolve collisions before deployments. Ensure UUPS capabilities are not exposed behind Transparent proxies.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
