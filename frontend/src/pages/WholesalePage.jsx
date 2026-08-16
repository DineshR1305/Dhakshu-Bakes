import React, { useState } from 'react';
import { Building2, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function WholesalePage() {
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('Cafe / Restaurant');
  const [productsInterested, setProductsInterested] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/wholesale', {
        businessName, contactPerson, email, phone, businessType, productsInterested, estimatedQuantity, message
      });
      if (res.success) setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-cream-200 text-bakery-caramel px-3.5 py-1.5 rounded-full text-xs font-bold border border-cream-300">
          <Building2 className="w-4 h-4" /> B2B & Wholesale Bakery Supply
        </div>
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">WHOLESALE INQUIRIES</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Partner with Dhakshu Bakes for daily fresh supply of cookies, artisan sourdoughs, tea cakes, and brownies for your cafe, hotel, or corporate gifting.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-cream-200 shadow-sm">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-bakery-dark">Inquiry Submitted Successfully</h3>
            <p className="text-xs text-gray-600">Our B2B corporate team will review your requirement and reach out within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business / Company Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Business Category</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg font-medium"
              >
                <option value="Cafe / Restaurant">Cafe / Coffee Shop</option>
                <option value="Hotel / Resort">Hotel / Resort</option>
                <option value="Corporate Gifting">Corporate Event / Gifting</option>
                <option value="Supermarket / Retail">Retail Store</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Products Interested & Estimated Quantity</label>
              <textarea
                rows={3}
                placeholder="e.g. 500 Walnut Brownie Slices weekly..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 text-xs bg-cream-100 border border-cream-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Wholesale Application</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
