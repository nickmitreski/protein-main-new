import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { useAbandonedCartTracker } from '../../hooks/useAbandonedCart';

function AbandonedCartTracker() {
  useAbandonedCartTracker();
  return null;
}

export function CustomerChrome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AbandonedCartTracker />
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
