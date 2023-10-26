import { error } from '@sveltejs/kit';

import { ArticlesHandler } from '$lib/server/supabase/articlesHandler';
import { TagsHandler } from '$lib/server/supabase/tagsHandler';

import type { Actions, PageServerLoad } from './$types';

import type { Article, TablesRow } from '$lib/database.types';

export const load = (async ({ locals: { getSignedInCreator, supabase }, url }) => {
  const tagName = url.searchParams.get('tag');

  const articlesHandler = new ArticlesHandler(supabase);
  const tagsHandler = new TagsHandler(supabase);

  const articles = tagName === null
    ? await articlesHandler.getList()
    : await tagsHandler.getArticleList(tagName);

  const signedInCreator = await getSignedInCreator();

  return {
    articles: articles as Omit<Article, 'content1' | 'content2'>[],
    signedInCreator: signedInCreator as Pick<TablesRow<'profiles'>, 'username'>
  };
}) satisfies PageServerLoad;

export const actions = {
  deleteArticle: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData();

    const { id, ...rest } = Object.fromEntries(formData);

    if (!id) {
      console.log('Article ID is missing');
      throw error(400, 'Bad Request!');
    }

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw error(400, 'Bad Request!');
    }

    const articlesHandler = new ArticlesHandler(supabase);

    const tagIds = await articlesHandler.getTagIds(Number(id));

    await articlesHandler.delete(Number(id));

    const tagsHandler = new TagsHandler(supabase);

    const tagsWithArticlesCount = await tagsHandler.getArticlesCounts(tagIds);

    // forEach cannot be used here.
    await (async () => {
      for (const tag of tagsWithArticlesCount) {
        if (!('count' in tag.articles[0])) {
          throw new Error('The return value of getArticlesCounts() is invalid.');
        }
        if (tag.articles[0].count === 0) {
          await tagsHandler.delete(tag.id);
        }
      }
    })();
  }
} satisfies Actions;
