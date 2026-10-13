import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { signBunnyUrl } from '@/lib/bunny-signing';

describe('Bunny course media signing', () => {
  it('signs the exact file path using Bunny SHA256 URL tokens', async () => {
    const key = 'test-only-fixture';
    const expires = 2000000000;
    const url = new URL(await signBunnyUrl('https://barakshar-cdn.b-cdn.net/Prasthavna.mp3', key, expires));
    expect(url.searchParams.get('token')).toBe(createHash('sha256').update(key + '/Prasthavna.mp3' + expires).digest('base64url'));
    expect(url.searchParams.get('expires')).toBe(String(expires));
    expect(url.pathname).toBe('/Prasthavna.mp3');
  });
  it('replaces expired tokens and supports PDF file paths', async () => {
    const url = new URL(await signBunnyUrl('https://barakshar-cdn.b-cdn.net/notes.pdf?token=old&expires=1#toolbar=0', 'test-only-fixture', 2000000000));
    expect(url.searchParams.get('expires')).toBe('2000000000');
    expect(url.searchParams.get('token')).not.toBe('old');
    expect(url.hash).toBe('');
  });
  it('rejects addresses outside the academy CDN', async () => {
    await expect(signBunnyUrl('https://example.com/audio.mp3', 'test-only-fixture', 2000000000)).rejects.toThrow('Invalid course media');
  });
});