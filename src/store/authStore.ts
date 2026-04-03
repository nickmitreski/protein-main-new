import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/** Demo admin login when Supabase env is not set (password ignored). */
export const DEMO_ADMIN_EMAIL = 'admin@coreforge.test';

function parseAdminEmailsFromEnv(): string[] {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function roleFromJwt(authUser: AuthUser): 'admin' | 'customer' | null {
  const raw = authUser.app_metadata?.role ?? authUser.user_metadata?.role;
  if (raw === 'admin') return 'admin';
  if (raw === 'customer') return 'customer';
  return null;
}

function isEnvListedAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return parseAdminEmailsFromEnv().includes(email.trim().toLowerCase());
}

/**
 * Resolves admin vs customer after Supabase Auth:
 * 1) JWT app_metadata / user_metadata role (set in Supabase Dashboard → User → raw app metadata)
 * 2) public.customers.role
 * 3) VITE_ADMIN_EMAILS (comma-separated) for first-time bootstrap without a customers row
 */
export async function resolveAuthRole(authUser: AuthUser): Promise<'admin' | 'customer'> {
  const jwt = roleFromJwt(authUser);
  if (jwt === 'admin') return 'admin';

  const { data, error } = await supabase
    .from('customers')
    .select('role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    console.warn('[auth] customers lookup failed:', error.message);
  } else if (data?.role === 'admin') return 'admin';
  else if (data?.role === 'customer') return 'customer';

  if (isEnvListedAdmin(authUser.email ?? undefined)) return 'admin';
  if (jwt === 'customer') return 'customer';
  return 'customer';
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      signIn: async (email: string, password: string): Promise<User> => {
        try {
          set({ loading: true, error: null });

          if (!isSupabaseConfigured) {
            await new Promise((r) => setTimeout(r, 200));
            const role =
              email.trim().toLowerCase() === DEMO_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'customer';
            const user: User = {
              id: `dev_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email: email.trim(),
              role,
              created_at: new Date().toISOString(),
            };
            set({ user, loading: false });
            return user;
          }

          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          if (!data.user) throw new Error('Sign in failed');

          const role = await resolveAuthRole(data.user);
          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            role,
            created_at: data.user.created_at,
          };
          set({ user, loading: false });
          return user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign in failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          if (!isSupabaseConfigured) {
            await new Promise((r) => setTimeout(r, 200));
            const user: User = {
              id: `dev_${Date.now()}`,
              email: email.trim(),
              role: 'customer',
              created_at: new Date().toISOString(),
            };
            set({ user, loading: false });
            return;
          }

          void email;
          void password;
          throw new Error('Public sign up is disabled. Create users in Supabase Dashboard → Authentication.');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign up failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          if (isSupabaseConfigured) {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
          }
          set({ user: null, loading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Sign out failed';
          set({ error: message, loading: false });
          throw error;
        }
      },

      checkSession: async () => {
        try {
          if (!isSupabaseConfigured) {
            set({ loading: false });
            return;
          }

          const existing = get().user;
          set({ loading: true });

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            set({ user: null, loading: false });
            return;
          }

          const role = await resolveAuthRole(session.user);

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            role,
            created_at: session.user.created_at,
          };

          if (existing?.id === session.user.id && existing.role === role && existing.email === user.email) {
            set({ loading: false });
            return;
          }

          set({ user, loading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Session check failed';
          set({ error: message, loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
