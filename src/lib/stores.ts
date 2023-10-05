import { writable } from 'svelte/store';

import type { Article, ArticleWithoutContent } from './types';

export const storedArticle = writable<Article | undefined>(undefined);
export const storedArticleWithoutContent = writable<ArticleWithoutContent | undefined>(undefined);
