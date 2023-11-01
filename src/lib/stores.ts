import { writable } from 'svelte/store';

import type { ChangeEventHandler } from 'svelte/elements';

import type { Article, ArticleWithoutContent } from '$lib/database.types';
import type { Errors } from '$lib/server/validation';

export const article = writable<Article | undefined>(undefined);
export const articleWithoutContent = writable<ArticleWithoutContent | undefined>(undefined);

export const form = writable<Record<string, unknown> & { errors?: Errors } | null>(null);
export const formValues = writable<Record<string, number | string> | undefined>(undefined);

type ChangedElement = HTMLInputElement | HTMLTextAreaElement;
export const handleChange = writable<ChangeEventHandler<ChangedElement> | undefined>(undefined);
