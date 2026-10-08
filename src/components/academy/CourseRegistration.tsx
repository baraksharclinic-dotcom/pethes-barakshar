import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useLang,pick } from '@/lib/i18n';
import { requestEnrollment } from '@/lib/academy.functions';
import { registrationSchema } from '@/lib/registration-schema';
import type { Tables } from '@/integrations/supabase/types';
export function CourseRegistration({course,initialOpen=true}:{course:Tables<'courses'>;initialOpen?:boolean}){
 const [open,setOpen]=useState(initialOpen);const [sent,setSent]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const {session}=useAuth();const {lang}=useLang();const submit=useServerFn(requestEnrollment);const qc=useQueryClient();
 return <><Button className="w-full" onClick={()=>setOpen(true)}>{lang==='mr'?'अभ्यासक्रम नोंदणी':'Register for this course'}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{lang==='mr'?'अभ्यासक्रम नोंदणी':'Course registration'}</DialogTitle><DialogDescription>{lang==='mr'?'नोंदणी प्रशासकाच्या मंजुरीसाठी पाठवली जाईल.':'Submit your details for administrator approval.'}</DialogDescription></DialogHeader>{sent?<div role="status" className="space-y-4"><h3 className="text-xl">Registration submitted</h3><p>Your selected course is awaiting approval. Audio, notes and course content unlock after approval.</p><Button asChild><Link to="/dashboard">View my registrations</Link></Button></div>:<form className="space-y-4" onSubmit={async e=>{e.preventDefault();setError('');const f=new FormData(e.currentTarget);const parsed=registrationSchema.safeParse({courseId:course.id,name:f.get('name'),mobile:f.get('mobile'),gender:f.get('gender'),age:Number(f.get('age')),address:f.get('address'),reference:f.get('reference')??''});if(!parsed.success){setError(parsed.error.issues[0]?.message??'Check your details.');return;}if(!session){setError('Sign in before submitting your registration.');return;}setBusy(true);try{await submit({data:parsed.data});setSent(true);qc.invalidateQueries({queryKey:['student']});}catch(e){setError(e instanceof Error?e.message:'Unable to submit registration.')}finally{setBusy(false)}}}>
 <label className="field">{lang==='mr'?'निवडलेला अभ्यासक्रम':'Selected course'}<input readOnly value={pick(lang,course.title,course.title_mr)}/></label>
 <label className="field">{lang==='mr'?'पूर्ण नाव':'Full name'}<input name="name" required minLength={2} maxLength={120} autoComplete="name" defaultValue={session?.user.user_metadata['full_name']??''}/></label>
 <label className="field">{lang==='mr'?'मोबाइल नंबर':'Mobile number'}<input name="mobile" type="tel" inputMode="tel" autoComplete="tel" required pattern="\+?[0-9]{10,15}" maxLength={16} placeholder="e.g. +919876543210"/></label>
 <div className="grid grid-cols-2 gap-4"><label className="field">{lang==='mr'?'लिंग':'Gender'}<select aria-label={lang==='mr'?'लिंग':'Gender'} name="gender" required defaultValue=""><option value="" disabled>Select</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></select></label><label className="field">{lang==='mr'?'वय':'Age'}<input name="age" type="number" required min={1} max={120} step={1}/></label></div>
 <label className="field">{lang==='mr'?'पत्ता':'Address'}<textarea name="address" required minLength={5} maxLength={1000} autoComplete="street-address"/></label>
 <label className="field">Payment reference (optional)<input name="reference" maxLength={200}/></label>
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 {session?<Button className="w-full" disabled={busy}>{busy?'Submitting…':lang==='mr'?'मंजुरीसाठी पाठवा':'Submit for approval'}</Button>:<><p className="text-sm text-muted-foreground">Sign in or create your student account to submit this registration.</p><Button asChild className="w-full"><Link to="/auth" search={{course:course.slug}}>Sign in to register</Link></Button></>}
 </form>}</DialogContent></Dialog></>;
}
