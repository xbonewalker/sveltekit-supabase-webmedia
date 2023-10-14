import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

import type { Article, TablesRow } from '$lib/database.types';

export const load = (async ({ locals: { getSignedInCreator, supabase }, url }) => {
  const tagName = url.searchParams.get('tag');

  const articles = tagName === null
    ? await supabase
      .from('articles')
      .select('id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(name)')
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      })
    : await supabase
      .from('tags')
      .select('articles(id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(name))')
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
