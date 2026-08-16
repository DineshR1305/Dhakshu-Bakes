import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Tag, Users, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-cream-200 text-center space-y-4 shadow-xl">
        <Shield className="w-12 h-12 text-bakery-rose mx-auto" />
        <h2 className="font-serif text-xl font-bold text-bakery-dark">Access Restricted</h2>
        <p className="text-xs text-gray-500">You must be logged in as an Administrator to access the admin panel.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-bakery-dark text-white font-bold text-xs rounded-full">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Order Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory Control', path: '/admin/inventory', icon: Package },
    { label: 'Coupons & Vouchers', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-bakery-dark text-cream-100 flex flex-col justify-between p-6 border-r border-bakery-chocolate shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bakery-caramel text-white flex items-center justify-center font-bold text-sm">
              DB
            </div>
            <div>
              <span className="font-serif font-bold text-base text-cream-50 block">Dhakshu Bakes</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-bakery-gold block">Admin Portal</span>
            </div>
          </div>

          <nav className="space-y-1.5 pt-4 border-t border-cream-100/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? 'bg-bakery-caramel text-white shadow-md' : 'text-cream-300 hover:bg-cream-100/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-cream-100/10 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-xs text-cream-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Customer Storefront
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
