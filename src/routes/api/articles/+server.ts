import { json, error } from '@sveltejs/kit';

export const GET = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession();
  if (!session) {
    throw error(401, { message: 'Unauthorized' });
  }
  const { data } = await supabase.from('articles').select('*');

  return json({ data });
};
