<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  import { articleWithoutContent } from '$lib/stores';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<a href="/articles">All</a>
<ul>
  {#each data.articles as article}
    <li>
      <a href={`/articles/${article.slug}`} on:click={() => articleWithoutContent.set(article)}>{article.title}</a>
      {#each article.tags as tag}
        <a href={`/articles?tag=${tag.name}`}>{tag.name}</a>
      {/each}
      {article.username}
      {article.profile.first_name}{article.profile.last_name}
      {#if data.signedInCreator && data.signedInCreator.username === article.username}
        <a href={`/admin/articles/${article.slug}`} on:click={() => articleWithoutContent.set(article)}>Edit</a>
        <form
          method="POST"
          action="?/deleteArticle"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'success') {
                invalidateAll();
              }
              await applyAction(result);
            };
          }}
        >
          <input type="hidden" name="id" value={article.id}>
          <button>Delete</button>
        </form>
      {/if}
    </li>
  {/each}
</ul>
