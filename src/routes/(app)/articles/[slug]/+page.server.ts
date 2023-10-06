import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

import type { Article, Tables } from '$lib/types';

export const load = (async ({ locals: { getSession, getSignedInCreator, supabase }, params, request }) => {
  let fields = 'content1';

  const referer = request.headers.get('referer');

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(name)';
  }

  const session = await getSession();

  if (session) {
    fields += ',content2';
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select(fields as '*,profile:profiles(first_name,last_name),tags(name)')
    .eq('slug', params.slug);

  if (error) {
    console.log(error);
    throw svelteKitError(500, 'Internal Error!');
  }

  if (!articles.length) {
    throw svelteKitError(404, 'Not found');
  }

  const signedInCreator = await getSignedInCreator();

  return {
    article: articles[0] as Article | Pick<Article, 'content1' | 'content2'> | Omit<Article, 'content2'> | Pick<Article, 'content1'>,
    signedInCreator: signedInCreator as Pick<Tables<'profiles'>, 'username'>
  };
}) satisfies PageServerLoad;
