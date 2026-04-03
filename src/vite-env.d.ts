/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy anon JWT, or use VITE_SUPABASE_PUBLISHABLE_KEY for newer Supabase keys. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /**
   * Comma-separated emails that should receive admin role if `customers.role` is missing or still customer.
   * Use only for bootstrapping; prefer `customers.role = 'admin'` or Auth app_metadata in production.
   */
  readonly VITE_ADMIN_EMAILS?: string;
  readonly VITE_SQUARE_APPLICATION_ID?: string;
  /** sandbox | production — Web Payments SDK */
  readonly VITE_SQUARE_ENVIRONMENT?: string;
  readonly VITE_SQUARE_LOCATION_ID?: string;
  /** Optional: Pexels API key for dynamic category strip photos (see useCategoryStripImages). */
  readonly VITE_PEXELS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
