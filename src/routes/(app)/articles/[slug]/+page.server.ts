import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { getSession, supabase }, params, request }) => {
  let fields = 'content1';

  const referer = request.headers.get('referer');

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,username,profiles(first_name,last_name),created_at,updated_at,tags(name)';
  }

  const session = await getSession();

  if (session) {
    fields += ',content2';
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select(fields as '*,profiles(first_name,last_name),tags(name)')
    .eq('slug', params.slug);

  if (error) {
    console.log(error);
    throw svelteKitError(500, 'Internal Error!');
  }

  if (!articles.length) {
    throw svelteKitError(404, 'Not found');
  }

  return {
    article: articles[0]
  };
}) satisfies PageServerLoad;
