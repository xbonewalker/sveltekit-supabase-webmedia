<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  import { storedArticle, storedArticleWithoutContent } from '$lib/stores';

  import type { ActionData, PageData } from './$types';

  import type { Article } from '$lib/database.types';

  export let data: PageData;
  export let form: ActionData;

  if ($storedArticle) {
    Object.assign(data.article, $storedArticle);
    $storedArticle = undefined;
  } else if ($storedArticleWithoutContent) {
    Object.assign(data.article, $storedArticleWithoutContent);
    $storedArticleWithoutContent = undefined;
  }

  $: article = data.article as Article;

  const deleteUnchangedFormData = (formData: FormData) => {
    Array.from(formData).forEach(([key, value]) => {
      // Type of ID in formData is "string".
      // Type of ID in article is "number".
      if (value === article[key as keyof Article]) {
        formData.delete(key);
      }
    });
  };
</script>

<form
  method="POST"
  action="?/updateArticle"
  use:enhance={({ cancel, formData }) => {
    deleteUnchangedFormData(formData);
    if (Array.from(formData.keys()).length === 1) {
      cancel();
    }

    return async ({ result }) => {
      if (result.type === 'success') {
        invalidateAll();
      }
      await applyAction(result);
    };
  }}
>
  {#if form?.errors?.title}
    {#each form.errors.title as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="title" value={form?.title ?? article.title}>

  {#if form?.errors?.slug}
    {#each form.errors.slug as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="slug" value={form?.slug ?? article.slug}>

  {#if form?.errors?.content1}
    {#each form.errors.content1 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content1" value={form?.content1 ?? article.content1}>

  {#if form?.errors?.content2}
    {#each form.errors.content2 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content2" value={form?.content2 ?? article.content2}>

  <input type="hidden" name="id" value={article.id}>

  <button>Save</button>
</form>

<form
  method="POST"
  action="?/updateTags"
  use:enhance={({ formData, formElement }) => {
    let tags = [];
    for (let i = 0; i < 3; i++) {
      tags[i] = { id: article.tags[i]?.id, name: formElement[`tag${i + 1}`].value };
      formData.delete(`tag${i + 1}`);
    }
    formData.set('tags', JSON.stringify(tags));
    formData.set('articleId', article.id.toString());

    return async ({ result }) => {
      if (result.type === 'success') {
        invalidateAll();
      }
      await applyAction(result);
    };
  }}
>
  {#if form?.errors?.tag1}
    {#each form.errors.tag1 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="tag1" value={form?.tag1 ?? article.tags[0]?.name ?? ''}>

  {#if form?.errors?.tag2}
    {#each form.errors.tag2 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="tag2" value={form?.tag2 ?? article.tags[1]?.name ?? ''}>

  {#if form?.errors?.tag3}
    {#each form.errors.tag3 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="tag3" value={form?.tag3 ?? article.tags[2]?.name ?? ''}>

  <button>Save</button>
</form>

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
