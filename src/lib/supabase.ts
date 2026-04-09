import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
/** Legacy JWT anon key (eyJ...) or newer publishable key (sb_publishable_...). */
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();

/** Public key for Authorization headers (e.g. Edge Functions) — matches the browser Supabase client. */
export function getBrowserSupabaseAnonKey(): string {
  return supabaseAnonKey ?? '';
}

const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your_supabase') &&
    !supabaseAnonKey.includes('your_supabase')
);

/**
 * Untyped client: add generated `Database` from Supabase CLI later for full type-safe `.from()` rows.
 * Hooks cast responses to app types (`Product`, `Order`, etc.).
 *
 * Single instance via globalThis avoids "Multiple GoTrueClient instances" if the module is evaluated
 * more than once (e.g. dev HMR). Explicit storageKey avoids clashing with other apps on the same origin.
 */
const globalSupabase = globalThis as typeof globalThis & {
  __COREFORGE_SUPABASE_CLIENT__?: SupabaseClient;
};

function createBrowserClient(): SupabaseClient {
  return createClient(
    isSupabaseConfigured ? supabaseUrl! : placeholderUrl,
    isSupabaseConfigured ? supabaseAnonKey! : placeholderAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'coreforge-supabase-auth-v1',
      },
    }
  );
}

export const supabase: SupabaseClient =
  globalSupabase.__COREFORGE_SUPABASE_CLIENT__ ??
  (globalSupabase.__COREFORGE_SUPABASE_CLIENT__ = createBrowserClient());
