import { createLovableAuth } from '@lovable.dev/cloud-auth-js';
import { supabase } from '@/integrations/supabase/client';

const broker = createLovableAuth();
export const lovable = {
  auth: {
    async signInWithOAuth(provider: 'google', options: { redirect_uri: string }) {
      const result = await broker.signInWithOAuth(provider, options);
      if (result.error || result.redirected) return result;
      const session = await supabase.auth.setSession(result.tokens);
      return { ...result, error: session.error };
    },
  },
};