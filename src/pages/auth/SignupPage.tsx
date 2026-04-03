import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { colors } from '../../utils/design-system';

/**
 * Public customer registration is intentionally disabled.
 * Admin/staff users are created in Supabase Dashboard → Authentication.
 */
export function SignupPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.lightGrey }}>
      <div className="w-full max-w-md bg-white p-8 border" style={{ borderColor: colors.lightGrey }}>
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-bold uppercase tracking-widest mb-2"
            style={{ color: colors.black }}
          >
            CORE<span style={{ color: colors.red }}>FORGE</span>
          </h1>
          <p className="text-sm font-semibold" style={{ color: colors.black }}>
            No public sign-up
          </p>
        </div>
        <p className="text-sm leading-relaxed mb-6" style={{ color: colors.gray500 }}>
          Shoppers can check out as guests. Only staff need an account. If you are an admin, your account was created in
          the Supabase project (Authentication). Use staff sign-in below.
        </p>
        <Button type="button" fullWidth onClick={() => navigate('/login')}>
          Go to staff sign in
        </Button>
        <p className="text-xs mt-6 text-center" style={{ color: colors.gray400 }}>
          <Link to="/" className="underline">
            Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
