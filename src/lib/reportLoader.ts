import { auditReportSchema, type AuditReport } from '@types/report';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

function resolveRelativeUrl(path: string): string {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.replace(/^\//, '');
  return `${normalizedBase}${normalizedPath}`;
}

export async function loadReportFromUrl(url: string): Promise<AuditReport> {
  const resolvedUrl = resolveRelativeUrl(url);
  const res = await fetch(resolvedUrl);
  if (!res.ok) {
    throw new Error(`Failed to load report from ${resolvedUrl}: ${res.statusText}`);
  }
  const json = await res.json();
  return auditReportSchema.parse(json);
}

export async function loadReportFromFile(file: File): Promise<AuditReport> {
  const text = await file.text();
  const json = JSON.parse(text);
  return auditReportSchema.parse(json);
}

export function parseReport(json: unknown): AuditReport {
  return auditReportSchema.parse(json);
}
