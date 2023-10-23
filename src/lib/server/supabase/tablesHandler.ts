import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../../DatabaseDefinitions';

export class TablesHandler {
  constructor(protected supabase: SupabaseClient<Database>) {}
}
