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

create policy "Enable read access for all users" on public.profiles
as permissive for select
to public
using (true);
