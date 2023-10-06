import { error as svelteKitError, redirect } from '@sveltejs/kit';

import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event,
  });

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  event.locals.getSignedInCreator = async () => {
    const session = await event.locals.getSession();
    return session
    ? await event.locals.supabase
      .from('profiles')
      .select('username,role:roles!inner(name)')
      .match({ id: session.user.id, 'roles.name': 'creator' })
      .then(({ data, error }) => {
        if (error) {
          console.log(error);
          throw svelteKitError(500, 'Internal Error!');
        }
        if (!data.length) {
          return undefined;
        }
        return data[0];
      })
    : undefined;
  };

  if (event.url.pathname.startsWith('/admin')) {
    const signedInCreator = await event.locals.getSignedInCreator();
    if (!signedInCreator) {
      throw redirect(303, '/');
    }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    },
  });
};
