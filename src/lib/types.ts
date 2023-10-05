import type { Database } from '../DatabaseDefinitions';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Profile

type Profile = Pick<Tables<'profiles'>, 'first_name' | 'last_name'>

const isProfile = (arg: any): arg is Profile => {
  return typeof arg.first_name === 'string'
    && typeof arg.last_name === 'string';
};

// Tag

type Tag = Pick<Tables<'tags'>, 'name'>;

const isTag = (arg: any): arg is Tag => {
  return typeof arg.name === 'string';
};

// Article

export type Article = Omit<Tables<'articles'>, 'user_id'> & {
  profile: Profile;
} & {
  tags: Tag[];
};

export const isArticle = (arg: any): arg is Article => {
  return typeof arg.title === 'string'
    && typeof arg.slug === 'string'
    && typeof arg.content1 === 'string'
    && (typeof arg.content2 === 'string' || arg.content2 === undefined)
    && typeof arg.username === 'string'
    && typeof arg.created_at === 'string'
    && typeof arg.updated_at === 'string'
    && isProfile(arg.profile)
    && Array.isArray(arg.tags)
    && (arg.tags.length === 0 || arg.tags.every((element: any) => isTag(element)));
};

export type ArticleWithoutContent = Omit<Article, 'content1' | 'content2'>;
