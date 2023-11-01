<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';

  import { form as storedForm, formValues, handleChange } from '$lib/stores';

  import ArticleFieldset from './ArticleFieldset.svelte';
  import TagsFieldset from './TagsFieldset.svelte';

  import type { ActionData } from './$types';

  export let form: ActionData;

  $: $storedForm = form;

  $handleChange = (e: Event) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return;

    const form = target.closest('form');
    if (!form) return;

    const button = form.querySelector('button');
    if (!button) return;

    const fieldName = target.name;
    const targetValue = target.value;

    if (fieldName.slice(0, 3) === 'tag') return;

    if (!targetValue) {
      button.disabled = true;
      button.style.cursor = 'not-allowed';
      return;
    }

    const formData = new FormData(form);
    for (const [key, value] of Array.from(formData)) {
      if (key === fieldName) continue;
      if (!value) {
        button.disabled = true;
        button.style.cursor = 'not-allowed';
        return;
      }
    }

    button.disabled = false;
    button.style.cursor = 'pointer';
  };

  const setNewArticleToStore = (resultData: Record<string, unknown> | undefined) => {
    if (!resultData) return;
    $formValues = resultData as Record<string, number | string>;
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
  action="?/createArticle"
  use:enhance={({ cancel, formElement }) => {
    if (form?.id) {
      cancel();
    }

    return async ({ result }) => {
      if (result.type === 'success') {
        formElement.articleFieldset.disabled = true;
        const articleFormButton = formElement.querySelector('button');
        if (articleFormButton) articleFormButton.style.cursor = 'not-allowed';
        const tagsFieldset = document.querySelector('fieldset[name=tagsFieldset]');
        if (tagsFieldset instanceof HTMLFieldSetElement) tagsFieldset.disabled = false;
        const tagsFormButton = tagsFieldset?.querySelector('button');
        if (tagsFormButton) tagsFormButton.style.cursor = 'pointer';

        // $storedFormValues = result.data;
        setNewArticleToStore(result.data);
      }
      await applyAction(result);
    };
  }}
>
  <ArticleFieldset buttonDisabled={true} />
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
  <TagsFieldset fieldsetDisabled={true} />
</form>

<style>
  form :global(button) {
    cursor: not-allowed;
  }
</style>
