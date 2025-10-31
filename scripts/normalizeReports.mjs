#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REPORT_DIR = path.resolve('public/reports');

const TRACKED_REPORTS = [
  { id: 'balancer', input: '3263143758717162746.json', output: 'balancer.json' },
  { id: 'cctp', output: 'cctp.json' },
  { id: 'maradona', output: 'maradona.json' },
  { id: 'stargate', output: 'stargate.json' },
  { id: 'sushiswap', output: 'sushiswap.json' },
  { id: 'uniswapv3', output: 'uniswapv3.json' }
];

const SEVERITY_MAP = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
  informational: 'Info',
  'n/a': 'N/A',
  na: 'N/A',
  none: 'Info'
};

function mapSeverity(value) {
  if (!value) return 'Info';
  const normalized = String(value).trim().toLowerCase();
  return SEVERITY_MAP[normalized] ?? 'Info';
}

function ensureArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function normalizeLines(source) {
  const set = new Set();
  ensureArray(source).forEach((item) => {
    if (typeof item === 'number' && Number.isFinite(item)) {
      set.add(Math.trunc(item));
    } else if (Array.isArray(item)) {
      item.forEach((v) => {
        if (typeof v === 'number' && Number.isFinite(v)) {
          set.add(Math.trunc(v));
        }
      });
    }
  });
  return set;
}

function normalizeFinding(entry) {
  const source = entry.source ?? 'unknown';
  const detailSource = entry.details ? { ...entry.details } : { ...entry };

  const description = detailSource.description ?? detailSource.title ?? 'No description supplied.';
  const severity = mapSeverity(detailSource.severity ?? entry.severity);

  const lineNumbers = normalizeLines(detailSource.line_numbers);
  const contracts = new Set(ensureArray(detailSource.contracts_involved ?? entry.contracts_involved));
  const chained = detailSource.chained_findings ?? entry.chained_findings;

  const evidence = ensureArray(detailSource.evidence ?? entry.evidence);
  evidence.forEach((ev) => {
    if (!ev || typeof ev !== 'object') return;
    if (ev.file) {
      contracts.add(String(ev.file));
    }
    if (ev.lines) {
      normalizeLines(ev.lines).forEach((ln) => lineNumbers.add(ln));
    }
  });

  const redArgument = detailSource.red_team_argument ?? entry.red_team_argument;
  const recommendation = detailSource.recommendation ?? entry.recommendation;
  const blueArgument = detailSource.blue_team_argument ?? entry.blue_team_argument;
  const economicImpact = detailSource.economic_impact ?? entry.economic_impact;
  const attackScenario = detailSource.attack_scenario ?? entry.attack_scenario;
  const status = detailSource.status ?? entry.status;

  const conclusionParts = [];
  if (detailSource.final_conclusion ?? entry.final_conclusion) {
    conclusionParts.push(detailSource.final_conclusion ?? entry.final_conclusion);
  }
  if (status) {
    conclusionParts.push(`Status: ${status}`);
  }
  if (evidence.length) {
    const evidenceStrings = evidence
      .map((ev) => {
        if (!ev || typeof ev !== 'object') return null;
        const file = ev.file ? String(ev.file) : null;
        const lines = ev.lines ? ensureArray(ev.lines).join(', ') : null;
        if (file && lines) return `${file} lines ${lines}`;
        if (file) return file;
        if (lines) return `lines ${lines}`;
        return null;
      })
      .filter(Boolean);
    if (evidenceStrings.length) {
      conclusionParts.push(`Evidence: ${evidenceStrings.join('; ')}`);
    }
  }
  if (detailSource.notes) {
    conclusionParts.push(`Notes: ${detailSource.notes}`);
  }

  const combinedBlue = [];
  if (blueArgument) combinedBlue.push(blueArgument);
  if (recommendation) combinedBlue.push(`Recommendation: ${recommendation}`);

  const details = {
    description,
    severity,
    ...(lineNumbers.size ? { line_numbers: Array.from(lineNumbers).sort((a, b) => a - b) } : {}),
    ...(redArgument ? { red_team_argument: redArgument } : {}),
    ...(combinedBlue.length ? { blue_team_argument: combinedBlue.join('\n\n') } : {}),
    ...(conclusionParts.length ? { final_conclusion: conclusionParts.join('\n\n') } : {}),
    ...(attackScenario ? { attack_scenario: attackScenario } : {}),
    ...(economicImpact ? { economic_impact: economicImpact } : {}),
    ...(contracts.size ? { contracts_involved: Array.from(contracts) } : {}),
    ...(chained && chained.length ? { chained_findings: chained } : {})
  };

  return { source, details };
}

function normalizeMeta(raw) {
  if (raw.meta) {
    return {
      project_root: raw.meta.project_root ?? raw.meta.projectRoot ?? raw.meta.path ?? undefined,
      files: raw.meta.files ?? [],
      generated_at: raw.meta.generated_at
    };
  }
  if (raw.scope) {
    return {
      project_root: raw.scope.project_root ?? raw.scope.projectRoot ?? undefined,
      files: raw.scope.files ?? [],
      generated_at: raw.scope.generated_at
    };
  }
  return { files: [] };
}

function normalizeReport(raw) {
  const securityScore = typeof raw.security_score === 'number' ? raw.security_score : Number(raw.security_score ?? 0);
  const findings = ensureArray(raw.findings).map((entry) => normalizeFinding(entry));
  const meta = normalizeMeta(raw);
  const base = {
    security_score: securityScore,
    findings,
    meta
  };
  if (raw.log && Array.isArray(raw.log)) {
    base.log = raw.log;
  }
  return base;
}

function loadReport(mapping) {
  let inputPath = mapping.input ? path.join(REPORT_DIR, mapping.input) : undefined;
  if (inputPath && !fs.existsSync(inputPath)) {
    inputPath = undefined;
  }
  if (!inputPath) {
    inputPath = path.join(REPORT_DIR, mapping.output);
  }
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input report not found: ${inputPath}`);
  }
  return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
}

function saveReport(mapping, data) {
  const outputPath = path.join(REPORT_DIR, mapping.output);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

function main() {
  TRACKED_REPORTS.forEach((mapping) => {
    const raw = loadReport(mapping);
    const normalized = normalizeReport(raw);
    saveReport(mapping, normalized);
    console.log(`Normalized ${mapping.id} -> ${mapping.output}`);
  });
}

main();
