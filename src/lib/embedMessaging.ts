import { useCallback, useEffect, useRef } from 'react';

/** postMessage contract: CoreForge pay iframe ↔ partner storefront parent. */
export const EMBED_MSG = {
  /** Iframe → parent: listener is ready; parent should reply with INIT. */
  READY: 'COREFORGE_EMBED_READY',
  /** Parent → iframe: handshake; iframe records event.origin as trusted parent. */
  INIT: 'COREFORGE_EMBED_INIT',
  /** Iframe → parent: suggest iframe height (px) for modal sizing. */
  HEIGHT: 'COREFORGE_EMBED_HEIGHT',
  /** Iframe → parent: payment completed. */
  SUCCESS: 'COREFORGE_PAYMENT_SUCCESS',
  /** Iframe → parent: payment failed or user dismissed after error. */
  ERROR: 'COREFORGE_PAYMENT_ERROR',
} as const;

export function parseEmbedParentOrigins(): string[] {
  const raw = (import.meta.env.VITE_EMBED_PARENT_ORIGINS as string | undefined)?.trim();
  if (!raw) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function useEmbedMessaging(embed: boolean) {
  const parentOriginRef = useRef<string | null>(null);
  const allowedKey = (import.meta.env.VITE_EMBED_PARENT_ORIGINS as string | undefined)?.trim() ?? '';

  useEffect(() => {
    if (!embed || window.parent === window) return;

    const allowed = parseEmbedParentOrigins();

    function onMessage(event: MessageEvent) {
      if (event.data?.type !== EMBED_MSG.INIT) return;
      const origin = event.origin;
      if (allowed.length === 0) {
        if (import.meta.env.DEV) {
          console.warn(
            '[CoreForge embed] VITE_EMBED_PARENT_ORIGINS is empty; accepting parent origin in dev only:',
            origin
          );
          parentOriginRef.current = origin;
        } else {
          console.error(
            '[CoreForge embed] VITE_EMBED_PARENT_ORIGINS is not set on this build. The iframe loads but cannot handshake with the parent (resize/success). Set it in Vercel to your Laminin origin(s), e.g. https://lamininpeplab.com.au — include www if you use it.'
          );
        }
        return;
      }
      if (allowed.includes(origin)) {
        parentOriginRef.current = origin;
      } else if (import.meta.env.DEV) {
        console.warn('[CoreForge embed] INIT from unexpected origin (add to VITE_EMBED_PARENT_ORIGINS):', origin);
      }
    }

    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: EMBED_MSG.READY }, '*');

    return () => window.removeEventListener('message', onMessage);
  }, [embed, allowedKey]);

  const postToParent = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (!embed || window.parent === window) return;
      const target = parentOriginRef.current;
      if (!target) return;
      window.parent.postMessage({ type, ...payload }, target);
    },
    [embed]
  );

  useEffect(() => {
    if (!embed || window.parent === window) return;

    const sendHeight = () => {
      const h = Math.ceil(
        Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0, 480)
      );
      postToParent(EMBED_MSG.HEIGHT, { height: h });
    };

    sendHeight();
    const ro = new ResizeObserver(() => sendHeight());
    ro.observe(document.documentElement);
    const t = window.setInterval(sendHeight, 2000);
    return () => {
      ro.disconnect();
      window.clearInterval(t);
    };
  }, [embed, postToParent]);

  return { postToParent, parentOriginRef };
}
