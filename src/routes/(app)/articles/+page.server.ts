import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase }, url }) => {
  const tagName = url.searchParams.get('tag');

  const articles = tagName === null
    ? await supabase
      .from('articles')
      .select('id,title,slug,user_id,created_at,updated_at,tags(name)')
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      })
    : await supabase
      .from('tags')
      .select('articles!inner(id,title,slug,user_id,created_at,updated_at,tags(name))')
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

  return {
    articles
  };
}) satisfies PageServerLoad;
