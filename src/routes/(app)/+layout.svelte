<script lang="ts">
	import { goto } from '$app/navigation';

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    goto('/auth');
  };
</script>

{#if session}
  <button on:click="{handleSignOut}">Sign out</button>
{/if}

<slot />
