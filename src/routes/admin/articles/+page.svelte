<script lang="ts">
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<form method="POST">
  {#if form?.errors.title}
    {#each form.errors.title as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="title" value={form?.title ?? ''}>

  {#if form?.errors.slug}
    {#each form.errors.slug as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="slug" value={form?.slug ?? ''}>

  {#if form?.errors.content1}
    {#each form.errors.content1 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content1" value={form?.content1 ?? ''}>

  {#if form?.errors.content2}
    {#each form.errors.content2 as message}
      <div>{message}</div>
    {/each}
  {/if}
  <input type="text" name="content2" value={form?.content2 ?? ''}>

  <button>Create</button>
</form>
