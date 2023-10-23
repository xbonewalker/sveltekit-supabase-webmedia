<script lang="ts">
  import { storedForm, storedFormValues } from '$lib/stores';

  export let type: string = 'text';
  export let name: string;

  $: form = $storedForm;
  $: formValues = $storedFormValues;
  $: value = form?.[name] ?? formValues?.[name] ?? '';
</script>

{#if form?.errors?.[name]}
  {#each form.errors[name] as message}
    <p>{message}</p>
  {/each}
{/if}

{#if type === 'textarea'}
  <textarea {name} cols="30" rows="10">{value}</textarea>
{:else}
  <input {type} {name} {value}>
{/if}
