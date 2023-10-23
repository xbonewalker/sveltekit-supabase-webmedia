import { error as svelteKitError } from '@sveltejs/kit';

import { TablesHandler } from '$lib/server/supabase/tablesHandler';

import type { Article, TablesInsert, TablesUpdate } from '$lib/database.types';

export class ArticlesHandler extends TablesHandler {
  create = async (dataToInsert: TablesInsert<'articles'>) => {
    return await this.supabase
      .from('articles')
      .insert(dataToInsert)
      .select('id,title,slug,content1,content2')
      .single()
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data;
      });
  };

  get = async (fields: string, conditions: Partial<Record<'slug' | 'user_id', string>>) => {
    return await this.supabase
      .from('articles')
      .select(fields as '*,tags(*),profile:profiles(*)')
      .match(conditions)
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        if (!data.length) {
          throw svelteKitError(404, 'Not found');
        }
        return data[0];
      });
  };

  getList = async () => {
    return await this.supabase
      .from('articles')
      .select('id,title,slug,username,created_at,updated_at,tags(id,name),profile:profiles(first_name,last_name)')
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data;
      });
  };

  getCount = async (
      conditions: Partial<Record<keyof Omit<Article, 'tags' | 'profile'>, number | string>>) => {
    return await this.supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .match(conditions)
      .then(({ count, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return count;
      });
  };

  update = async (dataToUpdate: TablesUpdate<'articles'>, id: number) => {
    await this.supabase
      .from('articles')
      .update(dataToUpdate)
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      });
  };

  delete = async (id: number) => {
    await this.supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      });
  };

  addTags = async (compositePrimaryKeys: TablesInsert<'articles_tags'>[]) => {
    await this.supabase
      .from('articles_tags')
      .insert(compositePrimaryKeys)
      .then(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
      });
  };

  getTagIds = async (id: number) => {
    return await this.supabase
      .from('articles')
      .select('tags(id)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          throw new Error(error.message);
        }
        return data.tags.map((tag => tag.id));
      });
  };

  removeTags = async (tagIds: number[], id: number) => {
    await this.supabase
      .from('articles_tags')
      .delete()
      .eq('article_id', id)
      .in('tag_id', tagIds)
      .then(( { error }) => {
        if (error) {
          throw new Error(error.message);
        }
      });
  };
}
