import { error as svelteKitError, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';
import { ArticlesHandler } from '$lib/server/supabase/articlesHandler';
import { TagsHandler } from '$lib/server/supabase/tagsHandler';

import type { Actions, PageServerLoad } from './$types';

import type { Article, TablesUpdate } from '$lib/database.types';
import type { Errors } from '$lib/server/validation';

export const load = (async ({ locals: { getSession, supabase }, params, request }) => {
  const session = await getSession();

  if (!session) {
    throw new Error('Admin routes are not protected');
  }

  const referer = request.headers.get('referer');

  if (referer === `http://localhost:5173/articles/${params.slug}`) {
    return {
      article: {}
    };
  }

  let fields = 'content1,content2';

  if (referer !== 'http://localhost:5173/articles') {
    fields += ',id,title,slug,username,created_at,updated_at,' +
        'tags(id,name),profile:profiles(first_name,last_name)';
  }

  const articlesHandler = new ArticlesHandler(supabase);

  const article = await articlesHandler.get(fields, {
    slug: params.slug, user_id: session.user.id
  });

  return {
    article: article as Article | Pick<Article, 'content1' | 'content2'>
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

    const articlesHandler = new ArticlesHandler(supabase);

    if (requestData.slug && !('slug' in errors)) {
      const count = await articlesHandler.getCount({ slug: requestData.slug });

      if (count) {
        errors.slug = ['This slug already exists'];
      }
    }

    if (Object.keys(errors).length !== 0) {
      return fail(400, Object.assign(requestData, { errors }));
    }

    await articlesHandler.update(requestData, Number(id));

    if (slug) {
      throw redirect(303, `/admin/articles/${slug}`);
    }
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

    const tagsHandler = new TagsHandler(supabase);

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

        const tagName = await tagsHandler.getName(tag.id);

        if (tag.name !== tagName) {
          requestDataByQuery.remove.push(tag);
          requestDataByQuery.upsert.push(tag);
        }
      }
    })();

    const tagIdsToRemove = requestDataByQuery.remove.map(tag => tag.id);

    const articlesHandler = new ArticlesHandler(supabase);

    await articlesHandler.removeTags(tagIdsToRemove, Number(articleId));

    const tagsWithArticlesCount = await tagsHandler.getArticlesCounts(tagIdsToRemove);

    // forEach cannot be used here.
    await (async () => {
      for (const tag of tagsWithArticlesCount) {
        if (!('count' in tag.articles[0])) {
          throw new Error('The return value of getArticlesCounts() is invalid.');
        }
        if (tag.articles[0].count === 0) {
          await tagsHandler.delete(tag.id);
        }
      }
    })();

    const tagNamesToUpsert = requestDataByQuery.upsert.map(tag => {return { name: tag.name }});

    const newTags = await tagsHandler.create(tagNamesToUpsert);

    const compositePrimaryKeys = newTags.map((tag) => {
      return { article_id: Number(articleId), tag_id: tag.id };
    });

    await articlesHandler.addTags(compositePrimaryKeys);
  }
} satisfies Actions;
