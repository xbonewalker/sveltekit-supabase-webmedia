<script lang="ts">
  import TextInput from '$lib/TextInput.svelte';

  export let buttonDisabled: boolean = false;
</script>

<fieldset name="articleFieldset">
  <TextInput name="title" validation={{ required: true, maxlength: 20 }} />
  <TextInput name="slug" validation={{ required: true, maxlength: 10 }} />
  <TextInput type="textarea" name="content1" validation={{ required: true, maxlength: 100 }} />
  <TextInput type="textarea" name="content2" validation={{ required: true, maxlength: 100 }} />
  <button disabled={buttonDisabled}>Save</button>
</fieldset>
