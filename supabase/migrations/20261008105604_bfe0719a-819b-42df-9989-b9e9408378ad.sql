drop policy "published courses public" on public.courses;
create policy "published courses anon" on public.courses for select to anon using (published);
create policy "courses authenticated read" on public.courses for select to authenticated using (published or public.has_role(auth.uid(),'admin'));