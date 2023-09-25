<script lang="ts">
  import { article } from '$lib/stores';

  import type { PageData } from './$types';

  export let data: PageData;

  if ($article) {
    Object.assign(data.article, $article);
    $article = undefined;
  }
</script>

<h1>{data.article.title}</h1>
{#each data.article.tags as tag}
  {tag.name}
{/each}
<div>{@html data.article.content1}</div>
<div>{@html data.article.content2}</div>
<div>{data.article.created_at}</div>
<div>{data.article.updated_at}</div>
