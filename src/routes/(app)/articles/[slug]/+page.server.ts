import { ArticlesHandler } from '$lib/server/supabase/articlesHandler';

import type { PageServerLoad } from './$types';

import type { Article, TablesRow } from '$lib/database.types';

export const load = (async ({
  locals: { getSession, getSignedInCreator, supabase },
  params,
  request
}) => {
  let fields = 'content1';

  const referer = request.headers.get('referer');

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,slug,username,created_at,updated_at,' +
        'tags(id,name),profile:profiles(first_name,last_name)';
  }

  const session = await getSession();

  if (session) {
    fields += ',content2';
  }

  const articlesHandler = new ArticlesHandler(supabase);
  const article = await articlesHandler.get(fields, { slug: params.slug });

  const signedInCreator = await getSignedInCreator();

  return {
    article: article as Article | Pick<Article, 'content1' | 'content2'> | Omit<Article, 'content2'> | Pick<Article, 'content1'>,
    signedInCreator: signedInCreator as Pick<TablesRow<'profiles'>, 'username'>
  };
}) satisfies PageServerLoad;
