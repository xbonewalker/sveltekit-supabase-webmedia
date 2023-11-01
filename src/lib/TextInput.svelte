<script lang="ts">
  import { form, formValues, handleChange } from '$lib/stores';

  export let type: 'text' | 'textarea' | 'email' | 'password' = 'text';
  export let name: string;

  interface Validation {
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: string;
  }

  export let validation: Validation = {};

  $: value = $form?.[name] ?? $formValues?.[name] ?? '';
</script>

{#if $form?.errors?.[name]}
  {#each $form.errors[name] as message}
    <p class="error">{message}</p>
  {/each}
{/if}

<label>
  {#if type === 'textarea'}
    <textarea {name} cols="30" rows="10" {...validation}
      on:change={(e) => {if ($handleChange) $handleChange(e)}}
    >{value}</textarea>
  {:else}
    <input {type} {name} {value} {...validation}
      on:change={(e) => {if ($handleChange) $handleChange(e)}}
    >
  {/if}
</label>

<style>
  label {
    display: block;
  }
</style>
