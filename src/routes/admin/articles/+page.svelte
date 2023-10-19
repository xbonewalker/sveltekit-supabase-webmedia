<script lang="ts">
  import { applyAction, enhance } from '$app/forms';

  import TextInput from '$lib/TextInput.svelte';

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
    <TextInput name="title" {form} currentData={undefined} />
    <TextInput name="slug" {form} currentData={undefined} />
    <TextInput name="content1" {form} currentData={undefined} />
    <TextInput name="content2" {form} currentData={undefined} />

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
    {#each Array(3) as _, i}
      <TextInput name={`tag${i + 1}`} {form} currentData={undefined} />
    {/each}

    <button>Save</button>
  </fieldset>
</form>
