import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [query, setQuery] = useState(
    searchParams.get('query') || ''
  );
  const [isEggless, setIsEggless] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(2000);

  // Sync filters whenever the URL query parameters change
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category') || '';
    const queryFromUrl = searchParams.get('query') || '';

    setSelectedCategory(categoryFromUrl);
    setQuery(queryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (selectedCategory) params.append('category', selectedCategory);
        if (isEggless) params.append('isEggless', 'true');
        if (isBestseller) params.append('isBestseller', 'true');
        if (sort) params.append('sort', sort);
        if (maxPrice < 2000) params.append('maxPrice', maxPrice.toString());

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success) setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, query, isEggless, isBestseller, sort, maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setQuery('');
    setIsEggless(false);
    setIsBestseller(false);
    setSort('featured');
    setMaxPrice(2000);
    setSearchParams({});
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const shopTitle = selectedCategory ? `${selectedCategory.toUpperCase()} Cakes & Bakes` : 'Handcrafted Bakery Catalog';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${window.location.origin}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Shop Catalog', 'item': `${window.location.origin}/shop` },
      ...(selectedCategory ? [{ '@type': 'ListItem', 'position': 3, 'name': selectedCategory, 'item': `${window.location.origin}/category/${selectedCategory}` }] : [])
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <SEOHead
        title={shopTitle}
        description={`Explore our fresh collection of ${selectedCategory || 'gourmet cakes, cupcakes, pastries, brownies, and cookies'} baked daily at Dhakshu Bakes.`}
        jsonLd={breadcrumbSchema}
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-bakery-dark">
          {selectedCategory ? `${selectedCategory.toUpperCase()} COLLECTION` : 'OUR COMPLETE BAKERY CATALOG'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Browse freshly baked handcrafted treats, cakes, and artisan pastries.</p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          aria-expanded={mobileFilterOpen}
          aria-controls="shop-filter-panel"
          className="w-full py-2.5 px-4 bg-white border border-cream-200 rounded-xl font-bold text-xs text-bakery-dark flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-bakery-caramel" />
            <span>Filter Products ({products.length})</span>
          </div>
          <span className="text-bakery-caramel">{mobileFilterOpen ? 'Hide ▲' : 'Show ▼'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

        {/* Sidebar Filters */}
        <div id="shop-filter-panel" className={`bg-white p-6 rounded-2xl border border-cream-200 shadow-xs h-fit space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <div className="flex items-center gap-2 font-serif font-bold text-base text-bakery-dark">
              <SlidersHorizontal className="w-4 h-4 text-bakery-caramel" />
              <span>Filter Catalog</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-bakery-caramel hover:text-bakery flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Box Filter */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. chocolate, red velvet..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Category</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchParams({});
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCategory === '' ? 'bg-bakery-caramel text-white font-bold' : 'text-gray-600 hover:bg-cream-100'
                  }`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.slug);
                    setSearchParams({ category: c.slug });
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCategory === c.slug ? 'bg-bakery-caramel text-white font-bold' : 'text-gray-600 hover:bg-cream-100'
                    }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Type */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Dietary Options</label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
              <input
                type="checkbox"
                checked={isEggless}
                onChange={(e) => setIsEggless(e.target.checked)}
                className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
              />
              <span>100% Pure Eggless Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium mt-2">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
              />
              <span>Bestsellers Only</span>
            </label>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-bakery-dark mb-2">
              <span>Max Price: ₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-bakery-caramel cursor-pointer"
            />
          </div>

        </div>

        {/* Main Grid & Toolbar */}
        <div className="lg:col-span-3 space-y-6">

          {/* Sorting Control */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-cream-200">
            <span className="text-xs font-semibold text-gray-500">
              Showing <strong>{products.length}</strong> bakery items
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-bakery-dark">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs bg-cream-100 border border-cream-300 rounded-lg px-3 py-1.5 font-medium text-bakery-dark focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12 text-center">
              <p className="text-sm font-semibold text-gray-400 col-span-full">Loading fresh baked goodies...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-cream-200 text-center space-y-4">
              <p className="text-base font-bold text-bakery-dark">No products found matching your filter criteria.</p>
              <p className="text-xs text-gray-500">Try adjusting search keywords or clearing dietary restrictions.</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-bakery-dark text-white text-xs font-bold rounded-full hover:bg-bakery"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}