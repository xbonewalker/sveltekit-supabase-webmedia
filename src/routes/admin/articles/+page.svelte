<script lang="ts">
  import { applyAction, enhance } from '$app/forms';

  import type { ActionData } from './$types';

  export let form: ActionData;
 </script>

<form
  method="POST"
  action="?/createArticle"
  use:enhance={({ cancel, formElement }) => {
    if (form?.id) {
      cancel();
    }

    return async ({ result }) => {
      if (result.type === 'success') {
        formElement.articleFields.disabled = true;
        document.forms[1].tagFields.disabled = false;
      }
      await applyAction(result);
    };
  }}
>
  <fieldset name="articleFields">
    {#if form?.errors?.title}
      {#each form.errors.title as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="title" value={form?.title ?? ''}>

    {#if form?.errors?.slug}
      {#each form.errors.slug as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="slug" value={form?.slug ?? ''}>

    {#if form?.errors?.content1}
      {#each form.errors.content1 as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="content1" value={form?.content1 ?? ''}>

    {#if form?.errors?.content2}
      {#each form.errors.content2 as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="content2" value={form?.content2 ?? ''}>

    <button>Save</button>
  </fieldset>
</form>

<form
  method="POST"
  action="?/addTags"
  use:enhance={({ cancel, formData, formElement }) => {
    if (!form?.id) {
      cancel();
    }

    let tags = [];
    for (let i = 0; i < 3; i++) {
      tags[i] = { name: formElement[`tag${i + 1}`].value };
      formData.delete(`tag${i + 1}`);
    }
    formData.set('tags', JSON.stringify(tags));
    formData.set('articleId', form?.id);

    return async ({ result }) => {
      await applyAction(result);
    };
  }}
>
  <fieldset name="tagFields" disabled>
    {#if form?.errors?.tag1}
      {#each form.errors.tag1 as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="tag1" value={form?.tag1 ?? ''}>

    {#if form?.errors?.tag2}
      {#each form.errors.tag2 as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="tag2" value={form?.tag2 ?? ''}>

    {#if form?.errors?.tag3}
      {#each form.errors.tag3 as message}
        <div>{message}</div>
      {/each}
    {/if}
    <input type="text" name="tag3" value={form?.tag3 ?? ''}>

    <button>Save</button>
  </fieldset>
</form>
