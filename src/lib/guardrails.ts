const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_REGEX = /`[^`]*`/g;
const HEX_PAYLOAD_REGEX = /0x[0-9a-fA-F]{16,}/g;
const DANGEROUS_KEYWORDS = /(rawcall|delegatecall|create2|selfdestruct|calldata|payload|assembly)/gi;

export type GuardrailResult = {
  sanitized: string;
  suppressed: boolean;
};

export function sanitizeDangerousContent(input?: string | null): GuardrailResult {
  if (!input) {
    return { sanitized: '', suppressed: false };
  }

  let working = input;
  let suppressed = false;

  const replacements: Array<[RegExp, string]> = [
    [CODE_BLOCK_REGEX, ' '],
    [INLINE_CODE_REGEX, ' '],
    [HEX_PAYLOAD_REGEX, ' '],
    [DANGEROUS_KEYWORDS, ' ']
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(working)) {
      suppressed = true;
      working = working.replace(pattern, replacement);
    }
  }

  working = working.replace(/\s+/g, ' ').trim();

  return { sanitized: working, suppressed };
}
