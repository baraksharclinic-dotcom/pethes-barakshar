drop policy "enrolled read lessons" on public.lessons;
create policy "enrolled read released lessons" on public.lessons for select to authenticated using ((public.has_active_enrollment(auth.uid(),course_id) and (available_from is null or available_from<=now())) or public.has_role(auth.uid(),'admin'));
drop policy "own progress" on public.lesson_progress;
create policy "own progress read" on public.lesson_progress for select to authenticated using(user_id=auth.uid());
create policy "own progress create" on public.lesson_progress for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.lessons where id=lesson_id));
create policy "own progress update" on public.lesson_progress for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.lessons where id=lesson_id));
grant update on public.lesson_progress to authenticated;
create policy "own progress delete" on public.lesson_progress for delete to authenticated using(user_id=auth.uid());
create policy "admin profile reads" on public.profiles for select to authenticated using(public.has_role(auth.uid(),'admin'));
