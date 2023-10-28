<script lang="ts">
  import { form, formValues, isInUpdateForm } from '$lib/stores';

  export let type: string = 'text';
  export let name: string;

  $: value = $form?.[name] ?? $formValues?.[name] ?? '';

  const changeButtonState = (target: HTMLInputElement | HTMLTextAreaElement) => {
    if (!$formValues) return;

    const button = target.parentElement?.lastChild;
    if (!(button instanceof HTMLButtonElement)) return;

    const form = target.parentElement?.parentElement;
    if (!(form instanceof HTMLFormElement)) return;

    const fieldName = target.name;
    const targetValue = target.value;

    if (fieldName.slice(0, 3) === 'tag'
        && targetValue === ''
        && $formValues[fieldName] === undefined) {
      // do nothing
    } else if (targetValue !== $formValues[fieldName]) {
      button.disabled = false;
      return;
    }

    const formData = new FormData(form);
    for (const [key, value] of Array.from(formData)) {
      if (key === fieldName || key === 'id') continue;
      if (key.slice(0, 3) === 'tag' && value === '' && $formValues[key] === undefined) continue;
      if (value !== $formValues[key]) {
        button.disabled = false;
        return;
      }
    }

    button.disabled = true;
  };
</script>

{#if $form?.errors?.[name]}
  {#each $form.errors[name] as message}
    <p>{message}</p>
  {/each}
{/if}

{#if !$isInUpdateForm}
  {#if type === 'textarea'}
    <textarea {name} cols="30" rows="10">{value}</textarea>
  {:else}
    <input {type} {name} {value}>
  {/if}
{:else}
  {#if type === 'textarea'}
    <textarea {name} cols="30" rows="10"
      on:change={(e) => changeButtonState(e.currentTarget)}>{value}</textarea>
  {:else}
    <input {type} {name} {value} on:change={(e) => changeButtonState(e.currentTarget)}>
  {/if}
{/if}
