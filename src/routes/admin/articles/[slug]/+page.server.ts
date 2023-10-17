import { error as svelteKitError, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';

import type { Actions, PageServerLoad } from './$types';

import type { Errors } from '$lib/server/validation';
import type { Article, TablesUpdate } from '$lib/database.types';

export const load = (async ({ locals: { getSession, supabase }, params, request }) => {
  const session = await getSession();

  if (!session) {
    console.log('Admin routes are not protected');
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
    fields += ',id,title,slug,username,profile:profiles(first_name,last_name),created_at,updated_at,tags(id,name)';
  }

  const { data: articles, error } = await supabase
    .from('articles')
    .select(fields as '*,profile:profiles(first_name,last_name),tags(id,name)')
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
  updateArticle: async ({ locals: { supabase }, request }) => {
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
  },
  updateTags: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData();

    const { tags, articleId, ...rest } = Object.fromEntries(formData);

    if (!articleId || typeof articleId !== 'string' || isNaN(Number(articleId))) {
      console.log('Article ID is missing');
      throw svelteKitError(400, 'Bad Request!');
    }

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw svelteKitError(400, 'Bad Request!');
    }

    type RequestData = {
      [K in keyof TablesUpdate<'tags'>]: any
    }[];

    let requestData: RequestData = JSON.parse(tags.toString());

    if (!Array.isArray(requestData)) {
      console.log('Tag data are missing');
      throw svelteKitError(400, 'Bad Request!');
    }

    let errors: Errors = {};

    requestData.forEach((tag, index, array) => {
      if (!tag.name) return;

      if (typeof tag.name !== 'string') {
        initializeErrorsByField(errors, `tag${++index}`);
        errors[`tag${index}`].push('Invalid value');
      }

      if (array.filter((_, i) => i !== index).map(t => t.name).includes(tag.name)) {
        initializeErrorsByField(errors, `tag${++index}`);
        errors[`tag${index}`].push('Duplicate values are not allowed');
      }
    });

    if (Object.keys(errors).length !== 0) {
      let inputValues: { [fieldName: string]: any } = {};
      requestData.forEach((tag, index) => {
        inputValues[`tag${++index}`] = tag.name;
      });
      return fail(400, Object.assign(inputValues, { errors }));
    }

    let requestDataByQuery: { [key: string]: RequestData } = {
      upsert: [],
      remove: []
    };

    // forEach cannot be used here.
    await (async () => {
      for (const tag of requestData) {
        if (!tag.id) {
          if (!tag.name) continue;
          requestDataByQuery.upsert.push(tag);
          continue;
        }

        if (!tag.name) {
          requestDataByQuery.remove.push(tag);
          continue;
        }

        const tagName = await supabase
          .from('tags')
          .select('name')
          .eq('id', tag.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.log(error);
              throw svelteKitError(500, 'Internal Error!');
            }
            return data.name;
          });

        if (tag.name !== tagName) {
          requestDataByQuery.remove.push(tag);
          requestDataByQuery.upsert.push(tag);
        }
      }
    })();

    const tagIdsToRemove = requestDataByQuery.remove.map(tag => tag.id);

    await supabase
      .from('articles_tags')
      .delete()
      .eq('article_id', articleId)
      .in('tag_id', tagIdsToRemove)
      .then(( { error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
      });

    const removedTagsWithArticles = await supabase
      .from('tags')
      .select('id,articles(count)')
      .in('id', tagIdsToRemove)
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      });

    // forEach cannot be used here.
    await (async () => {
      for (const tag of removedTagsWithArticles) {
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

    const tagNamesToUpsert = requestDataByQuery.upsert.map(tag => {return { name: tag.name }});

    const newTags = await supabase
      .from('tags')
      .upsert(tagNamesToUpsert, { onConflict: 'name', ignoreDuplicates: false })
      .select('id')
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      });

    const compositePrimaryKeys = newTags.map((tag) => {
      return { article_id: Number(articleId), tag_id: tag.id };
    });

    await supabase
      .from('articles_tags')
      .insert(compositePrimaryKeys)
      .then(({ error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
      });
  }
} satisfies Actions;
