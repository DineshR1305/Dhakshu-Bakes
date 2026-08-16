import React, { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import FreeDeliveryProgress from './FreeDeliveryProgress';

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem } = useCartStore();
  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button
      setTimeout(() => closeButtonRef.current?.focus(), 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeDrawer();
        }
        if (e.key === 'Tab' && drawerRef.current) {
          const focusables = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleNavigate = (path) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-cream-200 bg-cream-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bakery-light border border-bakery-caramel flex items-center justify-center text-bakery">
                <ShoppingBag className="w-4 h-4 text-bakery-rose" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-bakery-dark">Your Shopping Cart</h2>
                <span className="text-[11px] text-gray-500 font-semibold">
                  {cart.itemCount || 0} {cart.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeDrawer}
              aria-label="Close cart drawer"
              className="p-2 text-gray-400 hover:text-bakery-dark hover:bg-cream-100 rounded-full transition-colors focus:ring-2 focus:ring-bakery-caramel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Banner */}
          <div className="px-4 pt-3 pb-1 border-b border-cream-100 bg-white">
            <FreeDeliveryProgress subtotal={cart.subtotal || 0} />
          </div>

          {/* Items List / Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {!cart.items || cart.items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto text-bakery-caramel">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-bakery-dark">Your cart is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Looks like you haven't added any fresh baked treats to your cart yet.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('/shop')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-bakery-dark hover:bg-bakery text-white font-bold text-xs rounded-full transition-colors shadow-sm"
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
                        aria-label={`Decrease quantity of ${item.productName}`}
                        className="w-6 h-6 rounded-full bg-white hover:bg-cream-200 text-bakery-dark flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-extrabold text-bakery-dark select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.productName}`}
                        className="w-6 h-6 rounded-full bg-bakery-caramel hover:bg-bakery text-white flex items-center justify-center transition-colors shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
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
              <div className="flex items-center justify-between text-sm">
                <span className="font-serif font-bold text-bakery-dark">Subtotal</span>
                <span className="font-extrabold text-lg text-bakery-dark">₹{cart.subtotal}</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">
                Taxes and shipping calculated at checkout.
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
