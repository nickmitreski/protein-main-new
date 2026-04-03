import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from 'recharts';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { Card } from '../../components/ui/Card';
import { colors } from '../../utils/design-system';
import { CURRENCY_SYMBOL } from '../../constants';
import { format, parseISO, subDays } from 'date-fns';

const CATEGORY_COLORS = ['#E63946', '#1D3557', '#F77F00', '#2A9D8F', '#457B9D', '#6B7280'];

export function AnalyticsPage() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts({ includeInactive: true });

  const totals = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === 'paid');
    const sales = paid.reduce((s, o) => s + o.total, 0);
    const pending = orders.filter((o) => o.status === 'pending').length;
    const fulfilled = orders.filter((o) => o.fulfillment_status === 'fulfilled').length;
    return {
      sales,
      orders: orders.length,
      aov: paid.length ? sales / paid.length : 0,
      pending,
      fulfilled,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const days = 30;
    const byDay = new Map<string, number>();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const key = format(subDays(now, i), 'MMM d');
      byDay.set(key, 0);
    }
    orders
      .filter((o) => o.payment_status === 'paid')
      .forEach((o) => {
        const key = format(parseISO(o.created_at), 'MMM d');
        if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + o.total);
      });
    return Array.from(byDay.entries()).map(([date, sales]) => ({ date, sales }));
  }, [orders]);

  const categoryData = useMemo(() => {
    const byCat = new Map<string, number>();
    orders
      .filter((o) => o.payment_status === 'paid')
      .forEach((o) => {
        const key = 'All Orders';
        byCat.set(key, (byCat.get(key) ?? 0) + o.total);
      });

    const prodByCategory = new Map<string, { count: number }>();
    products.forEach((p) => {
      const entry = prodByCategory.get(p.category) ?? { count: 0 };
      entry.count++;
      prodByCategory.set(p.category, entry);
    });

    return Array.from(prodByCategory.entries()).map(([category, data]) => ({
      category: category.length > 18 ? category.slice(0, 16) + '…' : category,
      products: data.count,
    }));
  }, [orders, products]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.review_count - a.review_count)
      .slice(0, 5);
  }, [products]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: colors.black }}>
          Analytics
        </h1>
        <p className="text-sm" style={{ color: colors.gray500 }}>
          Sales overview and store performance
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Gross Sales', value: `${CURRENCY_SYMBOL}${totals.sales.toFixed(2)}` },
          { label: 'Total Orders', value: String(totals.orders) },
          { label: 'Avg Order Value', value: `${CURRENCY_SYMBOL}${totals.aov.toFixed(2)}` },
          { label: 'Pending Orders', value: String(totals.pending) },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.gray500 }}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.black }}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card title="Sales — last 30 days" subtitle="Paid orders only">
            <div className="h-64 w-full">
              {orders.filter((o) => o.payment_status === 'paid').length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm" style={{ color: colors.gray500 }}>
                    No paid orders yet.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cfSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.red} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={colors.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.lightGrey} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: colors.gray500 }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: colors.gray500 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${CURRENCY_SYMBOL}${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        border: `1px solid ${colors.lightGrey}`,
                        borderRadius: 0,
                        fontSize: 12,
                      }}
                      formatter={(value) => [
                        `${CURRENCY_SYMBOL}${Number(value ?? 0).toFixed(2)}`,
                        'Sales',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke={colors.red}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cfSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <Card title="Products by Category">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: colors.gray500 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 9, fill: colors.gray500 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{ border: `1px solid ${colors.lightGrey}`, borderRadius: 0, fontSize: 12 }}
                  formatter={(v) => [v, 'Products']}
                />
                <Bar dataKey="products" radius={0}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Top Products by Reviews">
        <div className="space-y-3">
          {topProducts.length === 0 ? (
            <p className="text-sm" style={{ color: colors.gray500 }}>
              No products found.
            </p>
          ) : (
            topProducts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-4 p-3 border"
                style={{ borderColor: colors.lightGrey }}
              >
                <span
                  className="text-xs font-bold w-6 text-center shrink-0"
                  style={{ color: colors.gray500 }}
                >
                  #{i + 1}
                </span>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-10 h-10 object-cover shrink-0"
                  style={{ backgroundColor: colors.lightGrey }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: colors.black }}>
                    {p.name}
                  </p>
                  <p className="text-xs" style={{ color: colors.gray500 }}>
                    {p.category}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: colors.black }}>
                    {CURRENCY_SYMBOL}{p.price.toFixed(2)}
                  </p>
                  <p className="text-xs" style={{ color: colors.gray500 }}>
                    {p.rating} ★ ({p.review_count})
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
