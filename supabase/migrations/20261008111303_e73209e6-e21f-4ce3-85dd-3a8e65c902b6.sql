drop policy "enrolled read notes" on storage.objects;
create policy "enrolled read released notes" on storage.objects for select to authenticated using(bucket_id='course-notes' and (public.has_role(auth.uid(),'admin') or exists(select 1 from public.lessons l where l.notes_path=name and public.has_active_enrollment(auth.uid(),l.course_id) and (l.available_from is null or l.available_from<=now()))));
create or replace function public.get_course_outline(_course_id uuid)
returns table(id uuid, lesson_position int, title text, title_mr text, duration_minutes int)
language sql stable security definer set search_path=public as $$
 select l.id,l.position,l.title,l.title_mr,l.duration_minutes from public.lessons l join public.courses c on c.id=l.course_id where l.course_id=_course_id and c.published order by l.position $$;
