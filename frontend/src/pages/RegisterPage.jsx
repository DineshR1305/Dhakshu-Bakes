import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cake, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import { ButtonLoader } from '../components/Loaders';
import SEOHead from '../components/SEOHead';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;

    const res = await register(fullName.trim(), email.trim(), password, phone.trim());
    if (res.success) {
      showToast(`Welcome to Dhakshu Bakes, ${res.user?.fullName || 'Bakery Patron'}!`, 'success');
      navigate('/');
    } else {
      showToast(res.message || 'Registration failed. Please check your inputs.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead title="Register Account" noindex={true} />
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bakery-light text-bakery mx-auto mb-2 border border-bakery-caramel">
            <Cake className="w-6 h-6 text-bakery-rose" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-bakery-dark">Create Your Account</h1>
          <p className="text-xs text-gray-500">Join the Dhakshu Bakes club for fresh baked treats & rewards.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="reg_fullName" className="block text-xs font-bold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                id="reg_fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Anita Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-bakery-caramel"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="reg_email" className="block text-xs font-bold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                id="reg_email"
                type="email"
                required
                autoComplete="email"
                placeholder="anita@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-bakery-caramel"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="reg_phone" className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <input
                id="reg_phone"
                type="text"
                autoComplete="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-bakery-caramel"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="reg_password" className="block text-xs font-bold text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                id="reg_password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-bakery-caramel"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading ? <ButtonLoader text="Creating Account..." /> : (
              <>
                <span>Register Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-cream-200">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-bakery-caramel hover:text-bakery">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
