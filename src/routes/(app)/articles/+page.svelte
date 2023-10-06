<script lang="ts">
  import { storedArticleWithoutContent } from '$lib/stores';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<a href="/articles">All</a>
<ul>
  {#each data.articles as article}
    <li>
      <a href={`/articles/${article.slug}`} on:click={() => storedArticleWithoutContent.set(article)}>{article.title}</a>
      {#each article.tags as tag}
        <a href={`/articles?tag=${tag.name}`}>{tag.name}</a>
      {/each}
      {article.username}
      {article.profile.first_name}{article.profile.last_name}
      {#if data.signedInCreator && data.signedInCreator.username === article.username}
        <a href={`/admin/articles/${article.slug}`} on:click={() => storedArticleWithoutContent.set(article)}>Edit</a>
      {/if}
    </li>
  {/each}
</ul>
