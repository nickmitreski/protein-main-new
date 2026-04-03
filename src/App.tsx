import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthInitializer } from './components/layout/AuthInitializer';
import { CustomerChrome } from './components/layout/CustomerChrome';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { TrackOrderPage } from './pages/customer/TrackOrderPage';
import { PaymentLinkPage } from './pages/customer/PaymentLinkPage';
import {
  CookiePolicyPage,
  PrivacyPolicyPage,
  ShippingReturnsPage,
  SupplementDisclaimerPage,
  TermsOfServicePage,
} from './pages/customer/PolicyPages';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { PaymentLinksPage } from './pages/admin/PaymentLinksPage';

function App() {
  return (
    <>
      <AuthInitializer />
      <Routes>
        <Route element={<CustomerChrome />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="orders" element={<TrackOrderPage />} />
          <Route path="pay/:paymentId" element={<PaymentLinkPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-service" element={<TermsOfServicePage />} />
          <Route path="shipping-returns" element={<ShippingReturnsPage />} />
          <Route path="cookie-policy" element={<CookiePolicyPage />} />
          <Route path="supplement-disclaimer" element={<SupplementDisclaimerPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="payment-links" element={<PaymentLinksPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
