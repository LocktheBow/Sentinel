import { auditReportSchema, type AuditReport } from '@types/report';

export async function loadReportFromUrl(url: string): Promise<AuditReport> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load report from ${url}: ${res.statusText}`);
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
