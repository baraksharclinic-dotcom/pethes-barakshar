import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { pageHead } from '@/lib/academy';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { completeAuth } from '@/lib/complete-auth';

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
      const course = url.searchParams.get('course');
      try { await completeAuth(supabase, url); }
      finally { window.history.replaceState(null, '', '/auth-confirm'); }
      setVerified(true);
      if (course && /^[a-z0-9-]+$/.test(course)) await navigate({to:'/courses/$slug', params:{slug:course}, replace:true});
      else await navigate({to:'/dashboard', replace:true});
    };
    void confirm().catch(e => setError(e instanceof Error ? e.message : 'Unable to complete confirmation. Please sign in again.'));
  }, [navigate]);
  return <div className="container-page py-20"><div className="mx-auto max-w-lg"><h1 className="text-3xl">{error ? 'Email confirmation' : verified ? 'Email confirmed' : 'Confirming your email'}</h1>{error ? <><p role="alert" className="mt-5 text-muted-foreground">{error}</p><Button asChild className="mt-6"><Link to="/auth">Sign in or resend confirmation</Link></Button></> : <p role="status" className="mt-5 flex items-center gap-3 text-muted-foreground">{verified ? <CheckCircle2/> : <LoaderCircle className="animate-spin motion-reduce:animate-none"/>}{verified ? 'Opening your student courses…' : 'Checking your confirmation…'}</p>}</div></div>;
}