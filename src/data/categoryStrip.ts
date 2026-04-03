/**
 * Homepage category strip: copy, deep-link targets, static hero images, and Pexels search terms.
 * With VITE_PEXELS_API_KEY set, `useCategoryStripImages` can swap in API photos (see hook).
 */
export type CategoryStripItem = {
  key: string;
  name: string;
  description: string;
  /** Path + query for React Router */
  to: string;
  /** Curated Unsplash URLs (fitness / supplements–aligned, high-res, hotlink-safe) */
  fallbackImage: string;
  /** Pexels search query when API key is present */
  pexelsQuery: string;
};

export const CATEGORY_STRIP_ITEMS: CategoryStripItem[] = [
  {
    key: 'protein',
    name: 'Protein Powders',
    description: 'Build & recover',
    to: '/shop?category=Protein+Powders',
    fallbackImage:
      'https://images.pexels.com/photos/3735207/pexels-photo-3735207.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'whey protein powder supplement jar gym',
  },
  {
    key: 'creatine',
    name: 'Creatine',
    description: 'Strength & power',
    to: '/shop?category=Creatine',
    fallbackImage:
      'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'creatine supplement fitness powder',
  },
  {
    key: 'preworkout',
    name: 'Pre-Workouts',
    description: 'Energy & focus',
    to: '/shop?category=Pre-Workout',
    fallbackImage:
      'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'pre workout energy gym dumbbells',
  },
  {
    key: 'bcaa',
    name: 'BCAAs & Recovery',
    description: 'Repair & endure',
    to: '/shop?search=BCAA',
    fallbackImage:
      'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'bcaa amino acids recovery drink athlete',
  },
  {
    key: 'fatburn',
    name: 'Fat Burners',
    description: 'Lean & shred',
    to: '/shop?search=Thermogenic',
    fallbackImage:
      'https://images.pexels.com/photos/2827400/pexels-photo-2827400.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'cardio training lean fitness metabolism',
  },
  {
    key: 'vitamins',
    name: 'Vitamins',
    description: 'Health & wellness',
    to: '/shop?category=Recovery+%26+Performance',
    fallbackImage:
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop',
    pexelsQuery: 'vitamins supplements health wellness bottles',
  },
];
