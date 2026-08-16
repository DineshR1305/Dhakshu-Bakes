import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Cake, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bakery-light text-bakery mx-auto mb-2 border border-bakery-caramel">
            <Cake className="w-6 h-6 text-bakery-rose" />
          </Link>
          <h2 className="font-serif text-2xl font-bold text-bakery-dark">Sign In To Dhakshu Bakes</h2>
          <p className="text-xs text-gray-500">Access saved addresses, order history, and exclusive bakery perks.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@dhakshubakes.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo User Credentials Helper */}
        <div className="p-3 bg-cream-100/80 rounded-xl border border-cream-200 text-[11px] text-gray-600 space-y-1">
          <p className="font-bold text-bakery-dark">Demo Login Credentials:</p>
          <p><strong>Customer:</strong> customer@dhakshubakes.local / Customer@12345</p>
          <p><strong>Admin:</strong> admin@dhakshubakes.local / Admin@12345</p>
        </div>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-cream-200">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-bakery-caramel hover:text-bakery">
            Register Account
          </Link>
        </div>

      </div>
    </div>
  );
}
