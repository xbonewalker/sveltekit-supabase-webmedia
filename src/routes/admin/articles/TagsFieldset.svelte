<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';

  export let fieldsetDisabled: boolean = false;
  export let buttonDisabled: boolean = false;
</script>

<fieldset name="tagsFieldset" disabled={fieldsetDisabled}>
  {#each Array(3) as _, i}
    <TextInput name={`tag${i + 1}`} validation={{ maxlength: 10 }} />
  {/each}
  <button disabled={buttonDisabled}>Save</button>
</fieldset>
