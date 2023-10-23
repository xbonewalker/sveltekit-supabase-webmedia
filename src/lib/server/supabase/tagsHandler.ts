import { error as svelteKitError } from '@sveltejs/kit';

import { TablesHandler } from '$lib/server/supabase/tablesHandler';

import type { TablesInsert } from '$lib/database.types';

export class TagsHandler extends TablesHandler {
  create = async (dataToUpsert: TablesInsert<'tags'>[]) => {
    return await this.supabase
      .from('tags')
      .upsert(dataToUpsert, { onConflict: 'name', ignoreDuplicates: false })
      .select('id')
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data;
      });
  };

  getName = async (id: number) => {
    return await this.supabase
      .from('tags')
      .select('name')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data.name;
      });
  };

  getArticleList = async (name: string) => {
    return await this.supabase
      .from('tags')
      .select('articles(id,title,slug,username,created_at,updated_at,tags(id,name),profile:profiles(first_name,last_name))')
      .eq('name', name)
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data.length) {
          throw svelteKitError(404, 'Not found');
        }
        return data[0].articles;
      });
  };

  getArticlesCounts = async (ids: number[]) => {
    return await this.supabase
      .from('tags')
      .select('id,articles(count)')
      .in('id', ids)
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data;
      });
  };

  delete = async (id: number) => {
    await this.supabase
      .from('tags')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      });
  };
}
