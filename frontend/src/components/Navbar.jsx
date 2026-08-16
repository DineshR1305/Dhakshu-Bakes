import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, Cake, Sparkles, LogOut, Shield, MapPin, Gift, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import api from '../services/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const hamburgerButtonRef = useRef(null);
  const mobileDrawerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, fetchCart, openDrawer } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Debounced search query lookup
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/products', { params: { query: searchQuery.trim() } });
        if (res.success && Array.isArray(res.data)) {
          setSearchResults(res.data.slice(0, 5));
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search and user dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }

      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and manage focus trapping for mobile drawer
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        const closeBtn = mobileDrawerRef.current?.querySelector('button');
        closeBtn?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }

        if (e.key === 'Tab' && mobileDrawerRef.current) {
          const focusables = mobileDrawerRef.current.querySelectorAll(
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
        document.body.style.overflow = '';
        hamburgerButtonRef.current?.focus();
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // Close mobile drawer and dropdowns on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectSuggestion = (slug) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/product/${slug}`);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    openDrawer();
  };

  const isStorefront = !location.pathname.startsWith('/admin');
  if (!isStorefront) return null;

  // Render Mobile Navigation Drawer using React Portal directly into document.body
  const mobileDrawerPortal = mobileMenuOpen && createPortal(
    <div id="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu" className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99] animate-fadeIn"
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Drawer Container */}
      <div
        ref={mobileDrawerRef}
        className="fixed inset-y-0 left-0 w-[85vw] max-w-[360px] sm:max-w-[400px] h-[100dvh] bg-white z-[100] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideRight text-bakery-dark"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-cream-200 flex items-center justify-between shrink-0 bg-cream-50/50">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bakery-light border border-bakery-caramel flex items-center justify-center text-bakery">
              <Cake className="w-4 h-4 text-bakery-rose" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-bakery-dark block leading-tight">Dhakshu Bakes</span>
              <span className="text-[9px] uppercase tracking-wider text-bakery-caramel font-semibold block">Fresh Bakes</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-gray-500 hover:bg-cream-200 focus:outline-none focus:ring-2 focus:ring-bakery-caramel transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} role="search" className="relative">
            <label htmlFor="mobile-search-input" className="sr-only">Search bakery items</label>
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search cakes, pastries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-caramel"
            />
            <button type="submit" aria-label="Submit search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bakery-dark">
              <Search className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Primary Navigation Links */}
          <div className="space-y-1 text-xs font-semibold">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-3 pt-1 pb-0.5">Explore Menu</p>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Shop All Products</span>
              <span className="text-[10px] bg-bakery-caramel/10 text-bakery-caramel font-bold px-2 py-0.5 rounded-full">All</span>
            </Link>
            <Link
              to="/shop?category=cakes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Handcrafted Cakes</span>
              <Cake className="w-4 h-4 text-bakery-rose" />
            </Link>
            <Link
              to="/shop?category=cupcakes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Cupcakes & Treats</span>
            </Link>
            <Link
              to="/gifts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Gift Boxes & Hampers</span>
              <Gift className="w-4 h-4 text-amber-600" />
            </Link>
            <Link
              to="/subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Weekly Subscriptions</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </Link>
            <Link
              to="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              <span>Store Locator</span>
              <MapPin className="w-4 h-4 text-blue-600" />
            </Link>
            <Link
              to="/wholesale"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              Wholesale Enquiries
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-xl hover:bg-cream-100 text-bakery-dark transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Drawer Footer / Customer Actions */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/70 space-y-2 shrink-0">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-1 pb-1">Customer Account & Cart</p>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-cream-300 text-xs font-bold text-bakery-dark hover:bg-cream-100 transition-colors relative"
            >
              <Heart className="w-4 h-4 text-bakery-rose" />
              <span>Wishlist</span>
              {wishlist.products && wishlist.products.length > 0 && (
                <span className="ml-1 bg-bakery-rose text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {wishlist.products.length}
                </span>
              )}
            </Link>

            <button
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleCartClick(e);
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-cream-300 text-xs font-bold text-bakery-dark hover:bg-cream-100 transition-colors relative"
            >
              <ShoppingBag className="w-4 h-4 text-bakery-caramel" />
              <span>Cart</span>
              {cart.itemCount > 0 && (
                <span className="ml-1 bg-bakery-accent text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>

          {isAuthenticated ? (
            <div className="space-y-1 pt-1">
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-cream-300 text-xs font-bold text-bakery-dark"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-bakery-caramel text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="truncate">{user?.fullName}</span>
                </div>
                <span className="text-[10px] text-bakery-caramel font-semibold">Account →</span>
              </Link>
              {user?.role === 'ROLE_ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-bakery-light text-bakery text-xs font-bold"
                >
                  <Shield className="w-4 h-4 text-bakery-caramel" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 text-xs font-bold rounded-xl bg-bakery-dark text-white shadow-xs hover:bg-bakery transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-xs w-full">
        {/* Announcement Bar */}
        <div className="bg-bakery-chocolate text-cream-100 text-[10px] sm:text-xs py-1 px-2 sm:px-3 text-center font-medium tracking-wide flex items-center justify-center gap-1.5 leading-tight overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-bakery-gold animate-pulse shrink-0" />
          <span className="truncate max-w-full">
            Freshly Baked Daily • Free Delivery over ₹499 • Code: <strong className="text-bakery-gold">WELCOME10</strong>
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18 lg:h-20 gap-2 sm:gap-4">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden shrink-0">
              <button
                ref={hamburgerButtonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label="Toggle navigation menu"
                className="p-1.5 sm:p-2 rounded-xl text-bakery-dark hover:bg-cream-100 focus:outline-none focus:ring-2 focus:ring-bakery-caramel transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-bakery-light border-2 border-bakery-caramel flex items-center justify-center text-bakery group-hover:scale-105 transition-transform shrink-0">
                <Cake className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-bakery-rose" />
              </div>
              <div className="min-w-0">
                <span className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-bakery-dark group-hover:text-bakery transition-colors truncate block">
                  Dhakshu Bakes
                </span>
                <span className="hidden sm:block text-[8px] lg:text-[9px] uppercase tracking-widest text-bakery-caramel font-semibold truncate">
                  Freshly Baked • Made With Love
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-xs font-semibold text-bakery-dark whitespace-nowrap">
              <Link to="/shop" className="hover:text-bakery transition-colors">Shop All</Link>
              <Link to="/shop?category=cakes" className="hover:text-bakery transition-colors">Cakes</Link>
              <Link to="/shop?category=cupcakes" className="hover:text-bakery transition-colors">Cupcakes</Link>
              <Link to="/gifts" className="hover:text-bakery transition-colors">Gift Hampers</Link>
              <Link to="/subscriptions" className="hover:text-bakery transition-colors">Subscriptions</Link>
              <Link to="/stores" className="hover:text-bakery transition-colors">Stores</Link>
              <Link to="/wholesale" className="hover:text-bakery transition-colors">Wholesale</Link>
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
              {/* Desktop Search Bar with Live Suggestions Dropdown */}
              <div className="hidden md:block relative">
                <form onSubmit={handleSearchSubmit} role="search" className="flex items-center relative">
                  <label htmlFor="desktop-search-input" className="sr-only">Search bakery items</label>
                  <input
                    ref={searchInputRef}
                    id="desktop-search-input"
                    type="text"
                    placeholder="Search cakes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setSearchResults.length > 0 && setShowSearchDropdown(true)}
                    className="w-32 md:w-44 lg:w-52 xl:w-60 pl-8 pr-7 py-1.5 text-xs bg-cream-100 border border-cream-300 rounded-full focus:outline-none focus:border-bakery-caramel focus:ring-1 focus:ring-bakery-caramel transition-all"
                  />
                  <button type="submit" aria-label="Submit search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bakery-dark">
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
                      aria-label="Clear search query"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bakery-dark"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>

                {/* Suggestions Dropdown */}
                {showSearchDropdown && (
                  <div
                    ref={searchDropdownRef}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-cream-200 py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-3 py-1.5 border-b border-cream-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                      <span>Products matching "{searchQuery}"</span>
                      {isSearching && <span className="animate-pulse text-bakery-caramel">Searching...</span>}
                    </div>

                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">
                        No treats found for "{searchQuery}".
                      </div>
                    ) : (
                      searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSelectSuggestion(product.slug)}
                          className="w-full p-2.5 hover:bg-cream-50 flex items-center gap-3 text-left transition-colors border-b border-cream-100 last:border-0"
                        >
                          <img
                            src={product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover border border-cream-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-serif font-bold text-bakery-dark truncate">{product.name}</p>
                            <p className="text-[10px] text-bakery-caramel font-semibold uppercase">{product.categoryName}</p>
                          </div>
                          <span className="text-xs font-extrabold text-bakery-dark shrink-0">
                            ₹{product.variants?.[0]?.discountPrice || product.variants?.[0]?.price || 0}
                          </span>
                        </button>
                      ))
                    )}

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-2 bg-cream-100 hover:bg-cream-200 text-xs font-bold text-bakery-dark transition-colors border-t border-cream-200 rounded-b-xl"
                    >
                      View All Results ({searchResults.length}+)
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link to="/wishlist" aria-label="View Wishlist" className="p-1.5 sm:p-2 text-bakery-dark hover:text-bakery-rose relative transition-colors shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlist.products && wishlist.products.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-bakery-rose text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {wishlist.products.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon -> Opens Cart Drawer */}
              <button
                onClick={handleCartClick}
                aria-label="Open Shopping Cart Drawer"
                className="p-1.5 sm:p-2 text-bakery-dark hover:text-bakery relative transition-colors focus:outline-none focus:ring-2 focus:ring-bakery-caramel rounded-full shrink-0"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {cart.itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-bakery-accent text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </button>

              {/* User Account / Auth Dropdown */}
              <div className="relative shrink-0" ref={userDropdownRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-label="User account menu"
                    className="flex items-center gap-1 p-1 rounded-full hover:bg-cream-100 transition-colors focus:ring-2 focus:ring-bakery-caramel"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bakery-caramel text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold rounded-full bg-bakery-dark text-cream-100 hover:bg-bakery transition-colors shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                {userDropdownOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-cream-200">
                      <p className="text-xs font-bold text-bakery-dark truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {user?.role === 'ROLE_ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-bakery font-semibold hover:bg-cream-100"
                      >
                        <Shield className="w-4 h-4 text-bakery-caramel" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream-100">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link to="/account" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-cream-100">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={logout}
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
      </header>

      {mobileDrawerPortal}
    </>
  );
}
