import { Card, Empty } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import type { AuditReport, Finding, Severity } from '@types/report';

export type AttackGraphProps = {
  report: AuditReport;
  onSelect?: (finding?: Finding) => void;
  height?: number;
};

const severityRank: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Info', 'N/A'];

type NodeDescriptor = {
  id: string;
  label: string;
  description: string;
  severity: Severity;
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
  isVirtual: boolean;
  finding?: Finding;
};

type EdgeDescriptor = { id: string; source: NodeDescriptor; target: NodeDescriptor };

const severityBackground: Record<Severity, string> = {
  Critical: '#ff8a8a',
  High: '#ffba80',
  Medium: '#f7dd86',
  Low: '#6fe2b9',
  Info: '#9ab0ff',
  'N/A': '#8a94a8'
};

const severityBadgeText: Record<Severity, string> = {
  Critical: 'Critical impact',
  High: 'High impact',
  Medium: 'Medium impact',
  Low: 'Low impact',
  Info: 'Informational',
  'N/A': 'Baseline'
};

const COLUMN_SPACING = 280;
const ROW_SPACING = 150;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 112;
const VIRTUAL_NODE_WIDTH = 240;
const VIRTUAL_NODE_HEIGHT = 116;
const MARGINS = { top: 96, right: 140, bottom: 120, left: 140 };

const clamp = (value: number, min: number, max: number) => {
  if (max <= min) return min;
  return Math.min(Math.max(value, min), max);
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function createId(prefix: string, text: string) {
  const normalized = text.replace(/[^a-z0-9]+/gi, '-').slice(0, 28).replace(/^-|-$/g, '');
  const hash = Math.abs(
    Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ).toString(16);
  return `${prefix}-${normalized}-${hash.slice(0, 4)}`;
}

function wrapLabel(label: string, maxChars = 24, maxLines = 3) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) {
        lines.push(current);
        current = word;
      } else {
        lines.push(word.slice(0, maxChars));
        current = word.slice(maxChars);
      }
    } else {
      current = candidate;
    }
  });

  if (current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    const last = truncated[maxLines - 1];
    truncated[maxLines - 1] = `${last.slice(0, Math.max(0, maxChars - 3))}…`;
    return truncated;
  }

  return lines;
}

type GraphLayout = {
  nodes: NodeDescriptor[];
  edges: EdgeDescriptor[];
  width: number;
  height: number;
  columnLabels: Array<{ column: number; label: string }>;
};

function layoutGraph(report: AuditReport): GraphLayout {
  const severityToColumn = new Map<Severity, number>();
  severityRank.forEach((severity, index) => severityToColumn.set(severity, index));

  const columnHeights = new Map<number, number>();
  const columnLabels = new Map<number, string>();
  const descToId = new Map<string, string>();
  const nodeLookup = new Map<string, NodeDescriptor>();

  const nodes: NodeDescriptor[] = [];
  const edges: EdgeDescriptor[] = [];

  const virtualColumn = severityRank.length;
  columnLabels.set(virtualColumn, 'Linked Evidence');

  report.findings.forEach((finding, index) => {
    const column = severityToColumn.get(finding.details.severity) ?? virtualColumn;
    columnLabels.set(column, finding.details.severity);
    const row = columnHeights.get(column) ?? 0;
    const x = MARGINS.left + column * COLUMN_SPACING;
    const y = MARGINS.top + row * ROW_SPACING;
    columnHeights.set(column, row + 1);

    const node: NodeDescriptor = {
      id: `finding-${index}`,
      label: finding.details.description,
      description: finding.details.description,
      severity: finding.details.severity,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      x,
      y,
      column,
      isVirtual: false,
      finding
    };
    nodes.push(node);
    nodeLookup.set(node.id, node);
    descToId.set(normalize(finding.details.description), node.id);
  });

  report.findings.forEach((finding) => {
    const source = Array.from(nodeLookup.values()).find((node) => node.finding === finding);
    if (!source) return;

    (finding.details.chained_findings ?? []).forEach((reference) => {
      const normalized = normalize(reference);
      let target = descToId.get(normalized)
        ? nodeLookup.get(descToId.get(normalized)!)
        : undefined;

      if (!target) {
        for (const [storedDesc, id] of descToId.entries()) {
          if (storedDesc.includes(normalized) || normalized.includes(storedDesc)) {
            target = nodeLookup.get(id);
            break;
          }
        }
      }

      if (!target) {
        const row = columnHeights.get(virtualColumn) ?? 0;
        const x = MARGINS.left + virtualColumn * COLUMN_SPACING;
        const y = MARGINS.top + row * ROW_SPACING;
        columnHeights.set(virtualColumn, row + 1);

        target = {
          id: createId('virtual', reference),
          label: reference,
          description: reference,
          severity: 'Medium',
          width: VIRTUAL_NODE_WIDTH,
          height: VIRTUAL_NODE_HEIGHT,
          x,
          y,
          column: virtualColumn,
          isVirtual: true
        };
        nodes.push(target);
        nodeLookup.set(target.id, target);
        descToId.set(normalize(reference), target.id);
      }

      edges.push({
        id: `${source.id}->${target.id}`,
        source,
        target
      });
    });
  });

  if (!nodes.length) {
    return { nodes: [], edges: [], width: 0, height: 0, columnLabels: [] };
  }

  const maxX = Math.max(...nodes.map((node) => node.x + node.width / 2));
  const maxY = Math.max(...nodes.map((node) => node.y + node.height / 2));
  const width = Math.max(980, maxX + MARGINS.right);
  const height = Math.max(520, maxY + MARGINS.bottom);

  const columnLabelsSorted = Array.from(columnLabels.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([column, label]) => ({ column, label }));

  return { nodes, edges, width, height, columnLabels: columnLabelsSorted };
}

