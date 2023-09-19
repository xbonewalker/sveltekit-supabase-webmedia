import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title,slug');

  if (error) {
    console.log(error);
    throw svelteKitError(500, 'Internal Error!');
  }

  return {
    articles
  };
}) satisfies PageServerLoad;
