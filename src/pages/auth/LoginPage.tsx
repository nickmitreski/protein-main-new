import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors } from '../../utils/design-system';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const u = await signIn(email, password);
      toast.success('Welcome back!');
      navigate(u.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.lightGrey }}>
      <div className="w-full max-w-md bg-white p-8 border" style={{ borderColor: colors.lightGrey }}>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold uppercase tracking-widest mb-2"
            style={{ color: colors.black }}
          >
            CORE<span style={{ color: colors.red }}>FORGE</span>
          </h1>
          <p className="text-sm" style={{ color: colors.gray500 }}>
            Staff sign in (admin dashboard)
          </p>
          <p className="text-xs mt-2" style={{ color: colors.gray400 }}>
            Customers do not need an account to shop.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="your@email.com"
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          <Button type="submit" fullWidth isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-xs text-center leading-relaxed" style={{ color: colors.gray400 }}>
          Use the email and password for a user created in Supabase → Authentication. If admin access fails, set{' '}
          <code className="text-[10px] bg-gray-100 px-1">VITE_ADMIN_EMAILS</code> in <code className="text-[10px] bg-gray-100 px-1">.env</code> or add{' '}
          <code className="text-[10px] bg-gray-100 px-1">role: admin</code> under App Metadata for that user in the
          dashboard, or run the SQL in <code className="text-[10px] bg-gray-100 px-1">supabase/ADMIN_SETUP.sql</code>.
        </p>
      </div>
    </div>
  );
}
