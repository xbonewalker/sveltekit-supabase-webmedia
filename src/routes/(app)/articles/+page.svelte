<script lang="ts">
  import { article } from '$lib/stores';

  import type { PageData } from './$types';

  import type { Article } from '$lib/stores';

  export let data: PageData;

  const setToStore = (article: Article) => {
    $article = article;
  };
</script>

<ul>
  {#each data.articles as article}
    <li>
      <a href={`/articles/${article.slug}`} on:click={() => setToStore(article)}>{article.title}</a>
    </li>
  {/each}
</ul>
