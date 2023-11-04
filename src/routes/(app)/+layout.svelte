<script lang="ts">
	import { goto } from '$app/navigation';

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
</script>

<nav>
  <ul>
    <li>
      <a href="/">Home</a>
    </li>
    {#if session}
      <li>
        <a href="/signin" on:click={handleSignOut}>Sign out</a>
      </li>
    {/if}
  </ul>
</nav>

<slot />

<style>
  ul {
    display: flex;
    padding: 0;
    list-style-type: none;
  }
  li {
    margin-right: 10px;
  }
</style>
