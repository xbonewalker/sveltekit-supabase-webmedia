import { error, fail } from '@sveltejs/kit';

import { initializeErrorsByField } from '$lib/server/validation';

import type { Actions } from './$types';

import type { Errors } from '$lib/server/validation';

export const actions = {
  default: async ({ locals: { supabase }, request, url }) => {
    const formData = await request.formData();

    const { email, password, username, ...rest } = Object.fromEntries(formData);

    if (Object.keys(rest).length !== 0) {
      console.log('Invalid parameter');
      throw error(400, 'Bad Request!');
    }

    type RequestData = {
      email: any;
      password: any;
      username: any;
    };

    const requestData: RequestData = { email, password, username };

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

    if (!('email' in errors)
        && typeof requestData.email === 'string'
        && !requestData.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      errors.email = ['Please enter a valid email'];
    }

    if (!('username' in errors)) {
      const count = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', requestData.username)
        .then(({ count, error }) => {
          if (error) {
            throw new Error(error.message);
          }
          return count;
        });

      if (count) {
        errors.username = ['This username already exists'];
      }
    }

    if (Object.keys(errors).length !== 0) {
      return fail(422, Object.assign(requestData, { errors }));
    }

    const result = await supabase.auth.signUp({
      email: requestData.email,
      password: requestData.password,
      options: {
        data: {
          username: requestData.username,
        },
        emailRedirectTo: `${url.origin}/auth/callback`,
      },
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

    return {
      message: 'Please check your email for a magic link to log into the website'
    };
  }
} satisfies Actions;
