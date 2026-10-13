import {createFileRoute} from '@tanstack/react-router';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useState} from 'react';
import {toast} from 'sonner';
import {Lock,CheckCircle2,Folder,FileText,Headphones} from 'lucide-react';
import {getLearning,getStudent,completeLesson,getListeningProgress,saveListeningProgress} from '@/lib/academy.functions';
import {pageHead,dateIST} from '@/lib/academy';
import {Button} from '@/components/ui/button';
import {AudioPlayer} from '@/components/academy/AudioPlayer';
import {Loading} from '@/components/academy/shared';
import {useLang,pick} from '@/lib/i18n';
export const Route=createFileRoute('/_authenticated/learn/$courseId')({head:()=>pageHead('Course recordings and files','Listen to course recordings, view study files and resume your learning progress.'),component:Learning});
function Learning(){
 const {courseId}=Route.useParams();const load=useServerFn(getLearning);const student=useServerFn(getStudent);const complete=useServerFn(completeLesson);const progress=useServerFn(getListeningProgress);const save=useServerFn(saveListeningProgress);
 const {data:lessons,isLoading,error}=useQuery({queryKey:['learning',courseId],queryFn:()=>load({data:{courseId}})});
 const {data:state}=useQuery({queryKey:['student'],queryFn:()=>student()});
 const {data:listening,isLoading:progressLoading}=useQuery({queryKey:['listening'],queryFn:()=>progress()});
 const [selected,setSelected]=useState('');const [section,setSection]=useState<'recordings'|'files'>('recordings');const qc=useQueryClient();const {lang}=useLang();
 if(isLoading||progressLoading)return <Loading/>;
 if(error)return <div className="container-page py-20"><h1 className="text-3xl">Course access unavailable</h1><p className="mt-4">{error.message}</p></div>;
 const active=lessons?.find(l=>l.id===selected)??lessons?.[0];const done=new Set(state?.progress.map(p=>p.lesson_id));const completed=lessons?.filter(l=>done.has(l.id)).length??0;const pct=lessons?.length?Math.round(completed/lessons.length*100):0;
 const c=state?.openCourses.find(c=>c.id===courseId)??state?.enrollments.find(e=>e.course_id===courseId)?.courses;
 const markComplete=async(id:string)=>{await complete({data:{lessonId:id}});await qc.invalidateQueries({queryKey:['student']});};
 const files=lessons?.filter(l=>l.notes_path?.startsWith('https://barakshar-cdn.b-cdn.net/')&&l.notes_path.split('?')[0]?.toLowerCase().endsWith('.pdf'))??[];
 return <div className="container-page py-10"><p className="text-sm font-bold uppercase text-primary">YOUR COURSE LIBRARY</p><h1 className="mt-3 break-words text-3xl">{c?pick(lang,c.title,c.title_mr):'Course lessons'}</h1><p className="mt-3 text-sm text-muted-foreground">{pct}% complete · {completed} lessons completed</p><progress value={pct} max={100} aria-label="Course completion" className="mt-3 h-2 w-full accent-primary"/>
 <nav className="mt-8 flex gap-3 border-b pb-4"><Button variant={section==='recordings'?'default':'ghost'} onClick={()=>setSection('recordings')}><Folder/>Recordings</Button><Button variant={section==='files'?'default':'ghost'} onClick={()=>setSection('files')}><FileText/>Files</Button></nav>
 {section==='files'?<section className="py-8"><h2 className="mb-6 text-2xl">Files</h2>{files.length?files.map(l=><div key={l.id} className="mb-8"><h3 className="mb-4 text-xl">{pick(lang,l.title,l.title_mr)}</h3><iframe title={`${l.title} PDF`} src={`${l.notes_path}#toolbar=0&navpanes=0`} className="h-[650px] w-full border"/></div>):<div className="border-b py-10"><FileText className="mb-4 text-primary"/><p className="text-lg">No PDFs added yet.</p><p className="mt-2 text-muted-foreground">Course study files will appear here.</p></div>}</section>:
 <div className="mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="min-w-0 border-b pb-5 lg:border-r lg:border-b-0 lg:pr-5"><h2 className="mb-4 flex items-center gap-2 text-xl"><Folder className="size-5"/>Recordings</h2>{lessons?.map(l=>{const locked=l.available_from&&new Date(l.available_from)>new Date();return <Button key={l.id} variant={active?.id===l.id?'secondary':'ghost'} className="mb-2 h-auto min-h-16 w-full justify-start whitespace-normal text-left" onClick={()=>{setSelected(l.id);}}>{locked?<Lock className="shrink-0"/>:done.has(l.id)?<CheckCircle2 className="shrink-0"/>:l.audio_url?<Headphones className="shrink-0"/>:<Headphones className="shrink-0"/>}<span className="min-w-0 break-words">{pick(lang,l.title,l.title_mr)}<span className="block text-xs font-normal text-muted-foreground">{done.has(l.id)?'Completed':l.audio_url?'Audio recording':`${l.duration_minutes} min`}</span></span></Button>})}</aside>
 <section className="min-w-0">{!active?<p>No recordings added yet.</p>:<><h2 className="mb-5 break-words text-2xl">{pick(lang,active.title,active.title_mr)}</h2>{active.available_from&&new Date(active.available_from)>new Date()?<div className="bg-secondary p-10"><Lock className="mb-4"/><p>Available from {dateIST(active.available_from)} IST.</p></div>:<>
  {active.audio_url?<AudioPlayer key={active.id} src={active.audio_url} title={pick(lang,active.title,active.title_mr)} initialPosition={listening?.find(p=>p.lesson_id===active.id)?.position_seconds??0} onRefreshSource={async()=>{const refreshed=await load({data:{courseId}});const source=refreshed.find(l=>l.id===active.id)?.audio_url;if(!source)throw new Error('Recording unavailable');qc.setQueryData(['learning',courseId],refreshed);return source;}} onSave={async(position,duration)=>{await save({data:{lessonId:active.id,position,duration}});qc.setQueryData(['listening'],(old:typeof listening)=>old?.map(p=>p.lesson_id===active.id?{...p,position_seconds:position,duration_seconds:duration}:p));}} onComplete={()=>markComplete(active.id)}/>:<p>Audio recording has not been added yet.</p>}
 <p className="mt-5 text-muted-foreground">{active.summary}</p><Button className="mt-6" disabled={done.has(active.id)} onClick={async()=>{try{await markComplete(active.id);toast.success('Progress saved');}catch{toast.error('Unable to save progress');}}}><CheckCircle2/>{done.has(active.id)?'Completed':'Mark complete'}</Button></>}</>}</section></div>}</div>;
}
