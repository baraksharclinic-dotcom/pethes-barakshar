
create type public.app_role as enum ('admin','student');
create type public.enrollment_status as enum ('pending','approved','rejected');

create or replace function public.update_updated_at_column() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, phone text, city text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id=auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id=auth.uid());
create trigger profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, full_name, phone) values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  insert into public.user_roles(user_id, role) values (new.id, 'student');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null, title_mr text,
  summary text not null, summary_mr text,
  description text, level text not null default 'Beginner',
  mode text not null default 'Online', duration_weeks int not null default 8,
  fee_inr int not null default 0, access_days int not null default 180,
  instructor text not null default 'Dr. Pethe',
  published boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select on public.courses to anon, authenticated; grant insert, update, delete on public.courses to authenticated; grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "published courses public" on public.courses for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin manage courses" on public.courses for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger courses_updated before update on public.courses for each row execute function public.update_updated_at_column();

-- calendar sessions
create table public.course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null, session_type text not null default 'Live Class',
  starts_at timestamptz not null, duration_minutes int not null default 90,
  location text not null default 'Online (Zoom)', seats_total int not null default 40,
  seats_booked int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.course_sessions to anon, authenticated; grant insert, update, delete on public.course_sessions to authenticated; grant all on public.course_sessions to service_role;
alter table public.course_sessions enable row level security;
create policy "sessions public" on public.course_sessions for select using (true);
create policy "admin manage sessions" on public.course_sessions for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, course_id uuid not null references public.courses(id) on delete cascade,
  status enrollment_status not null default 'pending',
  payment_ref text, note text,
  access_until timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id, course_id)
);
grant select, insert, update, delete on public.enrollments to authenticated; grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;
create policy "own enrollments read" on public.enrollments for select to authenticated using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "request enrollment" on public.enrollments for insert to authenticated with check (user_id=auth.uid() and status='pending' and access_until is null);
create policy "admin manage enrollments" on public.enrollments for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete enrollments" on public.enrollments for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger enrollments_updated before update on public.enrollments for each row execute function public.update_updated_at_column();

create or replace function public.has_active_enrollment(_user_id uuid, _course_id uuid) returns boolean
language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.enrollments where user_id=_user_id and course_id=_course_id
    and status='approved' and (access_until is null or access_until > now())) $$;

-- lessons (media protected)
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  position int not null default 1,
  title text not null, title_mr text, summary text,
  duration_minutes int not null default 45,
  video_url text, audio_url text, notes_path text,
  available_from timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.lessons to authenticated; grant all on public.lessons to service_role;
alter table public.lessons enable row level security;
create policy "enrolled read lessons" on public.lessons for select to authenticated using (public.has_active_enrollment(auth.uid(), course_id) or public.has_role(auth.uid(),'admin'));
create policy "admin manage lessons" on public.lessons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger lessons_updated before update on public.lessons for each row execute function public.update_updated_at_column();

create or replace function public.get_course_outline(_course_id uuid)
returns table(id uuid, lesson_position int, title text, title_mr text, duration_minutes int)
language sql stable security definer set search_path=public as $$
  select id, position, title, title_mr, duration_minutes from public.lessons where course_id=_course_id order by position $$;
grant execute on function public.get_course_outline(uuid) to anon, authenticated;

-- progress
create table public.lesson_progress (
  user_id uuid not null, lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(), primary key(user_id, lesson_id)
);
grant select, insert, delete on public.lesson_progress to authenticated; grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "own progress" on public.lesson_progress for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- content
create table public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, title_mr text, body text not null,
  pinned boolean not null default false, created_at timestamptz not null default now());
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  excerpt text not null, body text not null, category text not null default 'Education',
  author text not null default 'Dr. Pethe', read_minutes int not null default 5,
  published_at timestamptz not null default now());
create table public.faqs (
  id uuid primary key default gen_random_uuid(), question text not null, question_mr text, answer text not null,
  category text not null default 'General', position int not null default 0);
