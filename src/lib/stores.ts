import { writable } from 'svelte/store';

import type { Article, ArticleWithoutContent } from './database.types';

export const storedArticle = writable<Article | undefined>(undefined);
export const storedArticleWithoutContent = writable<ArticleWithoutContent | undefined>(undefined);
