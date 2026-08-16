import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Heart, MapPin, LogOut, Shield, Plus, Trash2, CheckCircle2, Edit3, Clock, ArrowRight, RefreshCw, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import OrderReceiptModal from '../components/OrderReceiptModal';
import { ButtonLoader } from '../components/Loaders';
import api from '../services/api';

export default function AccountPage() {
  const { user, setUser, logout } = useAuthStore();
  const { addToCart, openDrawer } = useCartStore();
  const { wishlist } = useWishlistStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Stats & Orders state
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Saved Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState(null);

  // Address Form state
  const [addrFullName, setAddrFullName] = useState(user?.fullName || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrPostalCode, setAddrPostalCode] = useState('560001');
  const [addrInstructions, setAddrInstructions] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Profile Form state
  const [profileFullName, setProfileFullName] = useState(user?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Receipt Modal state
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    loadUserOrders();
    loadAddresses();
  }, []);

  async function loadUserOrders() {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.success && Array.isArray(res.data)) {
        setUserOrders(res.data);
      }
    } catch (e) {
      console.error('Error loading user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadAddresses() {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/addresses');
      if (res.success && Array.isArray(res.data)) {
        setAddresses(res.data);
      }
    } catch (e) {
      console.error('Error loading addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileFullName.trim()) return;

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName: profileFullName.trim(),
        phone: profilePhone.trim(),
      });

      if (res.success && res.data) {
        setUser(res.data);
        showToast('Profile details updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrFullName(user?.fullName || '');
    setAddrPhone(user?.phone || '');
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('Bengaluru');
    setAddrState('Karnataka');
    setAddrPostalCode('560001');
    setAddrInstructions('');
    setAddrIsDefault(addresses.length === 0);
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddrFullName(addr.fullName || '');
    setAddrPhone(addr.phone || '');
    setAddrLine1(addr.addressLine1 || '');
    setAddrLine2(addr.addressLine2 || '');
    setAddrCity(addr.city || '');
    setAddrState(addr.state || '');
    setAddrPostalCode(addr.postalCode || '');
    setAddrInstructions(addr.deliveryInstructions || '');
    setAddrIsDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrLine1.trim()) return;

    setSubmittingAddress(true);
    const payload = {
      fullName: addrFullName,
      phone: addrPhone,
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim(),
      city: addrCity,
      state: addrState,
      postalCode: addrPostalCode,
      country: 'India',
      deliveryInstructions: addrInstructions.trim(),
      isDefault: addrIsDefault,
    };

    try {
      let res;
      if (editingAddressId) {
        res = await api.put(`/addresses/${editingAddressId}`, payload);
      } else {
        res = await api.post('/addresses', payload);
      }

      if (res.success) {
        loadAddresses();
        setShowAddressForm(false);
        setEditingAddressId(null);
        showToast(`Address ${editingAddressId ? 'updated' : 'saved'} successfully!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error saving address', 'error');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const res = await api.put(`/addresses/${addrId}/set-default`);
      if (res.success) {
        loadAddresses();
        showToast('Default delivery address updated', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Error updating default address', 'error');
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deleteAddressTarget) return;
    try {
      await api.delete(`/addresses/${deleteAddressTarget.id}`);
      loadAddresses();
      showToast('Address removed', 'info');
    } catch (e) {
      showToast(e.message || 'Error deleting address', 'error');
    } finally {
      setDeleteAddressTarget(null);
    }
  };

  const handleReorder = async (order) => {
    if (!order.items || order.items.length === 0) return;
    let count = 0;
    for (const item of order.items) {
      if (item.productId && item.variantId) {
        const res = await addToCart(item.productId, item.variantId, item.quantity);
        if (res && res.success) count++;
      }
    }
    if (count > 0) {
      showToast(`Added ${count} item(s) from Order #${order.orderNumber} to cart!`, 'success');
      openDrawer();
    } else {
      showToast('Items are currently out of stock', 'warning');
    }
  };

  if (!user) return null;

  const pendingOrdersCount = userOrders.filter(o => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PROCESSING' || o.orderStatus === 'BAKING' || o.orderStatus === 'OUT_FOR_DELIVERY').length;
  const deliveredOrdersCount = userOrders.filter(o => o.orderStatus === 'DELIVERED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <SEOHead title="Customer Account & Dashboard" noindex={true} />

      {/* Customer Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-bakery-caramel text-white font-bold text-2xl flex items-center justify-center shadow-md">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-bakery-dark">{user.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cream-200 text-bakery-dark text-[10px] font-extrabold uppercase">
                {user.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user.email} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-full border border-cream-300 hover:bg-rose-50 text-red-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-bakery-dark block">{userOrders.length}</span>
            <span className="text-[11px] text-gray-500 font-semibold">Total Orders</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-bakery-dark block">{pendingOrdersCount}</span>
            <span className="text-[11px] text-gray-500 font-semibold">In Progress</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-bakery-dark block">{deliveredOrdersCount}</span>
            <span className="text-[11px] text-gray-500 font-semibold">Delivered</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-bakery-dark block">{wishlist.products?.length || 0}</span>
            <span className="text-[11px] text-gray-500 font-semibold">Saved Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs space-y-1.5 h-fit">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'dashboard' ? 'bg-bakery-caramel text-white shadow-xs' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'profile' ? 'bg-bakery-caramel text-white shadow-xs' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'addresses' ? 'bg-bakery-caramel text-white shadow-xs' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({addresses.length})
          </button>

          <Link
            to="/orders"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <Clock className="w-4 h-4" /> Order History Page
          </Link>

          <Link
            to="/wishlist"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <Heart className="w-4 h-4" /> Saved Wishlist ({wishlist.products?.length || 0})
          </Link>

          {user.role === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-bakery hover:bg-cream-100 transition-colors border-t border-cream-200 mt-2 pt-3"
            >
              <Shield className="w-4 h-4 text-bakery-caramel" /> Admin Portal
            </Link>
          )}
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-cream-200 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-xl text-bakery-dark">Recent Orders</h3>
                  <p className="text-xs text-gray-500">Your latest handcrafted bakery purchases</p>
                </div>
                <Link to="/orders" className="text-xs font-bold text-bakery-caramel hover:underline flex items-center gap-1">
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingOrders ? (
                <p className="text-xs text-gray-400 py-4 text-center">Loading recent orders...</p>
              ) : userOrders.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs font-bold text-bakery-dark">No orders placed yet.</p>
                  <Link to="/shop" className="inline-block px-5 py-2 bg-bakery-dark text-white font-bold text-xs rounded-full">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-4 bg-cream-50/60 rounded-2xl border border-cream-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-serif font-bold text-bakery-dark text-sm">#{order.orderNumber}</span>
                          <p className="text-[11px] text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-sm text-bakery-dark block">₹{order.totalAmount}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-cream-200 text-bakery-dark text-[10px] font-extrabold">
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-cream-200 text-xs">
                        <span className="text-gray-500">{order.items?.length || 0} items</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1 bg-cream-200 hover:bg-bakery-caramel text-bakery-dark hover:text-white rounded-full font-bold text-[11px] transition-colors"
                          >
                            Buy Again
                          </button>
                          <Link
                            to={`/orders/${order.orderNumber}`}
                            className="px-3 py-1 bg-bakery-dark hover:bg-bakery text-white rounded-full font-bold text-[11px] transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Profile Info (Editable) */}
        {activeTab === 'profile' && (
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
            <h3 className="font-serif font-bold text-xl text-bakery-dark border-b border-cream-200 pb-3">Edit Profile Details</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  className="w-full p-3 bg-cream-100/60 rounded-xl border border-cream-300 text-bakery-dark font-bold text-sm focus:ring-1 focus:ring-bakery-caramel"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full p-3 bg-gray-100 rounded-xl border border-cream-200 text-gray-500 font-bold text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full p-3 bg-cream-100/60 rounded-xl border border-cream-300 text-bakery-dark font-bold text-sm focus:ring-1 focus:ring-bakery-caramel"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-all disabled:opacity-50"
                >
                  {savingProfile ? <ButtonLoader text="Saving Changes..." /> : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif font-bold text-xl text-bakery-dark">Saved Delivery Addresses</h3>
              <button
                onClick={handleOpenAddAddress}
                className="px-4 py-2 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {/* Add / Edit Address Form Modal */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 text-xs animate-fadeIn">
                <h4 className="font-serif font-bold text-bakery-dark text-sm">
                  {editingAddressId ? 'Edit Delivery Address' : 'New Shipping Address'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addrFullName}
                      onChange={(e) => setAddrFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Street Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104 Park Avenue, Indiranagar"
                      value={addrLine1}
                      onChange={(e) => setAddrLine1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Landmark / Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Metro Station"
                      value={addrLine2}
                      onChange={(e) => setAddrLine2(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Postal PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700 pt-1">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
                  />
                  <span>Set as default shipping address</span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 bg-white border border-cream-300 text-gray-600 font-bold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="px-6 py-2 bg-bakery-caramel text-white font-bold rounded-full hover:bg-bakery disabled:opacity-50"
                  >
                    {submittingAddress ? <ButtonLoader text="Saving..." /> : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* Addresses List */}
            {loadingAddresses ? (
              <p className="text-xs text-gray-400">Loading saved addresses...</p>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <MapPin className="w-10 h-10 text-cream-300 mx-auto" />
                <p className="text-xs font-bold text-bakery-dark">No saved addresses found.</p>
                <p className="text-[11px] text-gray-400">Add an address above for faster future checkouts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 relative text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-bakery-dark text-sm">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-gray-500">{addr.addressLine2}</p>}
                      <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-bakery-caramel font-semibold mt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-cream-200 pt-2.5 mt-2">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-bakery-caramel hover:underline"
                        >
                          Make Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1 text-gray-500 hover:text-bakery-dark transition-colors"
                          aria-label="Edit address"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAddressTarget(addr)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Confirm Delete Address Modal */}
      <ConfirmModal
        isOpen={!!deleteAddressTarget}
        title="Delete Saved Address?"
        message={`Are you sure you want to remove ${deleteAddressTarget?.addressLine1} from your saved addresses?`}
        confirmText="Delete Address"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDeleteAddress}
        onCancel={() => setDeleteAddressTarget(null)}
      />

      {/* Receipt Modal */}
      <OrderReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
      />
    </div>
  );
}