create table public.kb_articles (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  category text not null, summary text not null, body text not null, created_at timestamptz not null default now());
do $$ declare t text; begin
  foreach t in array array['announcements','blog_posts','faqs','kb_articles'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop; end $$;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, phone text,
  message text not null, created_at timestamptz not null default now());
grant insert on public.contact_messages to anon, authenticated; grant select, delete on public.contact_messages to authenticated; grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (length(name) between 1 and 120 and length(email) between 3 and 200 and length(message) between 1 and 4000);
create policy "admin reads messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin deletes messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- storage policies for notes bucket (bucket: course-notes, path {course_id}/file.pdf)
create policy "enrolled read notes" on storage.objects for select to authenticated using (
  bucket_id='course-notes' and (public.has_role(auth.uid(),'admin') or public.has_active_enrollment(auth.uid(), ((storage.foldername(name))[1])::uuid)));
create policy "admin upload notes" on storage.objects for insert to authenticated with check (bucket_id='course-notes' and public.has_role(auth.uid(),'admin'));
create policy "admin update notes" on storage.objects for update to authenticated using (bucket_id='course-notes' and public.has_role(auth.uid(),'admin'));
create policy "admin delete notes" on storage.objects for delete to authenticated using (bucket_id='course-notes' and public.has_role(auth.uid(),'admin'));

-- SEED
insert into public.courses (id, slug, title, title_mr, summary, summary_mr, description, level, mode, duration_weeks, fee_inr, access_days) values
('11111111-1111-1111-1111-111111111111','foundation-biochemic','Foundation Course in Biochemic Medicine','बायोकेमिक औषधशास्त्र पायाभूत अभ्यासक्रम','The 12 tissue salts of Dr. Schuessler, explained from first principles.','डॉ. शुस्लर यांच्या १२ टिश्यू सॉल्ट्सचा मूलभूत अभ्यास.','A structured introduction to the twelve cell salts, their physiology, keynote symptoms and safe household use. Ideal for beginners, wellness practitioners and families.','Beginner','Online + Recorded',8,4500,180),
('22222222-2222-2222-2222-222222222222','advanced-clinical-biochemic','Advanced Clinical Biochemic Practice','प्रगत क्लिनिकल बायोकेमिक प्रॅक्टिस','Case-taking, combinations and chronic case management.','केस-टेकिंग, संयोजने आणि दीर्घकालीन आजार व्यवस्थापन.','For practitioners who have completed the foundation course. Real case studies, repertory work and combination remedies with live Q&A.','Advanced','Online Live',12,9500,365),
('33333333-3333-3333-3333-333333333333','biochemic-for-women-children','Biochemic Care for Women & Children','स्त्रिया व मुलांसाठी बायोकेमिक उपचार','Gentle tissue-salt support across life stages.','जीवनाच्या प्रत्येक टप्प्यावर सौम्य उपचार.','Covers growth, teething, menstrual health, pregnancy support and menopause with practical dosage guidance.','Intermediate','Recorded',6,3500,120),
('44444444-4444-4444-4444-444444444444','barakshar-weekend-workshop','Barakshar Weekend Workshop (Pune)','बाराक्षार वीकेंड कार्यशाळा (पुणे)','Two intensive in-person days with Dr. Pethe.','डॉ. पेठे यांच्यासोबत दोन दिवसांची प्रत्यक्ष कार्यशाळा.','An immersive classroom workshop with hands-on remedy preparation, demonstrations and certificate of participation.','All levels','In-person',1,2500,60);

