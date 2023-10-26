import { error, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';
import { ArticlesHandler } from '$lib/server/supabase/articlesHandler';
import { TagsHandler } from '$lib/server/supabase/tagsHandler';

import type { Actions } from './$types';

import type { TablesInsert } from '$lib/database.types';
import type { Errors } from '$lib/server/validation';

export const actions = {
  createArticle: async ({ locals: { getSignedInCreator, supabase }, request }) => {
    const signedInCreator = await getSignedInCreator();

    if (!signedInCreator) {
      throw new Error('Admin routes are not protected');
    }

    const formData = await request.formData();

    const { title, slug, content1, content2, ...rest } = Object.fromEntries(formData);

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw error(400, 'Bad Request!');
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

    const articlesHandler = new ArticlesHandler(supabase);

    if (requestData.slug && !('slug' in errors)) {
      const count = await articlesHandler.getCount({ slug: requestData.slug });

      if (count) {
        errors.slug = ['This slug already exists'];
      }
    }

    if (Object.keys(errors).length !== 0) {
      return fail(422, Object.assign(requestData, { errors }));
    }

    const user = {
      user_id: signedInCreator.id,
      username: signedInCreator.username
    };

    const newArticle = await articlesHandler.create(Object.assign(requestData, user));

    return newArticle;
  },
  addTags: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData();

    const { tags, articleId, ...rest } = Object.fromEntries(formData);

    if (!articleId || typeof articleId !== 'string' || isNaN(Number(articleId))) {
      console.log('Article ID is missing');
      throw error(400, 'Bad Request!');
    }

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw error(400, 'Bad Request!');
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
      throw error(400, 'Bad Request!');
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
      return fail(422, Object.assign(inputValues, {id: articleId}, { errors }));
    }

    requestData = requestData.filter(tag => tag.name);

    const tagsHandler = new TagsHandler(supabase);

    const newTags = await tagsHandler.create(requestData);

    const compositePrimaryKeys = newTags.map((tag) => {
      return { article_id: Number(articleId), tag_id: tag.id };
    });

    const articlesHandler = new ArticlesHandler(supabase);

    await articlesHandler.addTags(compositePrimaryKeys);

    throw redirect(303, '/articles/');
  }
} satisfies Actions;
