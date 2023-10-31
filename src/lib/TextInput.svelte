<script lang="ts">
  import { form, formValues, isInUpdateForm } from '$lib/stores';

  export let type: string = 'text';
  export let name: string;

  interface Validation {
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: string;
  }

  export let validation: Validation = {};

  $: value = $form?.[name] ?? $formValues?.[name] ?? '';

  const changeButtonState = (target: HTMLInputElement | HTMLTextAreaElement) => {
    if (!$formValues) return;

    const form = target.closest('form');
    if (!(form instanceof HTMLFormElement)) return;

    const button = form.querySelector('button');
    if (!(button instanceof HTMLButtonElement)) return;

    const fieldName = target.name;
    const targetValue = target.value;

    if (fieldName.slice(0, 3) === 'tag'
        && targetValue === ''
        && $formValues[fieldName] === undefined) {
      // do nothing
    } else if (targetValue !== $formValues[fieldName]) {
      button.disabled = false;
      button.style.cursor = 'pointer';
      return;
    }

    const formData = new FormData(form);
    for (const [key, value] of Array.from(formData)) {
      if (key === fieldName || key === 'id') continue;
      if (key.slice(0, 3) === 'tag' && value === '' && $formValues[key] === undefined) continue;
      if (value !== $formValues[key]) {
        button.disabled = false;
        button.style.cursor = 'pointer';
        return;
      }
    }

    button.disabled = true;
    button.style.cursor = 'not-allowed';
  };
</script>

{#if $form?.errors?.[name]}
  {#each $form.errors[name] as message}
    <p class="error">{message}</p>
  {/each}
{/if}

<label>
  {#if !$isInUpdateForm}
    {#if type === 'textarea'}
      <textarea {name} cols="30" rows="10" {...validation}>{value}</textarea>
    {:else}
      <input {type} {name} {value} {...validation}>
    {/if}
  {:else}
    {#if type === 'textarea'}
      <textarea {name} cols="30" rows="10" {...validation}
        on:change={(e) => changeButtonState(e.currentTarget)}>{value}</textarea>
    {:else}
      <input {type} {name} {value} {...validation}
        on:change={(e) => changeButtonState(e.currentTarget)}
      >
    {/if}
  {/if}
</label>

<style>
  label {
    display: block;
  }
</style>
