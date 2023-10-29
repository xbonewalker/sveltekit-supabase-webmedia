<script lang="ts">
  import { goto } from '$app/navigation';

  export let data;
  let { supabase } = data;
  $: ({ supabase } = data);

  let email = '';
  let password = '';
  let username = '';

  let message = '';
  let success = false;
  $: error = !success;

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      message = 'Server error<br>Try again later';
      success = false;
      return;
    }

    email = '';
    password = '';
    username = '';

    message = 'Please check your email for a magic link to log into the website';
    success = true;
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      message = 'Server error<br>Try again later';
      success = false;
      return;
    }

    goto('/');
  };
</script>

{#if message}
  <p class:success class:error>{@html message}</p>
{/if}
<input type="email" name="email" bind:value="{email}" />
<input type="password" name="password" bind:value="{password}" />
<input type="text" name="username" bind:value="{username}" />

<button on:click="{handleSignUp}">Sign up</button>
<button on:click="{handleSignIn}">Sign in</button>
