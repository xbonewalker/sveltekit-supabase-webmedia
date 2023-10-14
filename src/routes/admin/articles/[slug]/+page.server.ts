import { error as svelteKitError, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';

import type { Actions, PageServerLoad } from './$types';

import type { Errors } from '$lib/server/validation';
import type { Article, TablesUpdate } from '$lib/database.types';

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

export const actions = {
  default: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData();

    const { id, title, slug, content1, content2, ...rest } = Object.fromEntries(formData);

    if (!id) {
      console.log('Article ID is missing');
      throw svelteKitError(400, 'Bad Request!');
    }

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw svelteKitError(400, 'Bad Request!');
    }

    if (!title && !slug && !content1 && !content2) {
      return;
    }

    type RequestData = {
      [K in keyof TablesUpdate<'articles'>]: any
    };

    // const requestData: RequestData = Object.fromEntries(Object.entries({
    //   title, slug, content1, content2
    // }).filter(([_, value]) => value));
    const requestData: RequestData = JSON.parse(JSON.stringify({
      title, slug, content1, content2
    }));

    let errors: Errors = {};

    Object.entries(requestData).forEach(([fieldName, value]) => {
      const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      if (typeof value !== 'string') {
        initializeErrorsByField(errors, fieldName);
        errors[fieldName].push('Invalid value');
      }
    });

    if (requestData.slug && !('slug' in errors)) {
      const count = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('slug', requestData.slug)
        .then(({ count, error }) => {
          if (error) {
            console.log(error);
            throw svelteKitError(500, 'Internal Error!');
          }
          return count;
        });

      if (count) {
        errors.slug = ['This slug already exists'];
      }
    }

    if (Object.keys(errors).length !== 0) {
      return fail(400, Object.assign(requestData, { errors }));
    }

    const updatedArticle = await supabase
      .from('articles')
      .update(requestData)
      .eq('id', id)
      .select('*,profile:profiles(first_name,last_name),tags(name)')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      });

    if (slug) {
      throw redirect(303, `/admin/articles/${slug}`);
    }

    const filtered = Object.entries(updatedArticle).filter(([key, _]) => (
      key !== 'user_id'
    ));
    const updatedArticleWithoutUserId = Object.fromEntries(filtered);

    return { article: updatedArticleWithoutUserId };
  }
} satisfies Actions;
