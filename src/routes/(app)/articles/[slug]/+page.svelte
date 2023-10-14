<script lang="ts">
  import { storedArticle, storedArticleWithoutContent } from '$lib/stores';

  import type { PageData } from './$types';

  import type { Article } from '$lib/database.types';

  export let data: PageData;

  if ($storedArticleWithoutContent) {
    Object.assign(data.article, $storedArticleWithoutContent);
    $storedArticleWithoutContent = undefined;
  }

  let article = data.article as Article;
</script>

{#if data.signedInCreator && data.signedInCreator.username === article.username}
  <a href={`/admin/articles/${article.slug}`} on:click={() => storedArticle.set(article)}>Edit</a>
{/if}

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
