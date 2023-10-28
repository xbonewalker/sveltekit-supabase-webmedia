<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';
</script>

<fieldset name="tagsFieldset" disabled>
  {#each Array(3) as _, i}
    <TextInput name={`tag${i + 1}`} />
  {/each}
  <button id="tagsFormButton" disabled>Save</button>
</fieldset>
