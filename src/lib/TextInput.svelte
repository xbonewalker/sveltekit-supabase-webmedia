<script lang="ts">
  import { storedForm, storedFormValues } from '$lib/stores';

  export let name: string;

  $: form = $storedForm;
  $: formValues = $storedFormValues;
</script>

{#if form?.errors?.[name]}
  {#each form.errors[name] as message}
    <p>{message}</p>
  {/each}
{/if}
<input type="text" {name} value={form?.[name] ?? formValues?.[name] ?? ''}>
