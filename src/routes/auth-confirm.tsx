import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/academy';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LoaderCircle } from 'lucide-react';

export const Route = createFileRoute('/auth-confirm')({
  head: () => pageHead('Confirm your student account', 'Complete email verification and enter your Barakshar student courses.'),
  component: ConfirmAccount,
});

function ConfirmAccount() {
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const confirm = async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      // Do not display provider errors or leave credentials in browser history.
      const linkError = url.searchParams.has('error') || hash.has('error');
      const code = url.searchParams.get('code');
      const tokenHash = url.searchParams.get('token_hash');
      if (linkError) {
        window.history.replaceState(null, '', '/auth-confirm');
        throw new Error('This confirmation link has expired or was already used. Try signing in, or request a new confirmation email.');
      }
      // Supabase's default client consumes implicit session fragments during initialization.
      const initial = await supabase.auth.getSession();
      window.history.replaceState(null, "", "/auth-confirm");
      if (code && !initial.data.session) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        if (result.error) throw new Error('This link cannot be completed here. Open it in the browser used to sign up, or sign in if your email is already confirmed.');
      } else if (tokenHash && !initial.data.session) {
        const result = await supabase.auth.verifyOtp({token_hash: tokenHash, type: 'signup'});
        if (result.error) throw new Error('This confirmation link has expired or was already used. Try signing in, or request a new confirmation email.');
      }
      const user = await supabase.auth.getUser();
      if (user.error || !user.data.user?.email_confirmed_at) throw new Error('Sign in to continue. If your email is not confirmed, request a new confirmation email.');
      setVerified(true);
      await navigate({to:'/dashboard', replace:true});
    };
    void confirm().catch(e => setError(e instanceof Error ? e.message : 'Unable to complete confirmation. Please sign in again.'));
  }, [navigate]);
  return <div className="container-page py-20"><div className="mx-auto max-w-lg"><h1 className="text-3xl">{error ? 'Email confirmation' : verified ? 'Email confirmed' : 'Confirming your email'}</h1>{error ? <><p role="alert" className="mt-5 text-muted-foreground">{error}</p><Button asChild className="mt-6"><Link to="/auth">Sign in or resend confirmation</Link></Button></> : <p role="status" className="mt-5 flex items-center gap-3 text-muted-foreground">{verified ? <CheckCircle2/> : <LoaderCircle className="animate-spin motion-reduce:animate-none"/>}{verified ? 'Opening your student courses…' : 'Checking your confirmation…'}</p>}</div></div>;
}