import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Store as StoreIcon, Navigation } from 'lucide-react';
import api from '../services/api';

export default function StoreLocatorPage() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    async function loadStores() {
      try {
        const res = await api.get('/stores');
        if (res.success) setStores(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadStores();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 bg-cream-200 text-bakery-caramel px-3.5 py-1.5 rounded-full text-xs font-bold border border-cream-300">
          <StoreIcon className="w-4 h-4" /> Bakery Boutiques & Pickup Locations
        </div>
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">STORE LOCATOR</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Visit our artisan studio outlets for fresh tastings, coffee pairing, and instant counter pickup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stores.map((store) => (
          <div key={store.id} className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-xl text-bakery-dark">{store.name}</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-bakery-caramel shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-bakery-caramel shrink-0" />
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-bakery-caramel shrink-0" />
                <span>{store.openingHours}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-600">Services: {store.services}</span>
              <a
                href={`https://maps.google.com/?q=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-bakery-dark text-white font-bold rounded-full hover:bg-bakery flex items-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" /> Get Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
