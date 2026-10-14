alter table public.blog_posts add column if not exists image_url text;
create table public.resource_settings (
  id int primary key default 1 check (id = 1),
  video_title text not null, video_summary text not null, video_url text not null,
  video_duration text, channel_url text, updated_at timestamptz not null default now());
grant select on public.resource_settings to anon, authenticated;
grant insert, update on public.resource_settings to authenticated;
grant all on public.resource_settings to service_role;
alter table public.resource_settings enable row level security;
create policy "public read" on public.resource_settings for select using (true);
create policy "admin write" on public.resource_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create table public.resource_links (
  id uuid primary key default gen_random_uuid(), title text not null, subtitle text not null default '',
  url text not null, icon text not null default 'link', position int not null default 0,
  created_at timestamptz not null default now());
grant select on public.resource_links to anon, authenticated;
grant insert, update, delete on public.resource_links to authenticated;
grant all on public.resource_links to service_role;
alter table public.resource_links enable row level security;
create policy "public read" on public.resource_links for select using (true);
create policy "admin write" on public.resource_links for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.resource_settings (id, video_title, video_summary, video_url, video_duration, channel_url) values
 (1,'Understanding the Twelve Tissue Salts','A short and simple introduction to the 12 tissue salts and their role in holistic health.','https://www.youtube.com/watch?v=dQw4w9WgXcQ','12:45','https://www.youtube.com/');
insert into public.resource_links (title, subtitle, url, icon, position) values
 ('Barakshar YouTube Channel','Watch all videos','https://www.youtube.com/','youtube',1),
 ('Downloadable Resources','PDFs, guides, charts','/knowledge','file',2),
 ('Recommended Reading','Books & articles','/blog','book',3),
 ('External Resources','Useful websites','/faq','link',4);