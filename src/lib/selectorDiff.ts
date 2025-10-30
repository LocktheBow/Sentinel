import { ADMIN_SIGNATURES, type AuditReport, type Finding, type Severity } from '@types/report';

export type SelectorCollision = {
  signature: string;
  selector: string;
  finding: string;
  severity: Severity;
  source: string;
  excerpt: string;
};

const KEYWORD_SIGNATURE_MAP: Array<{ keyword: RegExp; signature: string }> = [
  { keyword: /upgradeToAndCall/i, signature: 'upgradeToAndCall(address,bytes)' },
  { keyword: /upgradeTo\b/i, signature: 'upgradeTo(address)' },
  { keyword: /changeAdmin/i, signature: 'changeAdmin(address)' },
  { keyword: /\badmin\b/i, signature: 'admin()' },
  { keyword: /implementation\b/i, signature: 'implementation()' }
];

const ADMIN_SELECTOR_LOOKUP = new Map(ADMIN_SIGNATURES.map((item) => [item.signature, item.selector]));
const ADMIN_SELECTOR_SET = new Set(ADMIN_SIGNATURES.map((item) => item.selector.toLowerCase()));

function collectText(detail: Finding['details']): string {
  const parts: string[] = [detail.description];
  if (detail.red_team_argument) parts.push(detail.red_team_argument);
  if (detail.blue_team_argument) parts.push(detail.blue_team_argument);
  if (detail.final_conclusion) parts.push(detail.final_conclusion);
  if (detail.attack_scenario) parts.push(detail.attack_scenario);
  return parts.join('\n');
}

function findSelectorMentions(text: string): Array<{ signature: string; excerpt: string }> {
  const matches: Array<{ signature: string; excerpt: string }> = [];

  for (const entry of KEYWORD_SIGNATURE_MAP) {
    if (entry.keyword.test(text)) {
      const idx = text.search(entry.keyword);
      const excerpt = text.slice(Math.max(idx - 40, 0), Math.min(idx + 80, text.length));
      matches.push({ signature: entry.signature, excerpt });
    }
  }

  const selectorRegex = /0x[0-9a-fA-F]{8}/g;
  let match: RegExpExecArray | null;
  while ((match = selectorRegex.exec(text))) {
    const selector = match[0].toLowerCase();
    if (ADMIN_SELECTOR_SET.has(selector)) {
      matches.push({
        signature:
          ADMIN_SIGNATURES.find((item) => item.selector.toLowerCase() === selector)?.signature ?? selector,
        excerpt: text.slice(Math.max(match.index - 40, 0), Math.min(match.index + 80, text.length))
      });
    }
  }

  return matches;
}

export function computeSelectorCollisions(report: AuditReport): SelectorCollision[] {
  const collisions: SelectorCollision[] = [];
  const seen = new Set<string>();

  for (const finding of report.findings) {
    const text = collectText(finding.details);
    const mentions = findSelectorMentions(text);

    for (const mention of mentions) {
      const key = `${finding.source}:${mention.signature}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const selector = ADMIN_SELECTOR_LOOKUP.get(mention.signature) ?? mention.signature;

      collisions.push({
        signature: mention.signature,
        selector,
        finding: finding.details.description,
        severity: finding.details.severity,
        source: finding.source,
        excerpt: mention.excerpt.trim()
      });
    }
  }

  return collisions;
}

export function hasSelectorCollisions(report: AuditReport): boolean {
  return computeSelectorCollisions(report).length > 0;
}
