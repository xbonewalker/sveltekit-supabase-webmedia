<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';

  import { form as storedForm, formValues } from '$lib/stores';

  import ArticleFieldset from './ArticleFieldset.svelte';
  import TagsFieldset from './TagsFieldset.svelte';

  import type { ActionData } from './$types';

  export let form: ActionData;

  $: $storedForm = form;

  const setNewArticleToStore = (resultData: Record<string, unknown> | undefined) => {
    if (!resultData) return;
    $formValues = resultData as Record<string, number | string>;
  };

  onMount(() => {
    console.log($formValues);
    const articleFormButton = document.querySelector('#articleFormButton');
    if (articleFormButton instanceof HTMLButtonElement) articleFormButton.disabled = false;
  });

  onDestroy(() => {
    $storedForm = null;
    $formValues = undefined;
  });
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
        formElement.articleFieldset.disabled = true;
        const articleFormButton = document.querySelector('#articleFormButton');
        if (articleFormButton instanceof HTMLButtonElement) {
          articleFormButton.style.cursor = 'not-allowed';
        }
        const tagsFieldset = document.querySelector('fieldset[name=tagsFieldset]');
        if (tagsFieldset instanceof HTMLFieldSetElement) tagsFieldset.disabled = false;
        const tagsFormButton = document.querySelector('#tagsFormButton');
        if (tagsFormButton instanceof HTMLButtonElement) {
          tagsFormButton.disabled = false;
          tagsFormButton.style.cursor = 'pointer';
        }

        // $storedFormValues = result.data;
        setNewArticleToStore(result.data);
      }
      await applyAction(result);
    };
  }}
>
  <ArticleFieldset />
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
  <TagsFieldset />
</form>

<style>
  form:nth-child(2) :global(button) {
    cursor: not-allowed;
  }
</style>
