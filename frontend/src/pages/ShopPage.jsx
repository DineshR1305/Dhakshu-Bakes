import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, RefreshCw, X, Star, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL search params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [query, setQuery] = useState(searchParams.get('search') || searchParams.get('query') || '');
  const [isEggless, setIsEggless] = useState(searchParams.get('eggless') === 'true' || searchParams.get('isEggless') === 'true');
  const [isBestseller, setIsBestseller] = useState(searchParams.get('bestseller') === 'true' || searchParams.get('isBestseller') === 'true');
  const [minRating, setMinRating] = useState(Number(searchParams.get('rating')) || 0);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 2000);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state FROM URL query params whenever the URL changes (e.g. Back/Forward)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setQuery(searchParams.get('search') || searchParams.get('query') || '');
    setIsEggless(searchParams.get('eggless') === 'true' || searchParams.get('isEggless') === 'true');
    setIsBestseller(searchParams.get('bestseller') === 'true' || searchParams.get('isBestseller') === 'true');
    setMinRating(Number(searchParams.get('rating')) || 0);
    setInStockOnly(searchParams.get('inStock') === 'true');
    setSort(searchParams.get('sort') || 'featured');
    setMinPrice(Number(searchParams.get('minPrice')) || 0);
    setMaxPrice(Number(searchParams.get('maxPrice')) || 2000);
  }, [searchParams]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) setCategories(res.data);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    }
    fetchCategories();
  }, []);

  // Update URL params whenever filters change
  const updateUrlParams = (newParamsObj) => {
    const params = new URLSearchParams();
    if (newParamsObj.category) params.set('category', newParamsObj.category);
    if (newParamsObj.query) params.set('search', newParamsObj.query);
    if (newParamsObj.isEggless) params.set('eggless', 'true');
    if (newParamsObj.isBestseller) params.set('bestseller', 'true');
    if (newParamsObj.minRating > 0) params.set('rating', newParamsObj.minRating.toString());
    if (newParamsObj.inStockOnly) params.set('inStock', 'true');
    if (newParamsObj.sort && newParamsObj.sort !== 'featured') params.set('sort', newParamsObj.sort);
    if (newParamsObj.minPrice > 0) params.set('minPrice', newParamsObj.minPrice.toString());
    if (newParamsObj.maxPrice < 2000) params.set('maxPrice', newParamsObj.maxPrice.toString());

    setSearchParams(params);
  };

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
        if (minPrice > 0) params.append('minPrice', minPrice.toString());
        if (maxPrice < 2000) params.append('maxPrice', maxPrice.toString());

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success && Array.isArray(res.data)) {
          let list = res.data;

          // Client-side additional filter refinements (rating & in-stock)
          if (minRating > 0) {
            list = list.filter(p => (p.ratingAvg || 5.0) >= minRating);
          }

          if (inStockOnly) {
            list = list.filter(p => {
              const primaryVariant = p.variants?.[0];
              return primaryVariant && !primaryVariant.outOfStock;
            });
          }

          setProducts(list);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, query, isEggless, isBestseller, sort, minPrice, maxPrice, minRating, inStockOnly]);

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
    updateUrlParams({
      category: categorySlug,
      query,
      isEggless,
      isBestseller,
      minRating,
      inStockOnly,
      sort,
      minPrice,
      maxPrice
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setQuery('');
    setIsEggless(false);
    setIsBestseller(false);
    setMinRating(0);
    setInStockOnly(false);
    setSort('featured');
    setMinPrice(0);
    setMaxPrice(2000);
    setSearchParams({});
  };

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

  const activeFiltersCount = (selectedCategory ? 1 : 0) +
    (query ? 1 : 0) +
    (isEggless ? 1 : 0) +
    (isBestseller ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice > 0 || maxPrice < 2000 ? 1 : 0) +
    (sort !== 'featured' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      <SEOHead
        title={shopTitle}
        description={`Explore our fresh collection of ${selectedCategory || 'gourmet cakes, cupcakes, pastries, brownies, and cookies'} baked daily at Dhakshu Bakes.`}
        jsonLd={breadcrumbSchema}
      />

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-bakery-dark">
          {selectedCategory ? `${selectedCategory.toUpperCase()} COLLECTION` : 'OUR COMPLETE BAKERY CATALOG'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">Browse freshly baked handcrafted treats, cakes, and artisan pastries.</p>

        {/* Active Query Banner if search active */}
        {query && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-600">Search results for:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cream-200 text-bakery-dark text-xs font-bold rounded-full">
              "{query}"
              <button
                onClick={() => { setQuery(''); updateUrlParams({ category: selectedCategory, query: '', isEggless, isBestseller, minRating, inStockOnly, sort, minPrice, maxPrice }); }}
                aria-label="Clear search keyword"
              >
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-bakery-dark" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          aria-expanded={mobileFilterOpen}
          aria-controls="shop-filter-panel"
          className="w-full py-2.5 px-4 bg-white border border-cream-200 rounded-xl font-bold text-xs text-bakery-dark flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-bakery-caramel" />
            <span>Filter Products {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
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
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-bakery-caramel hover:text-bakery flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
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
                onBlur={() => updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating, inStockOnly, sort, minPrice, maxPrice })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-cream-100 border border-cream-300 rounded-lg focus:ring-1 focus:ring-bakery-caramel"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Category</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCategory === '' ? 'bg-bakery-caramel text-white font-bold' : 'text-gray-600 hover:bg-cream-100'}`}
              >
                All Products
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCategorySelect(c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCategory === c.slug ? 'bg-bakery-caramel text-white font-bold' : 'text-gray-600 hover:bg-cream-100'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Options */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Dietary Options</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={isEggless}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsEggless(checked);
                    updateUrlParams({ category: selectedCategory, query, isEggless: checked, isBestseller, minRating, inStockOnly, sort, minPrice, maxPrice });
                  }}
                  className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
                />
                <span>100% Pure Eggless Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsBestseller(checked);
                    updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller: checked, minRating, inStockOnly, sort, minPrice, maxPrice });
                  }}
                  className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
                />
                <span>Bestsellers Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setInStockOnly(checked);
                    updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating, inStockOnly: checked, sort, minPrice, maxPrice });
                  }}
                  className="rounded border-cream-300 text-bakery-caramel focus:ring-bakery-caramel"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="text-xs font-bold text-bakery-dark uppercase tracking-wider block mb-2">Customer Rating</label>
            <div className="flex gap-2">
              {[0, 4, 3].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMinRating(r);
                    updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating: r, inStockOnly, sort, minPrice, maxPrice });
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    minRating === r
                      ? 'bg-bakery-dark text-white border-bakery-dark'
                      : 'bg-white text-gray-600 border-cream-300 hover:border-bakery-caramel'
                  }`}
                >
                  {r === 0 ? (
                    'All'
                  ) : (
                    <>
                      <span>{r}★</span>
                      <span className="text-[10px]">& up</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-bakery-dark mb-2">
              <span>Price Range:</span>
              <span className="text-bakery-caramel">₹{minPrice} - ₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              onMouseUp={() => updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating, inStockOnly, sort, minPrice, maxPrice })}
              onTouchEnd={() => updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating, inStockOnly, sort, minPrice, maxPrice })}
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
              <label htmlFor="shop-sort-select" className="text-xs font-bold text-bakery-dark">Sort By:</label>
              <select
                id="shop-sort-select"
                value={sort}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSort(newSort);
                  updateUrlParams({ category: selectedCategory, query, isEggless, isBestseller, minRating, inStockOnly, sort: newSort, minPrice, maxPrice });
                }}
                className="text-xs bg-cream-100 border border-cream-300 rounded-lg px-3 py-1.5 font-medium text-bakery-dark focus:outline-none focus:border-bakery-caramel"
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
              <p className="text-xs text-gray-500">Try adjusting search keywords, price limits, or clearing dietary restrictions.</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-bakery-dark text-white text-xs font-bold rounded-full hover:bg-bakery shadow-sm"
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

      {/* Recently Viewed Products Section */}
      <RecentlyViewed className="pt-10 border-t border-cream-200" />
    </div>
  );
}