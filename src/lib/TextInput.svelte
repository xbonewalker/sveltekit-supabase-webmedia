<script lang="ts">
  export let name: string;
  export let form: { [fieldName: string]: any } & { errors?: { [fieldName: string]: string[] } } | null;
  export let currentValue: string | undefined;
</script>

{#if form?.errors?.[name]}
  {#each form.errors[name] as message}
    <p>{message}</p>
  {/each}
{/if}
<input type="text" {name} value={form?.[name] ?? currentValue ?? ''}>
