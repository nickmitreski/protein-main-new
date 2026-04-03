import { subDays } from 'date-fns';
import { products as catalogProducts } from './products';
import type { Address, Customer, Order, OrderFilters, Product, ProductFilters } from '../types';

const now = new Date().toISOString();

export function getMockProducts(): Product[] {
  return catalogProducts.map((p, i) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    rating: p.rating,
    review_count: p.reviewCount,
    badge: p.badge,
    stock_quantity: i === 1 ? 4 : 24 + i * 11,
    track_inventory: true,
    continue_selling_when_out_of_stock: false,
    requires_shipping: true,
    is_active: i !== catalogProducts.length - 1,
    sku: `CFG-${p.id.padStart(4, '0')}`,
    vendor: 'CoreForge Nutrition',
    product_type: 'Supplement',
    created_at: now,
    updated_at: now,
  }));
}

const sampleAddress = (first: string, last: string): Address => ({
  first_name: first,
  last_name: last,
  address1: '2147 Commerce St',
  city: 'Austin',
  province: 'TX',
  postal_code: '78701',
  country: 'US',
});

export const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    email: 'jordan.m@email.com',
    first_name: 'Jordan',
    last_name: 'Miles',
    phone: '+1 512-555-0101',
    accepts_marketing: true,
    total_spent: 189.97,
    orders_count: 2,
    state: 'enabled',
    tags: ['vip', 'protein'],
    created_at: subDays(new Date(), 45).toISOString(),
    updated_at: now,
    default_address: sampleAddress('Jordan', 'Miles'),
  },
  {
    id: 'cust_2',
    email: 'sam.k@email.com',
    first_name: 'Sam',
    last_name: 'Kim',
    accepts_marketing: false,
    total_spent: 79.99,
    orders_count: 1,
    state: 'enabled',
    tags: ['performance'],
    created_at: subDays(new Date(), 12).toISOString(),
    updated_at: now,
    default_address: sampleAddress('Sam', 'Kim'),
  },
  {
    id: 'cust_3',
    email: 'taylor.r@email.com',
    first_name: 'Taylor',
    last_name: 'Reed',
    accepts_marketing: true,
    total_spent: 0,
    orders_count: 0,
    state: 'enabled',
    tags: [],
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: now,
    default_address: sampleAddress('Taylor', 'Reed'),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord_1001',
    order_number: '#1042',
    customer_id: 'cust_1',
    customer_email: 'jordan.m@email.com',
    customer_name: 'Jordan Miles',
    status: 'delivered',
    payment_status: 'paid',
    fulfillment_status: 'fulfilled',
    subtotal: 139.98,
    tax: 14.0,
    shipping: 0,
    discount: 0,
    total: 153.98,
    currency: 'USD',
    shipping_address: sampleAddress('Jordan', 'Miles'),
    billing_address: sampleAddress('Jordan', 'Miles'),
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: subDays(new Date(), 4).toISOString(),
  },
  {
    id: 'ord_1002',
    order_number: '#1043',
    customer_id: 'cust_1',
    customer_email: 'jordan.m@email.com',
    customer_name: 'Jordan Miles',
    status: 'processing',
    payment_status: 'paid',
    fulfillment_status: 'unfulfilled',
    subtotal: 49.99,
    tax: 5.0,
    shipping: 9.99,
    discount: 0,
    total: 64.98,
    currency: 'USD',
    shipping_address: sampleAddress('Jordan', 'Miles'),
    billing_address: sampleAddress('Jordan', 'Miles'),
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: now,
  },
  {
    id: 'ord_1003',
    order_number: '#1044',
    customer_id: 'cust_2',
    customer_email: 'sam.k@email.com',
    customer_name: 'Sam Kim',
    status: 'pending',
    payment_status: 'pending',
    fulfillment_status: 'unfulfilled',
    subtotal: 79.99,
    tax: 8.0,
    shipping: 9.99,
    discount: 0,
    total: 97.98,
    currency: 'USD',
    shipping_address: sampleAddress('Sam', 'Kim'),
    billing_address: sampleAddress('Sam', 'Kim'),
    created_at: now,
    updated_at: now,
  },
];

export function filterMockProducts(
  filters: ProductFilters | undefined,
  list: Product[] = getMockProducts()
): Product[] {
  let out = [...list];
  if (!filters?.includeInactive) {
    out = out.filter((p) => p.is_active);
  }
  if (filters?.category) {
    out = out.filter((p) => p.category === filters.category);
  }
  if (filters?.minPrice !== undefined) {
    out = out.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    out = out.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.inStock) {
    out = out.filter((p) => p.stock_quantity > 0);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (filters?.sortBy) {
    const { sortBy } = filters;
    out.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.created_at.localeCompare(a.created_at);
        default:
          return 0;
      }
    });
  } else {
    out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  return out;
}

export function filterMockOrders(
  filters: OrderFilters | undefined,
  list: Order[] = mockOrders
): Order[] {
  let out = [...list];
  if (filters?.status) {
    out = out.filter((o) => o.status === filters.status);
  }
  if (filters?.payment_status) {
    out = out.filter((o) => o.payment_status === filters.payment_status);
  }
  if (filters?.fulfillment_status) {
    out = out.filter((o) => o.fulfillment_status === filters.fulfillment_status);
  }
  if (filters?.date_from) {
    out = out.filter((o) => o.created_at >= filters.date_from!);
  }
  if (filters?.date_to) {
    out = out.filter((o) => o.created_at <= filters.date_to!);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q)
    );
  }
  out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}
