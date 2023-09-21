import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { getSession, supabase }, params, request }) => {
  let fields = 'content1';

  const referer = request.headers.get('referer');

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,user_id,created_at,updated_at';
  }

  const session = await getSession();

  if (session) {
    fields += ',content2';
  }

  const { data: article, error } = await supabase
    .from('articles')
    .select(fields as '*')
    .eq('slug', params.slug)
    .single();

  if (error) {
    console.log(error);
    throw svelteKitError(500, 'Internal Error!');
  }

  return {
    article
  };
}) satisfies PageServerLoad;
