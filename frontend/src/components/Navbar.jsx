import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, Cake, Sparkles, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isStorefront = !location.pathname.startsWith('/admin');

  if (!isStorefront) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-sm">
      {/* Announcement Bar */}
      <div className="bg-bakery-chocolate text-cream-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-bakery-gold animate-pulse" />
        <span>Freshly Baked Daily • Free Delivery on Orders Over ₹499 • Code: <strong className="text-bakery-gold">WELCOME10</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-bakery-dark hover:bg-cream-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-bakery-light border-2 border-bakery-caramel flex items-center justify-center text-bakery hover:scale-105 transition-transform">
              <Cake className="w-6 h-6 text-bakery-rose" />
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-bakery-dark group-hover:text-bakery transition-colors">
                Dhakshu Bakes
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-bakery-caramel font-semibold">
                Freshly Baked • Made With Love
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-bakery-dark">
            <Link to="/shop" className="hover:text-bakery transition-colors">Shop All</Link>
            <Link to="/shop?category=cakes" className="hover:text-bakery transition-colors">Cakes</Link>
            <Link to="/shop?category=cupcakes" className="hover:text-bakery transition-colors">Cupcakes</Link>
            <Link to="/gifts" className="hover:text-bakery transition-colors">Gift Hampers</Link>
            <Link to="/subscriptions" className="hover:text-bakery transition-colors">Subscriptions</Link>
            <Link to="/stores" className="hover:text-bakery transition-colors">Stores</Link>
            <Link to="/wholesale" className="hover:text-bakery transition-colors">Wholesale</Link>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Cart, User */}
          <div className="flex items-center gap-4">
            
            {/* Search Input Box */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search cakes, cookies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-60 pl-9 pr-4 py-1.5 text-xs bg-cream-100 border border-cream-300 rounded-full focus:outline-none focus:border-bakery-caramel focus:ring-1 focus:ring-bakery-caramel transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-bakery-dark hover:text-bakery-rose relative transition-colors">
              <Heart className="w-6 h-6" />
              {wishlist.products && wishlist.products.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-bakery-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.products.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Button */}
            <Link to="/cart" className="p-2 text-bakery-dark hover:text-bakery relative transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cart.itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-bakery-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-bakery-caramel text-white font-bold text-xs flex items-center justify-center">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-bakery-dark text-cream-100 hover:bg-bakery transition-colors shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Account Dropdown Menu */}
              {userDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-cream-200">
                    <p className="text-xs font-bold text-bakery-dark">{user?.fullName}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  {user?.role === 'ROLE_ADMIN' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-bakery font-semibold hover:bg-cream-100"
                    >
                      <Shield className="w-4 h-4 text-bakery-caramel" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream-100"
                  >
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span>My Orders</span>
                  </Link>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream-100"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-cream-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Search bakery products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Shop All Products</Link>
          <Link to="/shop?category=cakes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Handcrafted Cakes</Link>
          <Link to="/gifts" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Gift Boxes</Link>
          <Link to="/subscriptions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Weekly Subscriptions</Link>
          <Link to="/stores" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Store Locator</Link>
          <Link to="/wholesale" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Wholesale Enquiries</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-bakery-dark">Contact Us</Link>
          
          {!isAuthenticated && (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center py-2.5 mt-4 text-sm font-semibold rounded-lg bg-bakery-dark text-white">
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
