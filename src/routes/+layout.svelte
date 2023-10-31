<script lang="ts">
  import { onMount } from 'svelte';

  import { invalidate } from '$app/navigation';

  import './styles.css';

  export let data;

  let { supabase, session } = data;
  $: ({ supabase, session } = data);

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

<slot />

<!-- <style>
  :global(.error) {
    color: red;
  }
</style> -->
