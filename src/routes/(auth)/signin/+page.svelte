<script lang="ts">
  import { onDestroy } from 'svelte';

	import { enhance } from '$app/forms';

  import { form as storedForm } from '$lib/stores';
  import TextInput from '$lib/TextInput.svelte';

  import type { ActionData } from './$types';

  export let form: ActionData;

  $: $storedForm = form;

  $: message = form?.message;

  onDestroy(() => {
    $storedForm = null;
  });
</script>

{#if message}
  <p class="error">{message}</p>
{/if}
<form method="POST" use:enhance>
  <TextInput type="email" name="email" validation={{ required: true }} />
  <TextInput type="password" name="password" validation={{ required: true }} />
  <button>Sign in</button>
</form>
