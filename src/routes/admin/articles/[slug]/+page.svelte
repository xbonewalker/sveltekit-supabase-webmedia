<script lang="ts">
  import { applyAction, enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  import { storedArticle, storedArticleWithoutContent } from '$lib/stores';
  import TextInput from '$lib/TextInput.svelte';

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
  $: tagNames = 'tags' in data.article
    ? data.article.tags.map((tag, index) => {
        return [`tag${index + 1}`, tag.name];
      })
    : [];
  $: tags = Object.fromEntries(tagNames);

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
  <TextInput name="title" {form} currentData={article} />
  <TextInput name="slug" {form} currentData={article} />
  <TextInput name="content1" {form} currentData={article} />
  <TextInput name="content2" {form} currentData={article} />

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
  {#each Array(3) as _, i}
    <TextInput name={`tag${i + 1}`} {form} currentData={tags} />
  {/each}

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
