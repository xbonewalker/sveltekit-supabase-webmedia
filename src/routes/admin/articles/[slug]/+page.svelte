<script lang="ts">
  import { storedArticle, storedArticleWithoutContent } from '$lib/stores';
  import { isArticle } from '$lib/types';

  import type { PageData } from './$types';

  import type { Article } from '$lib/types';

  export let data: PageData;

  if ($storedArticle) {
    Object.assign(data.article, $storedArticle);
    $storedArticle = undefined;
  } else if ($storedArticleWithoutContent) {
    Object.assign(data.article, $storedArticleWithoutContent);
    $storedArticleWithoutContent = undefined;
  }

  let article: Article;

  if (isArticle(data.article)) {
    article = data.article;
  }
</script>

<h1>{article.title}</h1>
{#each article.tags as tag}
  {tag.name}
{/each}
<div>{article.username}</div>
<div>{article.profile.first_name}</div>
<div>{article.profile.last_name}</div>
<div>{@html article.content1}</div>
<div>{@html article.content2}</div>
<div>{article.created_at}</div>
<div>{article.updated_at}</div>
