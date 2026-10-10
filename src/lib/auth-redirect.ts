// Confirmation emails must use a public, stable website rather than an editor preview origin.
export const academyOrigin = 'https://pethes-barakshar.lovable.app';
export function confirmationUrl(course?: string) {
  const url = new URL('/auth-confirm', academyOrigin);
  if (course && /^[a-z0-9-]+$/.test(course)) url.searchParams.set('course', course);
  return url.toString();
}