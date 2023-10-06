import { error as svelteKitError } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

import type { Article } from '$lib/types';

export const load = (async ({ locals: { getSession, supabase }, params, request }) => {
  const session = await getSession();

  if (!session) {
    console.log('Protected routes error');
    throw svelteKitError(500, 'Internal Error!');
  }

  const referer = request.headers.get('referer');

  if (referer === `http://localhost:5173/articles/${params.slug}`) {
    return {
      article: {}
    };
  }

  let fields = 'content1,content2';

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(name)';
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select(fields as '*,profile:profiles(first_name,last_name),tags(name)')
    .match({ slug: params.slug, user_id: session.user.id });

  if (error) {
    console.log(error);
    throw svelteKitError(500, 'Internal Error!');
  }

  if (!articles.length) {
    throw svelteKitError(404, 'Not found');
  }

  return {
    article: articles[0] as Article | Pick<Article, 'content1' | 'content2'>
  };
}) satisfies PageServerLoad;
