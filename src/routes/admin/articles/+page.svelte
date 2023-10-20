<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { applyAction, enhance } from '$app/forms';

  import { storedForm, storedFormValues } from '$lib/stores';

  import ArticleFieldset from './ArticleFieldset.svelte';
  import TagsFieldset from './TagsFieldset.svelte';

  import type { ActionData } from './$types';

  export let form: ActionData;

  $: $storedForm = form;

  const setNewArticleToStore = (resultData: Record<string, unknown> | undefined) => {
    if (!resultData) return;
    $storedFormValues = resultData as Record<string, number | string>;
  };

  onMount(() => {
    document.forms[1].tagsFieldset.disabled = true;
    console.log($storedFormValues);
  });

  onDestroy(() => {
    $storedForm = null;
    $storedFormValues = undefined;
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
        document.forms[1].tagsFieldset.disabled = false;

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
