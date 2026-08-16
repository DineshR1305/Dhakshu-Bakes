import React, { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import ProductCard from './ProductCard';
import api from '../services/api';

export default function RelatedProducts({ currentProduct, categoryId, categoryName, className = '' }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!currentProduct) return;
      setLoading(true);
      try {
        const res = await api.get('/products');
        if (res.success && Array.isArray(res.data)) {
          const allProducts = res.data.filter(p => p.id !== currentProduct.id);

          // Primary: same category products
          const sameCategory = allProducts.filter(
            p => (categoryId && p.categoryId === categoryId) || (categoryName && p.categoryName === categoryName)
          );

          // Fallback: fill up with bestsellers/featured if < 4
          const otherProducts = allProducts.filter(
            p => !sameCategory.some(sc => sc.id === p.id)
          );

          const combined = [...sameCategory, ...otherProducts].slice(0, 4);
          setRelated(combined);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [currentProduct?.id, categoryId, categoryName]);

  if (loading || !related || related.length === 0) return null;

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bakery-light border border-bakery-caramel flex items-center justify-center text-bakery">
            <Sparkles className="w-4 h-4 text-bakery-rose" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-bakery-dark">You May Also Like</h2>
            <p className="text-xs text-gray-500">Handcrafted treats that pair perfectly with your selection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
