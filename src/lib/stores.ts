import { writable } from 'svelte/store';

export interface Article {
  id: number;
  title: string;
  slug: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags: {
    name: string;
  }[];
}

export const article = writable<Article | undefined>(undefined);
