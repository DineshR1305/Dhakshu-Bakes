import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contact', { name, email, phone, subject, message });
      if (res.success) setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">CONTACT DHAKSHU BAKES</h1>
        <p className="text-xs sm:text-sm text-gray-600">Have questions about custom cake orders or corporate events? Get in touch!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-bakery-dark">Bakery Studio HQ</h3>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-bakery-caramel" />
                <span>104 Park Avenue, Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-bakery-caramel" />
                <span>+91 80 2525 8899</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-bakery-caramel" />
                <span>orders@dhakshubakes.local</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-cream-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-bakery-dark">Message Sent Successfully</h3>
              <p className="text-xs text-gray-500">We will respond to your message shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                <input type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message</label>
                <textarea rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 text-xs bg-cream-100 border border-cream-300 rounded-lg" />
              </div>
              <button type="submit" className="px-8 py-3 bg-bakery-dark text-white font-bold text-xs rounded-full hover:bg-bakery flex items-center gap-2">
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
