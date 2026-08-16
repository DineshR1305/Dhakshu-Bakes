import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Heart, Award, ShieldCheck, Clock, Truck, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await api.get('/categories');
        if (catRes.success) setCategories(catRes.data);

        const featRes = await api.get('/products/featured');
        if (featRes.success) setFeaturedProducts(featRes.data);

        const bestRes = await api.get('/products/bestsellers');
        if (bestRes.success) setBestsellers(bestRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-200/60 to-cream-100 py-16 sm:py-24 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-cream-100 border border-cream-300 text-bakery-caramel px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-bakery-gold" />
              <span>Artisan Confectionery & Bakery Studio</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-bakery-dark tracking-tight leading-tight">
              Freshly Baked. <br />
              <span className="text-bakery font-italic">Made With Love.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Explore handcrafted celebration cakes, rich Belgian brownies, pure butter cookies, and freshly baked artisanal pastries delivered right to your doorstep.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-bakery-dark hover:bg-bakery text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>Explore Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/shop?category=cakes"
                className="px-8 py-3.5 bg-white border border-cream-300 hover:bg-cream-200 text-bakery-dark font-bold text-sm rounded-full transition-all shadow-xs"
              >
                Order Custom Cake
              </Link>
            </div>

            {/* USPs */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-cream-300/60 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-bakery-caramel" />
                <span className="text-xs font-semibold text-bakery-dark">100% Pure Butter</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-bakery-caramel" />
                <span className="text-xs font-semibold text-bakery-dark">Same-Day Baked</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-bakery-caramel" />
                <span className="text-xs font-semibold text-bakery-dark">Express Delivery</span>
              </div>
            </div>

          </div>

          {/* Hero Image Collage */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"
                alt="Signature Belgian Truffle Cake"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-4 sm:left-6 bg-white p-4 rounded-2xl shadow-xl border border-cream-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-bakery-dark">Handcrafted Quality</p>
                <p className="text-[11px] text-gray-500">4.9 ★ Top Rated Bakes (Demo Data)</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Category Pills Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block mb-1">Categories</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-dark">Handcrafted Delicacies</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-bakery hover:text-bakery-dark flex items-center gap-1">
            View All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-cream-200 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 bg-cream-100 border-2 border-cream-200 group-hover:border-bakery-caramel transition-colors">
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-serif text-sm font-bold text-bakery-dark group-hover:text-bakery transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block mb-1">Handpicked</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-dark">Featured Bakes</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-bakery hover:text-bakery-dark flex items-center gap-1">
            Browse Full Shop <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="bg-cream-200/50 py-16 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block mb-1">Customer Favorites</span>
            <h2 className="font-serif text-3xl font-bold text-bakery-dark">Best Sellers</h2>
            <p className="text-xs text-gray-600 mt-2">Loved by hundreds of dessert lovers every single day.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-bakery-caramel uppercase tracking-widest block mb-1">Testimonials</span>
          <h2 className="font-serif text-3xl font-bold text-bakery-dark">Loved By Bakery Lovers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-gray-600 italic">"The Belgian Chocolate Truffle Cake was out of this world! Melt in your mouth texture and purely fresh."</p>
            <div>
              <p className="text-xs font-bold text-bakery-dark">Priya Ramesh</p>
              <p className="text-[10px] text-gray-400">Verified Buyer • Bengaluru</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-gray-600 italic">"100% pure eggless pastries that taste just as soft and fluffy as standard cakes. Will order again!"</p>
            <div>
              <p className="text-xs font-bold text-bakery-dark">Kavita Verma</p>
              <p className="text-[10px] text-gray-400">Verified Buyer • Hyderabad</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-4">
            <div className="flex text-amber-400">★★★★★</div>
            <p className="text-xs text-gray-600 italic">"Prompt delivery and beautiful packaging. The walnut brownies were rich and fudgey."</p>
            <div>
              <p className="text-xs font-bold text-bakery-dark">Rohan Kapoor</p>
              <p className="text-[10px] text-gray-400">Verified Buyer • Chennai</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
