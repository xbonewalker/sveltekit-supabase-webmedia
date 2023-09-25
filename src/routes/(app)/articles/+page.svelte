<script lang="ts">
  import { article } from '$lib/stores';

  import type { PageData } from './$types';

  import type { Article } from '$lib/stores';

  export let data: PageData;

  const setToStore = (article: Article) => {
    $article = article;
  };
</script>

<a href="/articles">All</a>
<ul>
  {#each data.articles as article}
    <li>
      <a href={`/articles/${article.slug}`} on:click={() => setToStore(article)}>{article.title}</a>
      {#each article.tags as tag}
        <a href={`/articles?tag=${tag.name}`}>{tag.name}</a>
      {/each}
    </li>
  {/each}
</ul>
