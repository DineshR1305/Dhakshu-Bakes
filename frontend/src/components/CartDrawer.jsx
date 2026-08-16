import React, { useEffect, useRef } from 'react';
import { ShoppingBag, X, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import FreeDeliveryProgress from './FreeDeliveryProgress';
import CouponSection from './CouponSection';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeDrawer();
      };
      window.addEventListener('keydown', handleKeyDown);

      // Focus management: move focus into drawer
      if (drawerRef.current) {
        drawerRef.current.focus();
      }

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleNavigate = (path) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart Side Panel Drawer"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          tabIndex={-1}
          className="w-screen max-w-md bg-white border-l border-cream-200 shadow-2xl flex flex-col focus:outline-none animate-slideLeft"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-bakery-light border border-bakery-caramel flex items-center justify-center text-bakery">
                <ShoppingBag className="w-4 h-4 text-bakery-caramel" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-bakery-dark">Your Cart</h3>
                <p className="text-[11px] text-gray-500 font-semibold">{cart.itemCount} item(s) selected</p>
              </div>
            </div>

            <button
              onClick={closeDrawer}
              aria-label="Close cart drawer"
              className="p-1.5 rounded-full text-gray-400 hover:text-bakery-dark hover:bg-cream-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Banner */}
          {cart.items && cart.items.length > 0 && (
            <div className="p-4 bg-white border-b border-cream-100 shrink-0">
              <FreeDeliveryProgress subtotal={cart.subtotal} />
            </div>
          )}

          {/* Drawer Body - Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {!cart.items || cart.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-bakery-caramel">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-bakery-dark">Your Cart is Empty</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our fresh cakes and pastries to add treat items.</p>
                </div>
                <button
                  onClick={() => handleNavigate('/shop')}
                  className="px-6 py-2.5 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full shadow-md transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Bakery Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-cream-200 shadow-xs flex items-center gap-3.5 hover:border-cream-300 transition-colors"
                >
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300'}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover border border-cream-200 shrink-0 bg-cream-50"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productSlug}`}
                      onClick={closeDrawer}
                      className="font-serif font-bold text-xs text-bakery-dark hover:text-bakery truncate block"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-[11px] text-bakery-caramel font-semibold truncate">{item.variantName}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.isEggless && (
                        <span className="text-[8px] font-extrabold bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">Eggless</span>
                      )}
                      {item.isGiftWrapped && (
                        <span className="text-[8px] font-extrabold bg-amber-100 text-amber-800 px-1 py-0.5 rounded">Gift Wrapped</span>
                      )}
                    </div>

                    {item.customMessage && (
                      <p className="text-[9px] text-gray-600 font-medium truncate mt-0.5 bg-cream-50 px-1.5 py-0.5 rounded border border-cream-200">
                        "{item.customMessage}"
                      </p>
                    )}

                    <p className="text-xs font-extrabold text-bakery-dark mt-1">₹{item.unitPrice}</p>
                  </div>

                  {/* Quantity & Remove Controls */}
                  <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.productName} from cart`}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="inline-flex items-center bg-cream-100 border border-cream-300 rounded-full p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease item quantity"
                        className="px-2 py-0.5 font-bold text-xs hover:bg-cream-200 rounded-l-full min-h-[28px]"
                      >
                        -
                      </button>
                      <span className="px-2 font-extrabold text-xs text-bakery-dark">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase item quantity"
                        className="px-2 py-0.5 font-bold text-xs hover:bg-cream-200 rounded-r-full min-h-[28px]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.items && cart.items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-cream-200 bg-cream-50/90 space-y-3 shrink-0">
              <CouponSection subtotal={cart.subtotal} />

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="font-serif font-bold text-bakery-dark">Subtotal</span>
                <span className="font-extrabold text-lg text-bakery-dark">₹{cart.subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                Taxes and delivery fee calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => handleNavigate('/cart')}
                  className="w-full py-2.5 px-3 rounded-full border border-cream-300 bg-white hover:bg-cream-100 text-bakery-dark font-bold text-xs transition-colors text-center shadow-xs"
                >
                  View Cart
                </button>
                <button
                  onClick={() => handleNavigate('/checkout')}
                  className="w-full py-2.5 px-3 rounded-full bg-bakery-caramel hover:bg-bakery text-white font-bold text-xs transition-colors text-center shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
