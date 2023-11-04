<script lang="ts">
  import { onDestroy } from 'svelte';

	import { applyAction, enhance } from '$app/forms';

  import { form as storedForm } from '$lib/stores';
  import TextInput from '$lib/TextInput.svelte';

  import type { ActionData } from './$types';

  export let form: ActionData;

  $: $storedForm = form;

  $: message = form?.message;

  $: success = false;
  $: error = !success;

  onDestroy(() => {
    $storedForm = null;
  });
</script>

{#if message}
  <p class:success class:error>{message}</p>
{/if}
<form
  method="POST"
  use:enhance={() => {
    return async ({ result }) => {
      if (result.type === 'success') {
        success = true;
      } else if (result.type === 'failure') {
        success = false;
      }
      await applyAction(result);
    };
  }}
>
  <TextInput type="email" name="email" validation={{ required: true }} />
  <TextInput type="password" name="password" validation={{ required: true, maxlength: 20 }} />
  <TextInput name="username" validation={{ required: true, maxlength: 16 }} />
  <button>Sign up</button>
</form>
