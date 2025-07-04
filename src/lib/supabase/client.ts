// lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  return createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        storageKey: 'vantage-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}