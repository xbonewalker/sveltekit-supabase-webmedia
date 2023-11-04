import { error, fail, redirect } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';

import type { Actions } from './$types';

import type { Errors } from '$lib/server/validation';

export const actions = {
  default: async ({ locals: { supabase }, request }) => {
    const formData = await request.formData();

    const { email, password, ...rest } = Object.fromEntries(formData);

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw error(400, 'Bad Request!');
    }

    type RequestData = {
      email: any;
      password: any;
    };

    const requestData: RequestData = { email, password };

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

    if (Object.keys(errors).length !== 0) {
      return fail(422, Object.assign(requestData, { errors }));
    }

    const result = await supabase.auth.signInWithPassword({
      email: requestData.email,
      password: requestData.password,
    })
      .then(({ error }) => {
        if (error?.status) {
          if (String(error.status)[0] === '5') {
            throw new Error(error.message);
          }
          if (String(error.status)[0] === '4') {
            return {
              failure: fail(error.status, Object.assign(requestData, { message: error.message }))
            };
          }
        }
      });

    if (result?.failure) {
      return result.failure;
    }

    throw redirect(303, '/');
  }
} satisfies Actions;
