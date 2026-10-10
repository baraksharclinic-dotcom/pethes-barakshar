import { describe, expect, it } from 'vitest';
import { confirmationUrl } from '@/lib/auth-redirect';
describe('email confirmation destinations', () => {
  it('uses the published website rather than localhost or preview', () => {
    expect(confirmationUrl()).toBe('https://pethes-barakshar.lovable.app/auth-confirm');
  });
  it('preserves valid course context', () => {
    expect(confirmationUrl('foundation-biochemic')).toContain('?course=foundation-biochemic');
  });
  it('does not accept external redirects', () => {
    expect(confirmationUrl('https://example.com')).toBe(confirmationUrl());
  });
});