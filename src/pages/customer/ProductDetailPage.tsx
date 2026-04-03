import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BUSINESS } from '../../constants/business';
import { useProduct, useProducts } from '../../hooks/useProducts';
import { useReviews, useCreateReview } from '../../hooks/useReviews';
import { useCartStore } from '../../store/cartStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../utils/design-system';
import StarRating from '../../components/StarRating';
import { CatalogProductCard } from '../../components/customer/CatalogProductCard';
import { Check, ShieldCheck, Truck, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'nutrition' | 'ingredients' | 'usage' | 'reviews';

export function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id);
  const { data: allProducts = [] } = useProducts({ category: product?.category });
  const { data: reviews = [] } = useReviews(id);
  const createReview = useCreateReview();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const relatedProducts = allProducts.filter((p) => p.id !== product?.id).slice(0, 4);

  if (isLoading) {
    return (
      <div className={spacing.container + ' py-24'}>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="aspect-square bg-gray-200" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={spacing.container + ' py-24'}>
        <p className="mb-6" style={{ color: colors.black }}>
          Product not found.
        </p>
        <Button variant="outline" onClick={() => navigate('/shop')}>
          Back to shop
        </Button>
      </div>
    );
  }

  const hasNutrition = Boolean(product.nutrition_facts);
  const nutritionFacts = product.nutrition_facts;
  const benefits = product.benefits;
  const keyFeatures = product.key_features;
  const ingredients = product.ingredients;
  const usageInstructions = product.usage_instructions;
  const warnings = product.warnings;

  const allTabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'nutrition', label: 'Nutrition', show: !!hasNutrition },
    { id: 'ingredients', label: 'Ingredients', show: !!(ingredients?.length) },
    { id: 'usage', label: 'Usage & Safety', show: !!(usageInstructions || warnings) },
    { id: 'reviews', label: `Reviews (${reviews.length})`, show: true },
  ];
  const tabs = allTabs.filter((t) => t.show);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || reviewerName.trim().length < 2) {
      toast.error('Please enter your name (at least 2 characters)');
      return;
    }
    if (!reviewerEmail.trim() || !reviewerEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!reviewBody.trim()) {
      toast.error('Please write a review');
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error('Reviews require Supabase to be configured');
      return;
    }
    await createReview.mutateAsync({
      product_id: id,
      rating: reviewRating,
      title: reviewTitle.trim(),
      body: reviewBody.trim(),
      customer_name: reviewerName.trim(),
      customer_id: null,
      reviewer_email: reviewerEmail.trim(),
    });
    setReviewSubmitted(true);
    setReviewTitle('');
    setReviewBody('');
    setReviewerName('');
    setReviewerEmail('');
    setReviewRating(5);
  };

  return (
    <div className={spacing.container + ' py-12'}>
      <nav className="text-xs uppercase tracking-widest mb-10" style={{ color: colors.gray500 }}>
        <Link to="/shop" className="hover:opacity-70 transition-opacity">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:opacity-70 transition-opacity"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span style={{ color: colors.black }}>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
        <div className="relative">
          <div className="aspect-square overflow-hidden border" style={{ borderColor: colors.lightGrey }}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          {(product as any).badge && (
            <span
              className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              style={{
                backgroundColor:
                  (product as any).badge === 'Best Seller'
                    ? colors.red
                    : (product as any).badge === 'New'
                    ? colors.accent
                    : colors.secondary,
              }}
            >
              {(product as any).badge}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: colors.gray500 }}>
            {product.category}
          </p>
          <h1 className={`${typography.h2} mb-4 leading-tight`} style={{ color: colors.black }}>
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm font-medium" style={{ color: colors.black }}>
              {product.rating}
            </span>
            <span className="text-sm" style={{ color: colors.gray500 }}>
              ({product.review_count.toLocaleString()} reviews)
            </span>
          </div>
          <p className={`${typography.body} mb-6 leading-relaxed`} style={{ color: colors.gray500 }}>
            {product.description}
          </p>

          {keyFeatures && keyFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {keyFeatures.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wide border"
                  style={{ borderColor: colors.lightGrey, color: colors.black }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-2">
            <p className="text-4xl font-bold" style={{ color: colors.black }}>
              ${product.price.toFixed(2)}
            </p>
            {(product as any).compareAtPrice && (
              <p className="text-xl line-through" style={{ color: colors.gray400 }}>
                ${(product as any).compareAtPrice.toFixed(2)}
              </p>
            )}
            {(product as any).compareAtPrice && (
              <span
                className="px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: colors.red }}
              >
                Save ${((product as any).compareAtPrice - product.price).toFixed(0)}
              </span>
            )}
          </div>

          <p className="text-sm mb-8" style={{ color: product.stock_quantity > 10 ? colors.success : product.stock_quantity > 0 ? colors.warning : colors.error }}>
            {product.stock_quantity > 10
              ? `In Stock (${product.stock_quantity} units)`
              : product.stock_quantity > 0
              ? `Low Stock — only ${product.stock_quantity} left`
              : 'Out of Stock'}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border" style={{ borderColor: colors.lightGrey }}>
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-3 hover:bg-gray-100 transition-colors font-semibold"
                style={{ color: colors.black }}
              >
                −
              </button>
              <span className="px-5 py-3 text-sm font-semibold border-x" style={{ color: colors.black, borderColor: colors.lightGrey }}>
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="px-4 py-3 hover:bg-gray-100 transition-colors font-semibold"
                style={{ color: colors.black }}
              >
                +
              </button>
            </div>
            <Button
              onClick={() => {
                if (product.stock_quantity <= 0) {
                  toast.error('This product is out of stock');
                  return;
                }
                addItem(product, qty);
                toast.success(`${qty} × ${product.name} added to cart`);
              }}
              disabled={product.stock_quantity <= 0}
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>

          <Button variant="outline" fullWidth onClick={() => navigate('/cart')}>
            View Cart
          </Button>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{ borderColor: colors.lightGrey }}>
            {[
              { icon: Truck, label: 'Free standard shipping on orders over $100 (AU)' },
              { icon: ShieldCheck, label: 'Genuine CoreForge SKU' },
              { icon: Zap, label: 'Usually dispatches in 1–2 business days' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="mx-auto mb-1" style={{ color: colors.gray500 }} />
                <p className="text-xs leading-tight" style={{ color: colors.gray500 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed mt-6" style={{ color: colors.gray500 }}>
            <strong style={{ color: colors.black }}>Notice:</strong> For use only as a food or dietary supplement, not
            as a treatment for any medical condition. Follow the label; individual responses vary.{' '}
            <Link to="/supplement-disclaimer" className="underline" style={{ color: colors.black }}>
              Supplement disclaimer
            </Link>
            {' · '}
            <a href={`mailto:${BUSINESS.email}`} className="underline" style={{ color: colors.black }}>
              {BUSINESS.email}
            </a>
          </p>
        </div>
      </div>

      <div className="mb-16">
        <div className="flex border-b gap-1" style={{ borderColor: colors.lightGrey }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="px-6 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors"
              style={{
                borderBottomColor: activeTab === tab.id ? colors.red : 'transparent',
                color: activeTab === tab.id ? colors.black : colors.gray500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {benefits && benefits.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: colors.black }}>
                    Key Benefits
                  </h3>
                  <ul className="space-y-3">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <Check size={16} className="mt-0.5 shrink-0" style={{ color: colors.success }} />
                        <span className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: colors.black }}>
                  Product Details
                </h3>
                <dl className="space-y-3 text-sm">
                  {[
                    { label: 'Category', value: product.category },
                    { label: 'SKU', value: product.sku },
                    { label: 'Servings', value: (product as any).servings ? `${(product as any).servings} serves` : undefined },
                    { label: 'Flavor', value: (product as any).flavor },
                    { label: 'Size', value: (product as any).size },
                  ]
                    .filter((item) => item.value)
                    .map(({ label, value }) => (
                      <div key={label} className="flex gap-3">
                        <dt className="font-semibold w-24 shrink-0" style={{ color: colors.black }}>
                          {label}
                        </dt>
                        <dd style={{ color: colors.gray500 }}>{value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && nutritionFacts && (
            <div className="max-w-sm">
              <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: colors.black }}>
                Nutrition Facts
              </h3>
              <div className="border-2 p-4" style={{ borderColor: colors.black }}>
                <p className="text-2xl font-black mb-1" style={{ color: colors.black }}>Nutrition Facts</p>
                {nutritionFacts.servingSize != null && String(nutritionFacts.servingSize) !== '' && (
                  <p className="text-sm mb-1" style={{ color: colors.black }}>
                    Serving Size: {String(nutritionFacts.servingSize)}
                  </p>
                )}
                {nutritionFacts.servingsPerContainer != null &&
                  String(nutritionFacts.servingsPerContainer) !== '' && (
                  <p className="text-sm mb-2" style={{ color: colors.black }}>
                    Servings Per Container: {String(nutritionFacts.servingsPerContainer)}
                  </p>
                )}
                <div className="border-t-4 pt-2" style={{ borderColor: colors.black }}>
                  {[
                    { label: 'Calories', value: nutritionFacts.calories },
                    { label: 'Protein', value: nutritionFacts.protein },
                    { label: 'Total Carbohydrate', value: nutritionFacts.carbs },
                    { label: 'Total Fat', value: nutritionFacts.fat },
                  ]
                    .filter((item) => item.value !== undefined && item.value !== null)
                    .map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between py-1.5 border-b text-sm"
                        style={{ borderColor: colors.lightGrey }}
                      >
                        <span className="font-medium" style={{ color: colors.black }}>
                          {label}
                        </span>
                        <span style={{ color: colors.black }}>{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && ingredients && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: colors.black }}>
                Ingredients
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>
                {ingredients.join(', ')}
              </p>
              {(product as any).allergens && (product as any).allergens.length > 0 && (
                <div className="mt-4 p-4 border-l-4" style={{ borderColor: colors.warning, backgroundColor: '#FFFBF5' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: colors.black }}>
                    Allergen Information
                  </p>
                  <p className="text-sm" style={{ color: colors.gray600 }}>
                    Contains: {(product as any).allergens.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-2xl space-y-6">
              {usageInstructions && (
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-3" style={{ color: colors.black }}>
                    Directions
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>
                    {usageInstructions}
                  </p>
                </div>
              )}
              {warnings && (
                <div className="p-4 border-l-4" style={{ borderColor: colors.error, backgroundColor: '#FFF5F5' }}>
                  <p className="text-sm font-bold mb-1 uppercase tracking-wide" style={{ color: colors.error }}>
                    Warning
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>
                    {warnings}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-2xl space-y-8">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b pb-6" style={{ borderColor: colors.lightGrey }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < r.rating ? '#f59e0b' : 'none'}
                              stroke={i < r.rating ? '#f59e0b' : colors.gray400}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: colors.black }}>{r.customer_name}</span>
                        {r.is_verified && (
                          <span className="text-xs px-2 py-0.5 border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                            Verified
                          </span>
                        )}
                      </div>
                      {r.title && <p className="text-sm font-semibold mb-1" style={{ color: colors.black }}>{r.title}</p>}
                      <p className="text-sm leading-relaxed" style={{ color: colors.gray600 }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: colors.gray500 }}>No reviews yet. Be the first to review this product.</p>
              )}

              {reviewSubmitted ? (
                <div className="border p-4 text-sm" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                  Thank you for your review! It will appear after approval.
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide mb-4" style={{ color: colors.black }}>
                    Write a Review
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <p className="text-xs" style={{ color: colors.gray500 }}>
                      No account required. Your email is only used if we need to follow up; it is not shown publicly
                      until the review is approved.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                          Your name *
                        </label>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Alex"
                          required
                          className="w-full border px-3 py-2 text-sm"
                          style={{ borderColor: colors.lightGrey, color: colors.black }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                          Email *
                        </label>
                        <input
                          type="email"
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className="w-full border px-3 py-2 text-sm"
                          style={{ borderColor: colors.lightGrey, color: colors.black }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: colors.gray500 }}>
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star
                              size={24}
                              fill={i < reviewRating ? '#f59e0b' : 'none'}
                              stroke={i < reviewRating ? '#f59e0b' : colors.gray400}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarise your experience"
                        className="w-full border px-3 py-2 text-sm"
                        style={{ borderColor: colors.lightGrey, color: colors.black }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.gray500 }}>
                        Review *
                      </label>
                      <textarea
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Share your thoughts on this product"
                        rows={4}
                        required
                        className="w-full border px-3 py-2 text-sm resize-none"
                        style={{ borderColor: colors.lightGrey, color: colors.black }}
                      />
                    </div>
                    <Button type="submit" isLoading={createReview.isPending}>
                      Submit Review
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2
            className="text-2xl font-bold uppercase tracking-wide mb-8"
            style={{ color: colors.black }}
          >
            More in {product.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <CatalogProductCard
                key={p.id}
                product={p}
                onAddToCart={(prod) => {
                  addItem(prod, 1);
                  toast.success('Added to cart');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