function nodeFill(node: NodeDescriptor) {
  if (node.isVirtual) return '#2a3244';
  return severityBackground[node.severity] ?? '#5bd5ff';
}

function nodeStroke(node: NodeDescriptor, isSelected: boolean) {
  if (isSelected) return '#5bd5ff';
  return node.isVirtual ? 'rgba(91, 213, 255, 0.45)' : 'rgba(255,255,255,0.24)';
}

export function AttackGraph({ report, onSelect, height }: AttackGraphProps) {
  const { nodes, edges, width, height: computedHeight, columnLabels } = useMemo(
    () => layoutGraph(report),
    [report]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgHeight = height ?? computedHeight;
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width, height: svgHeight });
  const [isPanning, setIsPanning] = useState(false);
  const pointerSnapshot = useRef<
    | {
        pointerId: number;
        originX: number;
        originY: number;
        pointerX: number;
        pointerY: number;
        width: number;
        height: number;
      }
    | null
  >(null);
  const maxZoom = 2;

  useEffect(() => {
    setViewBox({ x: 0, y: 0, width, height: svgHeight });
  }, [width, svgHeight]);

  if (!nodes.length) {
    return <Empty description="No attack chains detected" style={{ padding: 48 }} />;
  }

  const handleSelect = (node: NodeDescriptor) => {
    setSelectedId(node.id);
    if (node.finding) {
      onSelect?.(node.finding);
    } else {
      onSelect?.(undefined);
    }
  };

  const clearSelection = () => {
    setSelectedId(null);
    onSelect?.(undefined);
  };

  const applyZoom = (factor: number, focus?: { x: number; y: number }) => {
    setViewBox((current) => {
      const focusX = focus?.x ?? current.x + current.width / 2;
      const focusY = focus?.y ?? current.y + current.height / 2;
      const minWidth = width / maxZoom;
      const maxWidth = width;
      const minHeight = svgHeight / maxZoom;
      const maxHeight = svgHeight;
      const proposedWidth = clamp(current.width * factor, minWidth, maxWidth);
      const proposedHeight = clamp(current.height * factor, minHeight, maxHeight);
      const ratioX = (focusX - current.x) / current.width;
      const ratioY = (focusY - current.y) / current.height;
      const nextX = clamp(focusX - ratioX * proposedWidth, 0, width - proposedWidth);
      const nextY = clamp(focusY - ratioY * proposedHeight, 0, svgHeight - proposedHeight);
      return { x: nextX, y: nextY, width: proposedWidth, height: proposedHeight };
    });
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.preventDefault();
    pointerSnapshot.current = {
      pointerId: event.pointerId,
      originX: viewBox.x,
      originY: viewBox.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: viewBox.width,
      height: viewBox.height
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointerSnapshot.current) return;
    const snapshot = pointerSnapshot.current;
    const scaleX = snapshot.width / event.currentTarget.clientWidth;
    const scaleY = snapshot.height / event.currentTarget.clientHeight;
    const dx = (event.clientX - snapshot.pointerX) * scaleX;
    const dy = (event.clientY - snapshot.pointerY) * scaleY;
    const nextX = clamp(snapshot.originX - dx, 0, width - snapshot.width);
    const nextY = clamp(snapshot.originY - dy, 0, svgHeight - snapshot.height);
    setViewBox((current) => ({ ...current, x: nextX, y: nextY }));
  };

  const releasePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (pointerSnapshot.current && event.currentTarget.hasPointerCapture(pointerSnapshot.current.pointerId)) {
      event.currentTarget.releasePointerCapture(pointerSnapshot.current.pointerId);
    }
    pointerSnapshot.current = null;
    setIsPanning(false);
  };

  return (
    <Card
      style={{
        background: '#141823',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'visible'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div className={`attack-graph__viewport${isPanning ? ' is-panning' : ''}`}>
        <svg
          width="100%"
          height={Math.min(svgHeight, 720)}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          role="presentation"
          onClick={(event) => {
            if ((event.target as SVGGElement).dataset && (event.target as SVGGElement).dataset.nodeId) {
              return;
            }
            clearSelection();
          }}
          style={{ display: 'block', background: '#141823' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={releasePointer}
          onPointerLeave={releasePointer}
          onPointerCancel={releasePointer}
        >
        <defs>
          <marker
            id="attack-graph-arrow"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="12"
            markerHeight="12"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 12 6 L 0 12 z" fill="rgba(91, 213, 255, 0.8)" />
          </marker>
          <filter id="attack-graph-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {columnLabels.map(({ column, label }) => {
          const x = MARGINS.left + column * COLUMN_SPACING;
          return (
            <text
              key={`label-${column}`}
              x={x}
              y={MARGINS.top - 32}
              textAnchor="middle"
              style={{ fill: '#c8d1f5', fontSize: 14, fontWeight: 600, letterSpacing: 0.32 }}
            >
              {label}
            </text>
          );
        })}

        {edges.map((edge) => {
          const isConnected =
            selectedId && (edge.source.id === selectedId || edge.target.id === selectedId);
          const startX = edge.source.x + edge.source.width / 2;
          const startY = edge.source.y;
          const endX = edge.target.x - edge.target.width / 2;
          const endY = edge.target.y;
          const horizontal = Math.max(140, Math.abs(endX - startX) * 0.45);
          const vertical = Math.max(50, Math.abs(endY - startY) * 0.35);
          const path = `M ${startX} ${startY} C ${startX + horizontal} ${startY - vertical}, ${
            endX - horizontal
          } ${endY + vertical}, ${endX} ${endY}`;

          return (
            <path
              key={edge.id}
              d={path}
              stroke={isConnected ? '#5bd5ff' : 'rgba(91, 213, 255, 0.38)'}
              strokeWidth={isConnected ? 3 : 2}
              fill="none"
              markerEnd="url(#attack-graph-arrow)"
              style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
            />
          );
        })}

        {nodes.map((node) => {
          const isSelected = selectedId === node.id;
          const lines = wrapLabel(node.label);
          const textColor = node.isVirtual ? '#d7defc' : '#151821';
          const badgeText = node.isVirtual ? 'Linked evidence' : severityBadgeText[node.severity];
          const badgeColor = node.isVirtual ? '#5bd5ff' : '#151821';

          return (
            <g
              key={node.id}
              data-node-id={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={(event) => {
                event.stopPropagation();
                handleSelect(node);
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={-node.width / 2}
                y={-node.height / 2}
                width={node.width}
                height={node.height}
                rx={18}
                ry={18}
                fill={nodeFill(node)}
                stroke={nodeStroke(node, isSelected)}
                strokeWidth={isSelected ? 3 : 1.5}
                opacity={node.isVirtual ? 0.88 : 1}
                filter={isSelected ? 'url(#attack-graph-glow)' : undefined}
              />
              <text
                x={0}
                y={-node.height / 2 + 26}
                textAnchor="middle"
                style={{
                  fill: badgeColor,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.26
                }}
              >
                {badgeText}
              </text>
              {lines.map((line, index) => (
                <text
                  key={`${node.id}-${index}`}
                  x={0}
                  y={-node.height / 2 + 48 + index * 18}
                  textAnchor="middle"
                  style={{
                    fill: textColor,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.16
                  }}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        </svg>
        <div className="attack-graph__controls">
          <button
            type="button"
            onClick={() => applyZoom(0.85)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => applyZoom(1.15)}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setViewBox({ x: 0, y: 0, width, height: svgHeight })}
            aria-label="Reset view"
          >
            Reset
          </button>
        </div>
      </div>
    </Card>
  );
}
  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 1.1 : 0.9;
    const rect = event.currentTarget.getBoundingClientRect();
    const focusX = viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width;
    const focusY = viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height;
    applyZoom(factor, { x: focusX, y: focusY });
  };