insert into public.course_sessions (course_id, title, session_type, starts_at, duration_minutes, location, seats_total, seats_booked) values
('11111111-1111-1111-1111-111111111111','Orientation & History of Biochemic','Live Class', now() + interval '5 days', 90,'Online (Zoom)',60,42),
('11111111-1111-1111-1111-111111111111','Calc. Phos & Calc. Fluor','Live Class', now() + interval '12 days', 90,'Online (Zoom)',60,42),
('22222222-2222-2222-2222-222222222222','Case Clinic: Chronic Skin Conditions','Case Clinic', now() + interval '8 days', 120,'Online (Zoom)',30,27),
('22222222-2222-2222-2222-222222222222','Combination Remedies Masterclass','Masterclass', now() + interval '20 days', 120,'Online (Zoom)',30,12),
('33333333-3333-3333-3333-333333333333','Q&A: Teething and Childhood Fevers','Live Q&A', now() + interval '10 days', 60,'Online (Zoom)',100,35),
('44444444-4444-4444-4444-444444444444','Weekend Workshop — Day 1','Workshop', now() + interval '25 days', 360,'Pethe Clinic, Sadashiv Peth, Pune',35,31),
('44444444-4444-4444-4444-444444444444','Weekend Workshop — Day 2','Workshop', now() + interval '26 days', 360,'Pethe Clinic, Sadashiv Peth, Pune',35,31);

insert into public.lessons (course_id, position, title, title_mr, summary, duration_minutes, video_url, audio_url, available_from) values
('11111111-1111-1111-1111-111111111111',1,'What is Biochemic Medicine?','बायोकेमिक औषधशास्त्र म्हणजे काय?','Origins, Dr. Schuessler and the cell-salt theory.',42,'https://player.vimeo.com/video/76979871','https://player.vimeo.com/video/76979871',null),
('11111111-1111-1111-1111-111111111111',2,'The 12 Tissue Salts — Overview','१२ टिश्यू सॉल्ट्स — आढावा','A map of all twelve salts and their spheres of action.',55,'https://player.vimeo.com/video/76979871',null,null),
('11111111-1111-1111-1111-111111111111',3,'Calcarea Phosphorica in Depth','कॅल्केरिया फॉस्फोरिका सखोल','Bones, growth, convalescence.',48,'https://player.vimeo.com/video/76979871',null,now() + interval '7 days'),
('11111111-1111-1111-1111-111111111111',4,'Ferrum Phos & First-aid','फेरम फॉस व प्रथमोपचार','Inflammation, fever and acute care.',50,null,null,now() + interval '14 days'),
('22222222-2222-2222-2222-222222222222',1,'Art of Case-taking','केस-टेकिंगची कला','Structured interviews and keynotes.',65,'https://player.vimeo.com/video/76979871',null,null),
('22222222-2222-2222-2222-222222222222',2,'Combination Logic','संयोजनांचे तर्कशास्त्र','When and how to combine salts.',58,'https://player.vimeo.com/video/76979871',null,null),
('33333333-3333-3333-3333-333333333333',1,'Teething & Growth','दात येणे व वाढ','Calc. Phos, Ferrum Phos and Mag. Phos for children.',40,'https://player.vimeo.com/video/76979871',null,null),
('44444444-4444-4444-4444-444444444444',1,'Workshop Pre-reading','कार्यशाळा पूर्ववाचन','What to prepare before attending.',20,null,null,null);

insert into public.announcements (title, title_mr, body, pinned, created_at) values
('New batch of Foundation Course starts soon','फाउंडेशन कोर्सची नवीन बॅच लवकरच','Registrations are open for the upcoming Foundation batch. Limited seats — enrol early.',true, now()),
('Weekend Workshop in Pune','पुण्यात वीकेंड कार्यशाळा','Our in-person Barakshar workshop is almost full. Only a few seats remain.',false, now() - interval '3 days'),
('Recorded lessons updated','रेकॉर्डेड धडे अद्ययावत','Lesson 2 of the Advanced course now includes downloadable case sheets.',false, now() - interval '9 days');

