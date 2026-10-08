import { createFileRoute,useNavigate } from '@tanstack/react-router';
import { useEffect,useState } from 'react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {pageHead} from '@/lib/academy';
import {toast} from 'sonner';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset password','Set a new password for your Barakshar student account.'),component:Reset});
function Reset(){const [recovery,setRecovery]=useState(false);const [busy,setBusy]=useState(false);const nav=useNavigate();useEffect(()=>{setRecovery(window.location.hash.includes('type=recovery')||window.location.search.includes('type=recovery'));},[]);return <div className="container-page py-16"><form className="mx-auto max-w-lg space-y-5" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(f.get('password')!==f.get('confirm')){toast.error('Passwords do not match');return}setBusy(true);const r=await supabase.auth.updateUser({password:String(f.get('password'))});setBusy(false);if(r.error)toast.error(r.error.message);else{toast.success('Password updated');nav({to:'/dashboard'})}}}><h1 className="text-4xl">Set a new password</h1>{!recovery?<p>Open the password reset link sent to your email.</p>:<><label className="field">New password<input name="password" type="password" required minLength={8}/></label><label className="field">Confirm password<input name="confirm" type="password" required minLength={8}/></label><Button disabled={busy}>Update password</Button></>}</form></div>}
