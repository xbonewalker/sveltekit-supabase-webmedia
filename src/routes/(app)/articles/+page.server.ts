import { error as svelteKitError } from '@sveltejs/kit';

import type { Actions, PageServerLoad } from './$types';

import type { Article, TablesRow } from '$lib/database.types';

export const load = (async ({ locals: { getSignedInCreator, supabase }, url }) => {
  const tagName = url.searchParams.get('tag');

  const articles = tagName === null
    ? await supabase
      .from('articles')
      .select('id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(id,name)')
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      })
    : await supabase
      .from('tags')
      .select('articles(id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(id,name))')
      .eq('name', tagName)
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        if (!data.length) {
          throw svelteKitError(404, 'Not found');
        }
        return data[0].articles;
      });

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
      throw svelteKitError(400, 'Bad Request!');
    }

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw svelteKitError(400, 'Bad Request!');
    }

    const tags = await supabase
      .from('articles')
      .select('tags(id)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data.tags;
      });

    await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
      });

    const tagIds = tags.map((tag => tag.id));

    const tagsWithArticles = await supabase
      .from('tags')
      .select('id,articles(count)')
      .in('id', tagIds)
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      });

    await (async () => {
      for (const tag of tagsWithArticles) {
        if (!('count' in tag.articles[0])) {
          console.log('Removed tag information is incorrect');
          throw svelteKitError(500, 'Internal Error!');
        }
        if (tag.articles[0].count === 0) {
          await supabase
            .from('tags')
            .delete()
            .eq('id', tag.id)
            .then(({ error }) => {
              if (error) {
                console.log(error);
                throw svelteKitError(500, 'Internal Error!');
              }
            });
        }
      }
    })();
  }
} satisfies Actions;