insert into public.blog_posts (slug, title, excerpt, body, category, read_minutes, published_at) values
('understanding-the-12-cell-salts','Understanding the 12 Cell Salts','A beginner-friendly tour of Schuessler''s twelve tissue salts and why they matter.','Dr. Wilhelm Heinrich Schuessler proposed that twelve inorganic mineral salts are essential to the healthy functioning of cells.

In Biochemic practice — known in Maharashtra as Barakshar (बाराक्षार) — each salt is linked to particular tissues and patterns of symptoms.

In this article we introduce each salt briefly, explain potency (commonly 6X and 12X), and share how students begin learning keynote indications.','Fundamentals',6, now() - interval '4 days'),
('biochemic-first-aid-kit','Building a Biochemic Home First-aid Kit','Five tissue salts every household learner should know about.','Ferrum Phos, Kali Mur, Mag Phos, Nat Mur and Silicea form the core of many home kits.

This educational overview explains what students study about each, and why professional guidance remains essential for any health concern.','Practical',5, now() - interval '12 days'),
('history-of-barakshar-in-india','The History of Barakshar in India','How Biochemic medicine travelled from Germany to homes across Maharashtra.','Biochemic medicine reached India in the late 19th century and found a natural home alongside homoeopathy.

Pethe''s family has taught Barakshar for generations, building a community of thousands of students.','History',7, now() - interval '20 days');

insert into public.faqs (question, question_mr, answer, category, position) values
('Who can join the courses?','अभ्यासक्रमात कोण सहभागी होऊ शकतो?','Anyone interested in learning Biochemic medicine. The Foundation course needs no prior background; Advanced courses require the Foundation certificate.','Enrollment',1),
('How do I pay and get access?','पैसे कसे भरायचे व प्रवेश कसा मिळेल?','Request enrollment on the course page, then pay via UPI or bank transfer and enter the reference. Our team verifies payment and activates your access, usually within 24 hours.','Payments',2),
('How long can I access recordings?','रेकॉर्डिंग किती काळ पाहता येतील?','Each course has a fixed access period (for example 180 days) shown on the course page. Your dashboard shows the exact expiry date.','Access',3),
('Can I download the videos?','व्हिडिओ डाउनलोड करता येतील का?','Videos and audio are streamed securely and cannot be downloaded. Notes and PDFs can be downloaded for personal study.','Access',4),
('Are classes in English or Marathi?','वर्ग इंग्रजीत की मराठीत?','Most live classes are bilingual (Marathi and English). Notes are provided in both languages where available.','General',5),
('Do I get a certificate?','प्रमाणपत्र मिळेल का?','Yes, a certificate of completion is issued once you finish all lessons and attend the final assessment.','General',6),
('What if I miss a live class?','लाइव्ह वर्ग चुकला तर?','Every live class is recorded and added to your course within 48 hours.','Access',7),
('Is this a substitute for medical advice?','हा वैद्यकीय सल्ल्याचा पर्याय आहे का?','No. Our courses are educational. Always consult a qualified practitioner for any health condition.','General',8);

insert into public.kb_articles (slug, title, category, summary, body) values
('calcarea-fluorica','Calcarea Fluorica (Calc. Fluor)','Tissue Salts','The salt of elasticity — connective tissue, enamel and vessels.','Calcarea Fluorica is traditionally associated with elastic fibres, tooth enamel and the surface of bones. Students study it in relation to loss of elasticity and hardness of tissues.'),
('calcarea-phosphorica','Calcarea Phosphorica (Calc. Phos)','Tissue Salts','The cell-building salt for bones and growth.','Calc. Phos is the most abundant mineral salt in the body and is studied in relation to growth, bone formation and convalescence.'),
('ferrum-phosphoricum','Ferrum Phosphoricum (Ferrum Phos)','Tissue Salts','The first-aid salt for the first stage of inflammation.','Ferrum Phos is studied as the remedy of the initial inflammatory stage: heat, redness and mild fever.'),
('understanding-potency','Understanding Potency: 3X, 6X, 12X','Basics','What decimal potencies mean and why 6X is common.','Biochemic salts are triturated in decimal potencies. 6X means six successive 1:10 dilutions with lactose.'),
('how-to-study-keynotes','How to Study Keynote Symptoms','Study Skills','A method for memorising characteristic indications.','Use flashcards, group salts by tissue, and revisit with real case examples from class.');
