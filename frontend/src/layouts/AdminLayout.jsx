import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Tag, Shield, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useAuthStore } from '../store/authStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const adminMenuButtonRef = useRef(null);
  const adminDrawerRef = useRef(null);

  // Manage focus trapping, body scroll lock, and keyboard ESC for admin mobile drawer
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';

      // Move focus into admin drawer
      setTimeout(() => {
        const closeBtn = adminDrawerRef.current?.querySelector('button');
        closeBtn?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileSidebarOpen(false);
        }

        if (e.key === 'Tab' && adminDrawerRef.current) {
          const focusables = adminDrawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        // Restore focus to admin menu trigger button
        adminMenuButtonRef.current?.focus();
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-cream-200 text-center space-y-4 shadow-xl">
        <Shield className="w-12 h-12 text-bakery-rose mx-auto" />
        <h1 className="font-serif text-xl font-bold text-bakery-dark">Access Restricted</h1>
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
    <div className="min-h-screen bg-cream-100 flex flex-col lg:flex-row">
      <SEOHead title="Admin Management" noindex={true} />
      
      {/* Mobile Top Navigation Header (< 1024px) */}
      <header className="lg:hidden bg-bakery-dark text-cream-100 px-4 py-3 border-b border-bakery-chocolate flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            ref={adminMenuButtonRef}
            onClick={() => setMobileSidebarOpen(true)}
            aria-expanded={mobileSidebarOpen}
            aria-controls="admin-nav-drawer"
            aria-label="Open Admin Menu"
            className="p-1.5 rounded-lg text-cream-100 hover:bg-cream-100/10 focus:outline-none focus:ring-2 focus:ring-bakery-gold"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-bold text-base text-cream-50">Dhakshu Admin</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-bakery-caramel text-white font-bold text-xs flex items-center justify-center">
          {user?.fullName?.charAt(0) || 'A'}
        </div>
      </header>

      {/* Mobile Sidebar Overlay & Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden" id="admin-nav-drawer" role="dialog" aria-modal="true" aria-label="Admin Navigation Drawer">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 animate-fadeIn"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>

          <aside
            ref={adminDrawerRef}
            className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-bakery-dark text-cream-100 z-50 p-6 flex flex-col justify-between shadow-2xl animate-slideRight"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-cream-100/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-bakery-caramel text-white flex items-center justify-center font-bold text-sm">
                    DB
                  </div>
                  <div>
                    <span className="font-serif font-bold text-base text-cream-50 block">Dhakshu Bakes</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-bakery-gold block">Admin Portal</span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Close admin menu"
                  className="p-1.5 rounded-lg text-cream-300 hover:bg-cream-100/10 focus:ring-2 focus:ring-bakery-gold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
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
                onClick={() => setMobileSidebarOpen(false)}
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
        </div>
      )}

      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-bakery-dark text-cream-100 flex-col justify-between p-6 border-r border-bakery-chocolate shrink-0 min-h-screen sticky top-0 h-screen">
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
      <main className="flex-1 overflow-x-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
