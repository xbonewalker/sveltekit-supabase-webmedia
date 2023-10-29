create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  username text not null unique,
  first_name text,
  last_name text,
  role_id bigint not null default 2 references public.roles,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);

alter table public.profiles enable row level security;

create policy "Enable all actions for users based on id" on public.profiles
as permissive for all
to public
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Enable read access for all users" on public.profiles
as permissive for select
to public
using (true);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
