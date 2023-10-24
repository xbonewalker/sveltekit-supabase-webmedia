create table public.articles_tags (
  article_id bigint not null references public.articles on delete cascade,
  tag_id bigint not null references public.tags on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (article_id, tag_id)
);

create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.articles_tags
  for each row execute procedure moddatetime (updated_at);
