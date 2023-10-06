import { SupabaseClient, Session } from '@supabase/supabase-js';

import { Database } from './DatabaseDefinitions';

import type { Tables } from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
      getSignedInCreator(): Promise<Pick<Tables<'profiles'>, 'username' | 'role'> | undefined>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}
