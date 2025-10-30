import { describe, expect, it } from 'vitest';
import { sanitizeDangerousContent } from '@lib/guardrails';

describe('sanitizeDangerousContent', () => {
  it('removes code blocks and dangerous keywords', () => {
    const input = 'Attack plan ```calldata 0x1234567890abcdef``` delegatecall payload';
    const { sanitized, suppressed } = sanitizeDangerousContent(input);
    expect(suppressed).toBe(true);
    expect(sanitized.includes('calldata')).toBe(false);
    expect(sanitized.includes('delegatecall')).toBe(false);
  });

  it('returns empty string for undefined input', () => {
    const result = sanitizeDangerousContent(undefined);
    expect(result.sanitized).toBe('');
    expect(result.suppressed).toBe(false);
  });
});
