create table public.articles (
  id bigint generated by default as identity primary key,
  title text not null,
  slug text not null unique,
  content1 text not null,
  content2 text not null,
  user_id uuid not null,
  username text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint articles_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint articles_username_fkey foreign key (username) references profiles (username)
);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.articles
  for each row execute procedure moddatetime (updated_at);

alter table public.profiles enable row level security;

create policy "Enable all actions for users based on user_id" on public.articles
as permissive for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Enable read access for all users" on public.articles
as permissive for select
to public
using (true);
