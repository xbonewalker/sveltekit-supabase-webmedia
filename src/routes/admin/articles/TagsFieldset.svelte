<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';
</script>

<fieldset name="tagsFieldset">
  {#each Array(3) as _, i}
    <TextInput name={`tag${i + 1}`} />
  {/each}
  <button>Save</button>
</fieldset>
