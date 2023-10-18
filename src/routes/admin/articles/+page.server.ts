import { error as svelteKitError, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';

import type { Actions } from './$types';

import type { Errors } from '$lib/server/validation';
import type { TablesInsert } from '$lib/database.types';

export const actions = {
  createArticle: async ({ locals: { getSignedInCreator, supabase }, request }) => {
    const signedInCreator = await getSignedInCreator();

    if (!signedInCreator) {
      console.log('Admin routes are not protected');
      throw svelteKitError(500, 'Internal Error!');
    }

    const formData = await request.formData();

    const { title, slug, content1, content2, ...rest } = Object.fromEntries(formData);

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw svelteKitError(400, 'Bad Request!');
    }

    type RequestData = {
      [K in keyof Omit<TablesInsert<'articles'>, 'user_id' | 'username'>]: any
    };

    const requestData: RequestData = { title, slug, content1, content2 };

    // const requestData: RequestData = {
    //   title: 3,
    //   slug: 'slug7',
    //   content1: {},
    //   content2: 'test'
    // };

    let errors: Errors = {};

    Object.entries(requestData).forEach(([fieldName, value]) => {
      const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      if (!value) {
        initializeErrorsByField(errors, fieldName);
        errors[fieldName].push(`${capitalizedFieldName} is required`);
      }

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

    const user = {
      user_id: signedInCreator.id,
      username: signedInCreator.username
    };

    const newArticle = await supabase
      .from('articles')
      .insert(Object.assign(requestData, user))
      .select('id,title,slug,content1,content2')
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        return data;
      });

    return newArticle;
  },
  addTags: async ({ locals: { supabase }, request }) => {
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
      [K in keyof TablesInsert<'tags'>]: any
    }[];

    let requestData: RequestData = JSON.parse(tags.toString());

    // let requestData: RequestData = [
    //   { name: 2 },
    //   { name: undefined },
    //   { name: 'tag3' },
    //   { name: undefined },
    //   { name: {} },
    //   { name: 'tag6' }
    // ];

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
      return fail(400, Object.assign(inputValues, {id: articleId}, { errors }));
    }

    requestData = requestData.filter(tag => tag.name);

    const newTags = await supabase
      .from('tags')
      .upsert(requestData, { onConflict: 'name', ignoreDuplicates: false })
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

    throw redirect(303, '/articles/');
  }
} satisfies Actions;
