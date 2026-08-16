import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cake, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Heart } from 'lucide-react';
import api from '../services/api';

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      try {
        await api.post('/newsletter', { email: newsletterEmail.trim() });
        setSubscribed(true);
        setNewsletterEmail('');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <footer className="bg-bakery-dark text-cream-100 pt-16 pb-8 border-t border-bakery-chocolate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bakery-caramel text-white flex items-center justify-center">
                <Cake className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream-50">
                Dhakshu Bakes
              </span>
            </div>
            <p className="text-xs text-cream-300 leading-relaxed max-w-sm">
              Handcrafted with love using 100% natural butter, organic Belgian cocoa, and fresh ingredients daily. Bringing sweet celebration to your special moments.
            </p>
            <div className="flex items-center gap-3 pt-2 text-bakery-caramel">
              <a href="#" className="w-8 h-8 rounded-full bg-cream-100/10 flex items-center justify-center hover:bg-bakery-caramel hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-cream-100/10 flex items-center justify-center hover:bg-bakery-caramel hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-cream-100/10 flex items-center justify-center hover:bg-bakery-caramel hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-cream-50 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-cream-300">
              <li><Link to="/shop" className="hover:text-bakery-gold transition-colors">Shop All Bakery</Link></li>
              <li><Link to="/shop?category=cakes" className="hover:text-bakery-gold transition-colors">Celebration Cakes</Link></li>
              <li><Link to="/gifts" className="hover:text-bakery-gold transition-colors">Gifting Collections</Link></li>
              <li><Link to="/subscriptions" className="hover:text-bakery-gold transition-colors">Weekly Subscriptions</Link></li>
              <li><Link to="/stores" className="hover:text-bakery-gold transition-colors">Store Locations</Link></li>
              <li><Link to="/wholesale" className="hover:text-bakery-gold transition-colors">Wholesale Orders</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-cream-50 uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-cream-300">
              <li><Link to="/faq" className="hover:text-bakery-gold transition-colors">FAQs & Shipping</Link></li>
              <li><Link to="/contact" className="hover:text-bakery-gold transition-colors">Contact Bakery</Link></li>
              <li><Link to="/orders" className="hover:text-bakery-gold transition-colors">Track Order</Link></li>
              <li><span className="hover:text-bakery-gold cursor-pointer">Eggless Information</span></li>
              <li><span className="hover:text-bakery-gold cursor-pointer">Allergen Guide</span></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="font-serif text-sm font-semibold text-cream-50 uppercase tracking-wider mb-4">Newsletter</h4>
            <p className="text-xs text-cream-300 mb-3">Subscribe for secret cake drops & 10% off your first order!</p>
            {subscribed ? (
              <div className="p-3 bg-bakery-caramel/20 border border-bakery-caramel rounded-lg text-xs text-bakery-gold font-medium">
                ✨ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-cream-100/10 border border-cream-200/20 rounded-lg text-cream-50 placeholder-cream-300/50 focus:outline-none focus:border-bakery-gold"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-bakery-caramel hover:bg-bakery text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Join Bakery Club
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cream-100/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cream-300/60 gap-4">
          <p>© {new Date().getFullYear()} Dhakshu Bakes. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-bakery-rose fill-bakery-rose" />
            <span>for bakery lovers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
