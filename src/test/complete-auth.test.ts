import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { completeAuth } from '@/lib/complete-auth';

function fixture(confirmed = true) {
  const auth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    setSession: vi.fn().mockResolvedValue({ error: null }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: confirmed ? { id: 'student', email_confirmed_at: '2026-10-11' } : null }, error: null }),
  };
  return { auth, client: { auth } as unknown as SupabaseClient };
}
describe('student confirmation session', () => {
  it('exchanges a code before validating the student', async () => {
    const { auth, client } = fixture();
    await completeAuth(client, new URL('https://academy.test/auth-confirm?code=test-code'));
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('test-code');
    expect(auth.getSession).not.toHaveBeenCalled();
  });
  it('verifies token hashes even when another session might exist', async () => {
    const { auth, client } = fixture();
    await completeAuth(client, new URL('https://academy.test/auth-confirm?token_hash=test-hash'));
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'test-hash', type: 'signup' });
  });
  it('restores an implicit email session before validating', async () => {
    const { auth, client } = fixture();
    await completeAuth(client, new URL('https://academy.test/auth-confirm#access_token=test-access&refresh_token=test-refresh'));
    expect(auth.setSession).toHaveBeenCalledWith({ access_token: 'test-access', refresh_token: 'test-refresh' });
  });
  it('recovers a verified session when a consumed link is reopened', async () => {
    const { client } = fixture();
    await expect(completeAuth(client, new URL('https://academy.test/auth-confirm#error=access_denied'))).resolves.toMatchObject({ id: 'student' });
  });
  it('does not bypass sign-in for an invalid link without a session', async () => {
    const { client } = fixture(false);
    await expect(completeAuth(client, new URL('https://academy.test/auth-confirm#error=access_denied'))).rejects.toThrow('Please sign in');
  });
  it('does not grant access without a verified server user', async () => {
    const { client } = fixture(false);
    await expect(completeAuth(client, new URL('https://academy.test/auth-confirm'))).rejects.toThrow('not signed in');
  });
});