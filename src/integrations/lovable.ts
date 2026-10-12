import { supabase } from '@/integrations/supabase/client';
import { academyOrigin } from '@/lib/auth-redirect';

export const lovable = {
  auth: {
    async signInWithOAuth(provider: 'google', options: { redirect_uri: string }) {
      // This is an external Supabase project: use its owner-configured Google provider.
      // The hosted Lovable broker rejects this project's provider as unsupported.
      const requested = new URL(options.redirect_uri);
      const destination = new URL('/auth-confirm', academyOrigin);
      const course = requested.searchParams.get('course');
      if (course && /^[a-z0-9-]+$/.test(course)) destination.searchParams.set('course', course);
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: destination.toString(), queryParams: { prompt: 'select_account' } },
      });
      return { error: result.error, redirected: !result.error };
    },
  },
};