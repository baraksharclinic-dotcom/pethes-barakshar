// Called only after course access has been checked. Credentials are passed by
// the server handler, never read here or returned to the browser.
export async function signBunnyUrl(source: string, key: string, expires: number) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || url.hostname !== 'barakshar-cdn.b-cdn.net' || url.username || url.password) {
    throw new Error('Invalid course media address.');
  }
  // Academy media references are canonical file URLs, not pre-signed links.
  url.search = '';
  url.hash = '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key + url.pathname + expires));
  const token = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  url.searchParams.set('token', token);
  url.searchParams.set('expires', String(expires));
  return url.toString();
}