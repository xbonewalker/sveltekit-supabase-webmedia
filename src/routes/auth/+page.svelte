<script lang="ts">
  import { goto } from '$app/navigation';

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let email = '';
  let password = '';

  let message = '';
  let success = false;
  $: error = !success;

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      message = error.message;
      success = false;
      return;
    }

    email = '';
    password = '';

    message = 'Please check your email for a magic link to log into the website';
    success = true;
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      message = error.message;
      success = false;
      return;
    }

    goto('/');
  };
</script>

{#if message}
  <p class:success class:error>{message}</p>
{/if}
<input name="email" bind:value="{email}" />
<input type="password" name="password" bind:value="{password}" />

<button on:click="{handleSignUp}">Sign up</button>
<button on:click="{handleSignIn}">Sign in</button>
