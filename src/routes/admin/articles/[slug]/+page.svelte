<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  import {
    article as storedArticle,
    articleWithoutContent,
    form as storedForm,
    formValues,
    handleChange
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

  $handleChange = (e: Event) => {
    if (!$formValues) return;

    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return;

    const form = target.closest('form');
    if (!form) return;

    const button = form.querySelector('button');
    if (!button) return;

    const fieldName = target.name;
    const targetValue = target.value;

    if (fieldName.slice(0, 3) === 'tag'
        && targetValue === ''
        && $formValues[fieldName] === undefined) {
      // do nothing
    } else if (targetValue !== $formValues[fieldName]) {
      button.disabled = false;
      button.style.cursor = 'pointer';
      return;
    }

    const formData = new FormData(form);
    for (const [key, value] of Array.from(formData)) {
      if (key === fieldName || key === 'id') continue;
      if (key.slice(0, 3) === 'tag' && value === '' && $formValues[key] === undefined) continue;
      if (value !== $formValues[key]) {
        button.disabled = false;
        button.style.cursor = 'pointer';
        return;
      }
    }

    button.disabled = true;
    button.style.cursor = 'not-allowed';
  };

  const deleteUnchangedFormData = (formData: FormData) => {
    Array.from(formData).forEach(([key, value]) => {
      // Type of ID in formData is "string".
      // Type of ID in article is "number".
      if (value === article[key as keyof Article]) {
        formData.delete(key);
      }
    });
  };

  const disableButton = (formElement: HTMLFormElement) => {
    const button = formElement.querySelector('button');
    if (button) {
      button.disabled = true;
      button.style.cursor = 'not-allowed';
    }
  };

  onMount(() => {
    console.log($formValues);
  });

  onDestroy(() => {
    $storedForm = null;
    $formValues = undefined;
    $handleChange = undefined;
  });
</script>

<form
  method="POST"
  action="?/updateArticle"
  use:enhance={({ cancel, formData, formElement }) => {
    deleteUnchangedFormData(formData);
    if (Array.from(formData.keys()).length === 1) {
      cancel();
    }

    return async ({ result }) => {
      if (result.type === 'success') {
        disableButton(formElement);
        invalidateAll();
      } else if (result.type === 'redirect') {
        disableButton(formElement);
      }
      await applyAction(result);
    };
  }}
>
  <input type="hidden" name="id" value={article.id}>
  <ArticleFieldset buttonDisabled={true} />
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
        for (let i = 0; i < 3; i++) {
          formElement[`tag${i + 1}`].value = '';
        }
        disableButton(formElement);
        invalidateAll();
      }
      await applyAction(result);
    };
  }}
>
  <TagsFieldset buttonDisabled={true} />
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

<style>
  form :global(button) {
    cursor: not-allowed;
  }
</style>
