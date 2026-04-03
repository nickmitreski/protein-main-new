import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export function AuthInitializer() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      void checkSession();
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      void checkSession();
    });
    return unsub;
  }, [checkSession]);

  return null;
}
