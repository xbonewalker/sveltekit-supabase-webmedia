import { error as svelteKitError, fail } from '@sveltejs/kit';

import type { Actions } from './$types';

import type { TablesInsert } from '$lib/types';

type RequestData = {
  [K in keyof Omit<TablesInsert<'articles'>, 'user_id' | 'username'>]: any
};

export const actions = {
  default: async ({ locals: { getSignedInCreator, supabase }, request }) => {
    const signedInCreator = await getSignedInCreator();

    if (!signedInCreator) {
      console.log('Admin routes are not protected');
      throw svelteKitError(500, 'Internal Error!');
    }

    const formData = await request.formData();

    const requestData: RequestData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content1: formData.get('content1'),
      content2: formData.get('content2')
    };

    // const requestData: RequestData = {
    //   title: 3,
    //   slug: 'slug7',
    //   content1: {},
    //   content2: 'test'
    // };

    interface Errors {
      [fieldName: string]: string[];
    }

    let errors: Errors = {};

    const initializeErrorsByField = (fieldName: string) => {
      if (!(fieldName in errors)) {
        errors[fieldName] = new Array();
      }
    };

    Object.entries(requestData).forEach(([fieldName, value]) => {
      const capitalizedFieldName =  fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      if (!value) {
        initializeErrorsByField(fieldName);
        errors[fieldName].push(`${capitalizedFieldName} is required`);
      }

      if (typeof value !== 'string') {
        initializeErrorsByField(fieldName);
        errors[fieldName].push('Invalid value');
      }
    });

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

    if (Object.keys(errors).length !== 0) {
      return fail(400, Object.assign(requestData, { errors }));
    }

    const user = {
      user_id: signedInCreator.id,
      username: signedInCreator.username
    };

    const { error } = await supabase
      .from('articles')
      .insert(Object.assign(requestData, user))
      .select();

    if (error) {
      console.log(error);
      throw svelteKitError(500, 'Internal Error!');
    }
  }
} satisfies Actions;
