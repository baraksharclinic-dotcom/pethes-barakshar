alter table public.enrollments add column registration_name text, add column mobile text, add column gender text, add column age integer, add column address text;
create or replace function public.validate_course_registration() returns trigger language plpgsql set search_path=public as $$
begin
 if TG_OP='INSERT' or new.registration_name is distinct from old.registration_name or new.mobile is distinct from old.mobile or new.gender is distinct from old.gender or new.age is distinct from old.age or new.address is distinct from old.address then
 if new.registration_name is null or length(trim(new.registration_name)) not between 2 and 120 then raise exception 'Name must contain 2 to 120 characters'; end if;
 if new.mobile is null or new.mobile !~ '^\+?[0-9]{10,15}$' then raise exception 'Enter a valid mobile number'; end if;
 if new.gender is null or new.gender not in ('female','male','other','prefer_not_to_say') then raise exception 'Select gender'; end if;
 if new.age is null or new.age not between 1 and 120 then raise exception 'Enter age between 1 and 120'; end if;
 if new.address is null or length(trim(new.address)) not between 5 and 1000 then raise exception 'Address must contain 5 to 1000 characters'; end if;
 end if;
 return new;
end $$;
create trigger validate_course_registration before insert or update on public.enrollments for each row execute function public.validate_course_registration();