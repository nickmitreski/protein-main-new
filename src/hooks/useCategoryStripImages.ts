import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_STRIP_ITEMS } from '../data/categoryStrip';

/**
 * Returns image URL per category key. Uses Pexels when `VITE_PEXELS_API_KEY` is set (browser-safe demo;
 * for production, proxy via Supabase Edge Function). Otherwise uses curated Unsplash fallbacks.
 */
export function useCategoryStripImages(): Record<string, string> {
  const key = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

  const fallbacks = useMemo(
    () =>
      Object.fromEntries(CATEGORY_STRIP_ITEMS.map((c) => [c.key, c.fallbackImage])) as Record<
        string,
        string
      >,
    []
  );

  const [urls, setUrls] = useState<Record<string, string>>(fallbacks);

  useEffect(() => {
    setUrls(fallbacks);
  }, [fallbacks]);

  useEffect(() => {
    if (!key?.trim()) return;

    let cancelled = false;

    (async () => {
      for (const cat of CATEGORY_STRIP_ITEMS) {
        if (cancelled) break;
        try {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(cat.pexelsQuery)}&per_page=1&orientation=square`,
            { headers: { Authorization: key } }
          );
          if (!res.ok) continue;
          const data = (await res.json()) as { photos?: Array<{ src?: { large2x?: string; large?: string } }> };
          const src = data.photos?.[0]?.src?.large2x ?? data.photos?.[0]?.src?.large;
          if (src && !cancelled) {
            setUrls((prev) => ({ ...prev, [cat.key]: src }));
          }
        } catch {
          /* keep fallback */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return urls;
}
