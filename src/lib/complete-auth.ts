import type { SupabaseClient } from '@supabase/supabase-js';

export async function completeAuth(client: SupabaseClient, url: URL) {
  const hash = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has('error') || hash.has('error')) {
    // Reopening a consumed email link must not block a separately valid Google/email session.
    await client.auth.getSession();
    const existing = await client.auth.getUser();
    if (!existing.error && existing.data.user?.email_confirmed_at) return existing.data.user;
    throw new Error('Please sign in to continue to your courses.');
  }
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  if (tokenHash) {
    const result = await client.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' });
    if (result.error) throw new Error('This confirmation link has expired or was already used. Sign in or request a new email.');
  } else if (code) {
    const result = await client.auth.exchangeCodeForSession(code);
    if (result.error) {
      const existing = await client.auth.getUser();
      if (!existing.error && existing.data.user?.email_confirmed_at) return existing.data.user;
      throw new Error('Please sign in to continue to your courses.');
    }
  } else if (accessToken && refreshToken) {
    const result = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (result.error) throw new Error('Unable to restore your sign-in. Please sign in again.');
  } else {
    // Wait for automatic implicit-link processing before validating the account.
    const result = await client.auth.getSession();
    if (result.error) throw new Error('Unable to restore your sign-in. Please sign in again.');
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email_confirmed_at) {
    throw new Error('Your email may be confirmed, but this browser is not signed in. Sign in with your password to open your courses.');
  }
  return data.user;
}