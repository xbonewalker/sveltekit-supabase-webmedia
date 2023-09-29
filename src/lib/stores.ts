import { writable } from 'svelte/store';

export interface Article {
  id: number;
  title: string;
  slug: string;
  username: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  tags: {
    name: string;
  }[];
}

export const article = writable<Article | undefined>(undefined);
