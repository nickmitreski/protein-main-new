import type { Product as StoreProduct } from '../types';
import type { Product as CatalogProduct } from '../data/products';

/** Maps catalog demo products to the store `Product` shape used by cart, checkout, and `/shop`. */
export function catalogProductToStoreProduct(p: CatalogProduct): StoreProduct {
  const now = new Date().toISOString();
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    compare_at_price: p.compareAtPrice,
    image: p.image,
    category: p.category,
    rating: p.rating,
    review_count: p.reviewCount,
    badge: p.badge,
    stock_quantity: p.stock,
    track_inventory: true,
    continue_selling_when_out_of_stock: false,
    requires_shipping: true,
    is_active: true,
    sku: p.sku,
    vendor: 'CoreForge',
    product_type: 'Supplement',
    created_at: now,
    updated_at: now,
  };
}
