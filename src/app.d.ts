import { SupabaseClient, Session } from '@supabase/supabase-js';

import { Database } from './DatabaseDefinitions';

import type { TablesRow } from '$lib/database.types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<Session | null>
      getSignedInCreator(): Promise<Pick<TablesRow<'profiles'>, 'id' | 'username' | 'role'> | undefined>
    }
    interface PageData {
      session: Session | null
    }
    // interface Error {}
    // interface Platform {}
  }
}
