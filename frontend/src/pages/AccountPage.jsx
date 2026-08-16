import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SEOHead from '../components/SEOHead';
import { ButtonLoader } from '../components/Loaders';
import api from '../services/api';

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Address tab states
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [deleteAddressTarget, setDeleteAddressTarget] = useState(null);

  // New address form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560001');

  useEffect(() => {
    if (activeTab === 'addresses') {
      loadAddresses();
    }
  }, [activeTab]);

  async function loadAddresses() {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/account/addresses');
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddresses(false);
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressLine1.trim()) return;

    setSubmittingAddress(true);
    try {
      const res = await api.post('/account/addresses', {
        fullName,
        phone,
        addressLine1: addressLine1.trim(),
        city,
        state,
        postalCode,
        country: 'India',
        isDefault: addresses.length === 0,
      });

      if (res.success && res.data) {
        setAddresses([res.data, ...addresses]);
        setShowAddForm(false);
        setAddressLine1('');
        showToast('New shipping address added successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error adding address', 'error');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!deleteAddressTarget) return;
    try {
      await api.delete(`/account/addresses/${deleteAddressTarget.id}`);
      setAddresses(addresses.filter(a => a.id !== deleteAddressTarget.id));
      showToast('Address deleted', 'info');
    } catch (e) {
      showToast(e.message || 'Error deleting address', 'error');
    } finally {
      setDeleteAddressTarget(null);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEOHead title="Customer Account" noindex={true} />

      <ConfirmModal
        isOpen={!!deleteAddressTarget}
        title="Delete Address"
        message="Are you sure you want to remove this address? This action cannot be undone."
        onConfirm={handleConfirmDeleteAddress}
        onCancel={() => setDeleteAddressTarget(null)}
      />

      <div>
        <h1 className="font-serif text-3xl font-bold text-bakery-dark">MY ACCOUNT</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your profile details, addresses, and order history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'profile' ? 'bg-bakery-caramel text-white' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <User className="w-4 h-4" /> Profile Info
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'addresses' ? 'bg-bakery-caramel text-white' : 'text-gray-700 hover:bg-cream-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses
          </button>
          
          <Link
            to="/orders"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Order History
          </Link>

          <Link
            to="/wishlist"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-gray-700 hover:bg-cream-100 transition-colors"
          >
            <Heart className="w-4 h-4" /> Saved Wishlist
          </Link>

          {user.role === 'ROLE_ADMIN' && (
            <Link
              to="/admin"
              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-bakery hover:bg-cream-100 transition-colors border-t border-cream-200 mt-2 pt-3"
            >
              <Shield className="w-4 h-4 text-bakery-caramel" /> Admin Portal
            </Link>
          )}

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
            <h3 className="font-serif font-bold text-xl text-bakery-dark border-b border-cream-200 pb-3">Personal Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Full Name</label>
                <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.fullName}</p>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Email Address</label>
                <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.email}</p>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Phone Number</label>
                <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.phone || 'Not configured'}</p>
              </div>
              <div>
                <label className="block font-bold text-gray-500 mb-1">Account Role</label>
                <p className="font-bold text-bakery-dark text-sm p-3 bg-cream-100/60 rounded-xl border border-cream-200">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-cream-200 pb-3">
              <h3 className="font-serif font-bold text-xl text-bakery-dark">Saved Delivery Addresses</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {/* Add Address Form */}
            {showAddForm && (
              <form onSubmit={handleAddAddress} className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 text-xs animate-fadeIn">
                <h4 className="font-bold text-bakery-dark">New Shipping Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">Flat / Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104 Park Avenue, Indiranagar"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-white border border-cream-300 text-gray-600 font-bold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="px-6 py-2 bg-bakery-caramel text-white font-bold rounded-full hover:bg-bakery disabled:bg-gray-400"
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
                  <div key={addr.id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 relative text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-bakery-dark">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">{addr.addressLine1}</p>
                    <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-bakery-caramel font-semibold">Phone: {addr.phone}</p>
                    
                    <button
                      onClick={() => setDeleteAddressTarget(addr)}
                      className="absolute bottom-3 right-3 text-red-500 hover:text-red-700 p-1"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
    </div>
  );
}
