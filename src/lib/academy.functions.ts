import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getCatalog = createServerFn({method:'GET'}).handler(async () => {
 const url=process.env['SUPABASE_URL']; const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url || !key) throw new Error('Course service is unavailable.');
 const db=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization'); h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const [courses,sessions,posts,faqs,articles,announcements]=await Promise.all([
 db.from('courses').select('*').eq('published',true).order('created_at'),db.from('course_sessions').select('*, courses(title,slug)').order('starts_at'),db.from('blog_posts').select('*').order('published_at',{ascending:false}),db.from('faqs').select('*').order('position'),db.from('kb_articles').select('*'),db.from('announcements').select('*').order('created_at',{ascending:false})]);
 for(const r of [courses,sessions,posts,faqs,articles,announcements]) if(r.error)throw new Error('Unable to load academy content. Please try again.');
 return {courses:courses.data??[],sessions:sessions.data??[],posts:posts.data??[],faqs:faqs.data??[],articles:articles.data??[],announcements:announcements.data??[]};
});
export const getOutline=createServerFn({method:'GET'}).inputValidator(z.object({id:z.string().uuid()})).handler(async({data})=>{
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY']; if(!url||!key)throw new Error('Service unavailable');
 const db=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_'))h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const r=await db.rpc('get_course_outline',{_course_id:data.id}); if(r.error)throw new Error('Unable to load outline');return r.data;
});
export const getStudent=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabase:db,userId}=context;
 const [enrollments,progress]=await Promise.all([db.from('enrollments').select('*, courses(*)').eq('user_id',userId),db.from('lesson_progress').select('*').eq('user_id',userId)]);
 if(enrollments.error||progress.error)throw new Error('Unable to load your courses.');
 return {enrollments:enrollments.data??[],progress:progress.data??[]};
});
export const requestEnrollment=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({courseId:z.string().uuid(),reference:z.string().trim().min(2).max(200)})).handler(async({data,context})=>{
 const r=await context.supabase.from('enrollments').insert({course_id:data.courseId,user_id:context.userId,payment_ref:data.reference});if(r.error)throw new Error(r.error.code==='23505'?'You already requested this course.':'Unable to submit enrollment.');return {ok:true};
});
export const getLearning=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(z.object({courseId:z.string().uuid()})).handler(async({data,context})=>{
 const db=context.supabase;
 const access=await db.from('enrollments').select('*').eq('user_id',context.userId).eq('course_id',data.courseId).eq('status','approved').maybeSingle();
 if(!access.data || (access.data.access_until && new Date(access.data.access_until)<=new Date()))throw new Error('Your course access is inactive or has expired.');
 const lessons=await db.from('lessons').select('*').eq('course_id',data.courseId).order('position');if(lessons.error)throw new Error('Unable to load lessons');
 // Do not return recordings or notes before scheduled release.
 return (lessons.data??[]).map(l=>l.available_from && new Date(l.available_from)>new Date()?{...l,video_url:null,audio_url:null,notes_path:null}:l);
});
export const completeLesson=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({lessonId:z.string().uuid()})).handler(async({data,context})=>{
 const lesson=await context.supabase.from('lessons').select('id, available_from').eq('id',data.lessonId).maybeSingle();if(!lesson.data|| (lesson.data.available_from && new Date(lesson.data.available_from)>new Date()))throw new Error('Lesson unavailable');
 const r=await context.supabase.from('lesson_progress').upsert({user_id:context.userId,lesson_id:data.lessonId});if(r.error)throw new Error('Unable to save progress');return {ok:true};
});
export const downloadNotes=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({lessonId:z.string().uuid()})).handler(async({data,context})=>{
 const r=await context.supabase.from('lessons').select('notes_path,available_from').eq('id',data.lessonId).maybeSingle();if(!r.data?.notes_path || (r.data.available_from && new Date(r.data.available_from)>new Date()))throw new Error('Notes unavailable');
 const link=await context.supabase.storage.from('course-notes').createSignedUrl(r.data.notes_path,60,{download:true});if(link.error)throw new Error('Unable to download notes');return link.data.signedUrl;
});
export const sendContact=createServerFn({method:'POST'}).inputValidator(z.object({name:z.string().trim().min(1).max(120),email:z.string().email().max(200),message:z.string().trim().min(5).max(4000)})).handler(async({data})=>{
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!url||!key)throw new Error('Service unavailable');
 const db=createClient<Database>(url,key,{auth:{persistSession:false}});const r=await db.from('contact_messages').insert(data);if(r.error)throw new Error('Message could not be sent');return {ok:true};
});
export const getAdmin=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Administrator access required');
 const db=context.supabase;
 const [enrollments,profiles,courses,lessons,sessions,messages]=await Promise.all([db.from('enrollments').select('*, courses(title,access_days)'),db.from('profiles').select('*'),db.from('courses').select('*'),db.from('lessons').select('*').order('position'),db.from('course_sessions').select('*'),db.from('contact_messages').select('*').order('created_at',{ascending:false})]);
 for(const r of [enrollments,profiles,courses,lessons,sessions,messages])if(r.error)throw new Error('Unable to load administration');
 return {enrollments:enrollments.data??[],profiles:profiles.data??[],courses:courses.data??[],lessons:lessons.data??[],sessions:sessions.data??[],messages:messages.data??[]};
});
export const approveEnrollment=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),status:z.enum(['approved','rejected']),days:z.number().int().min(1).max(3650)})).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Administrator access required');
 const r=await context.supabase.from('enrollments').update({status:data.status,access_until:data.status==='approved'?new Date(Date.now()+data.days*86400000).toISOString():null}).eq('id',data.id);if(r.error)throw new Error('Unable to update enrollment');return {ok:true};
});
const media=z.string().url().refine(s=>{const u=new URL(s);return u.protocol==='https:'&&(u.hostname==='player.vimeo.com'||u.hostname==='iframe.mediadelivery.net');},'Use a Vimeo or Bunny embed URL').or(z.literal(''));
export const saveAdmin=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.discriminatedUnion('type',[
 z.object({type:z.literal('course'),id:z.string().uuid().optional(),title:z.string().min(2),title_mr:z.string(),slug:z.string().regex(/^[a-z0-9-]+$/),summary:z.string().min(5),summary_mr:z.string(),fee_inr:z.number().int().min(0),access_days:z.number().int().min(1),level:z.string(),mode:z.string(),duration_weeks:z.number().int().min(1)}),
 z.object({type:z.literal('lesson'),id:z.string().uuid().optional(),course_id:z.string().uuid(),title:z.string().min(2),title_mr:z.string(),position:z.number().int().min(1),duration_minutes:z.number().int().min(1),video_url:media,audio_url:z.string().url().or(z.literal('')),available_from:z.string().nullable(),notes_path:z.string().nullable()}),
 z.object({type:z.literal('session'),id:z.string().uuid().optional(),course_id:z.string().uuid(),title:z.string().min(2),session_type:z.string(),starts_at:z.string(),duration_minutes:z.number().int().min(1),seats_total:z.number().int().min(1),seats_booked:z.number().int().min(0),location:z.string().min(2)}),
 z.object({type:z.literal('announcement'),title:z.string().min(2),title_mr:z.string(),body:z.string().min(5),pinned:z.boolean()}),
 z.object({type:z.literal('blog'),title:z.string().min(2),slug:z.string().regex(/^[a-z0-9-]+$/),excerpt:z.string().min(5),body:z.string().min(5),category:z.string().min(2)}),
 z.object({type:z.literal('faq'),question:z.string().min(2),question_mr:z.string(),answer:z.string().min(5),category:z.string()}),
 z.object({type:z.literal('knowledge'),title:z.string().min(2),slug:z.string().regex(/^[a-z0-9-]+$/),summary:z.string().min(5),body:z.string().min(5),category:z.string()})
])).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Administrator access required');const db=context.supabase;
 let error;
 switch(data.type){
 case 'course':{const {type,...p}=data;({error}=await db.from('courses').upsert(p));break;}
 case 'lesson':{const {type,...p}=data;({error}=await db.from('lessons').upsert({...p,video_url:p.video_url||null,audio_url:p.audio_url||null}));break;}
 case 'session':{const {type,...p}=data;if(p.seats_booked>p.seats_total)throw new Error('Booked seats exceed capacity');({error}=await db.from('course_sessions').upsert(p));break;}
 case 'announcement':{const {type,...p}=data;({error}=await db.from('announcements').insert(p));break;}
 case 'blog':{const {type,...p}=data;({error}=await db.from('blog_posts').insert(p));break;}
 case 'faq':{const {type,...p}=data;({error}=await db.from('faqs').insert(p));break;}
 case 'knowledge':{const {type,...p}=data;({error}=await db.from('kb_articles').insert(p));break;}
 }
 if(error)throw new Error('Unable to save. Check required fields and unique slugs.');return {ok:true};
});
