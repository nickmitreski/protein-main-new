import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { Card } from '../../components/ui/Card';
import { colors } from '../../utils/design-system';
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../../constants';

export function DashboardPage() {
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();

  // Calculate stats
  const totalSales = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const lowStockProducts = products.filter((p) => p.stock_quantity < 10).length;

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      title: 'Total Sales',
      value: `${CURRENCY_SYMBOL}${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Active Products',
      value: activeProducts.toString(),
      icon: Package,
      trend: `${lowStockProducts} low stock`,
      trendUp: false,
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: Users,
      trend: 'Needs attention',
      trendUp: false,
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold uppercase tracking-wider mb-2"
          style={{ color: colors.black }}
        >
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: colors.gray500 }}>
          Welcome back! Here's an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.gray500 }}>
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mb-2" style={{ color: colors.black }}>
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1">
                    {stat.trendUp ? (
                      <TrendingUp size={14} style={{ color: colors.red }} />
                    ) : (
                      <TrendingDown size={14} style={{ color: colors.gray500 }} />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: stat.trendUp ? colors.red : colors.gray500 }}
                    >
                      {stat.trend}
                    </span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-none"
                  style={{ backgroundColor: colors.lightGrey }}
                >
                  <Icon size={24} style={{ color: colors.darkGrey }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card title="Recent Orders" className="mb-8">
        {recentOrders.length === 0 ? (
          <p className="text-center py-8" style={{ color: colors.gray500 }}>
            No orders yet
          </p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border"
                style={{ borderColor: colors.lightGrey }}
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: colors.black }}>
                    {order.order_number}
                  </p>
                  <p className="text-sm" style={{ color: colors.gray500 }}>
                    {order.customer_name} • {order.customer_email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold mb-1" style={{ color: colors.black }}>
                    {CURRENCY_SYMBOL}{order.total.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card title="Low Stock Alert">
          <p className="text-sm mb-4" style={{ color: colors.gray500 }}>
            {lowStockProducts} product(s) are running low on stock. Review your inventory.
          </p>
          <div className="space-y-2">
            {products
              .filter((p) => p.stock_quantity < 10)
              .slice(0, 5)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border"
                  style={{ borderColor: colors.lightGrey }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover"
                      style={{ backgroundColor: colors.lightGrey }}
                    />
                    <p className="font-semibold" style={{ color: colors.black }}>
                      {product.name}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800"
                  >
                    {product.stock_quantity} left
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
