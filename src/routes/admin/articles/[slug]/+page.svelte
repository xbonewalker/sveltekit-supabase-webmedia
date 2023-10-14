<script lang="ts">
  import { onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';

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

  let saveButton: HTMLButtonElement;

  onMount(() => {
    saveButton = document.querySelector('#saveButton') as HTMLButtonElement;
    saveButton.disabled = true;
  });

  const changeSaveButtonState = (e: Event) => {
    if (!e.currentTarget) return;
    const target = e.currentTarget;
    if (!('name' in target && 'value' in target)) return;

    const fieldName = target.name;
    const targetValue = target.value;

    if (targetValue === article[fieldName as keyof Article]) {
      const formData = new FormData(document.forms[0]);
      for (const [key, value] of Array.from(formData)) {
        if (key === fieldName || key === 'id') {
          continue;
        }
        if (value !== article[key as keyof Article]) {
          saveButton.disabled = false;
          return;
        }
      }
      saveButton.disabled = true;
    } else {
      saveButton.disabled = false;
    }
  };
</script>

<form
  method="POST"
  use:enhance={({ cancel, formData }) => {
    deleteUnchangedFormData(formData);
    if (Array.from(formData.keys()).length === 1) {
      cancel();
    }

    return async ({ result }) => {
      if (result.type === 'success') {
        if (result.data?.article) {
          data.article = result.data.article;
        }
      }
      if (result.type === 'success' || result.type === 'redirect') {
        saveButton.disabled = true;
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
  <input type="text" name="title" value={form?.title ?? article.title} on:change={(e) => changeSaveButtonState(e)}>

  {#if form?.errors?.slug}
    {#each form.errors.slug as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="slug" value={form?.slug ?? article.slug} on:change={(e) => changeSaveButtonState(e)}>

  {#if form?.errors?.content1}
    {#each form.errors.content1 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content1" value={form?.content1 ?? article.content1} on:change={(e) => changeSaveButtonState(e)}>

  {#if form?.errors?.content2}
    {#each form.errors.content2 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content2" value={form?.content2 ?? article.content2} on:change={(e) => changeSaveButtonState(e)}>

  <input type="hidden" name="id" value={article.id}>

  <button id="saveButton">Save</button>
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
