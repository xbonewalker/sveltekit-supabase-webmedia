<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';
</script>

<fieldset name="articleFieldset">
  <TextInput name="title" />
  <TextInput name="slug" />
  <TextInput type="textarea" name="content1" />
  <TextInput type="textarea" name="content2" />
  <button id="articleFormButton" disabled>Save</button>
</fieldset>
