import { writable } from 'svelte/store';

import type { Article, ArticleWithoutContent } from '$lib/database.types';
import type { Errors } from '$lib/server/validation';

export const storedArticle = writable<Article | undefined>(undefined);
export const storedArticleWithoutContent = writable<ArticleWithoutContent | undefined>(undefined);

export const storedForm = writable<Record<string, unknown> & { errors?: Errors } | null>(null);
export const storedFormValues = writable<Record<string, number | string> | undefined>(undefined);
