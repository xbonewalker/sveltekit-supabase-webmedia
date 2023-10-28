<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  import {
    article as storedArticle,
    articleWithoutContent,
    form as storedForm,
    formValues,
    isInUpdateForm
  } from '$lib/stores';

  import ArticleFieldset from '../ArticleFieldset.svelte';
  import TagsFieldset from '../TagsFieldset.svelte';

  import type { ActionData, PageData } from './$types';

  import type { Article } from '$lib/database.types';

  export let data: PageData;
  export let form: ActionData;

  $: $storedForm = form;

  if ($storedArticle) {
    Object.assign(data.article, $storedArticle);
    $storedArticle = undefined;
  } else if ($articleWithoutContent) {
    Object.assign(data.article, $articleWithoutContent);
    $articleWithoutContent = undefined;
  }

  $: article = data.article as Article;

  $: articleFormValues = Object.fromEntries(Object.entries(article).filter(([key, _]) => {
    return ['id', 'title', 'slug', 'content1', 'content2'].includes(key);
  }));

  $: tagsFormValues = Object.fromEntries(article.tags.map((tag, index) => {
    return [`tag${index + 1}`, tag.name];
  }));

  $: $formValues = Object.assign({}, articleFormValues, tagsFormValues);

  $isInUpdateForm = true;

  const deleteUnchangedFormData = (formData: FormData) => {
    Array.from(formData).forEach(([key, value]) => {
      // Type of ID in formData is "string".
      // Type of ID in article is "number".
      if (value === article[key as keyof Article]) {
        formData.delete(key);
      }
    });
  };

  onMount(() => {
    console.log($formValues);
    const tagsFieldset = document.querySelector('fieldset[name=tagsFieldset]');
    if (tagsFieldset instanceof HTMLFieldSetElement) tagsFieldset.disabled = false;
  });

  onDestroy(() => {
    $storedForm = null;
    $formValues = undefined;
    $isInUpdateForm = false;
  });
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
  <input type="hidden" name="id" value={article.id}>
  <ArticleFieldset />
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
  <TagsFieldset />
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
