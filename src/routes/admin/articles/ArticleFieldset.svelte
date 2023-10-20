<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';
</script>

<fieldset name="articleFieldset">
  <TextInput name="title" />
  <TextInput name="slug" />
  <TextInput name="content1" />
  <TextInput name="content2" />
  <button>Save</button>
</fieldset>
