import React, { useEffect, useRef } from 'react';
import { X, Printer, Cake, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function OrderReceiptModal({ isOpen, onClose, order }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={`Order Invoice Receipt for #${order.orderNumber}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl border border-cream-200 overflow-y-auto p-6 sm:p-8 space-y-6 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-cream-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bakery-light border border-bakery-caramel flex items-center justify-center text-bakery">
              <Cake className="w-4 h-4 text-bakery-rose" />
            </div>
            <span className="font-serif font-bold text-sm text-bakery-dark">Official Order Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-full bg-bakery-dark hover:bg-bakery text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close invoice viewer"
              className="p-1.5 rounded-full hover:bg-cream-100 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="space-y-6 printable-receipt">
          
          {/* Header Brand */}
          <div className="flex items-start justify-between border-b-2 border-bakery-caramel pb-4">
            <div>
              <h1 className="font-serif text-2xl font-extrabold text-bakery-dark">Dhakshu Bakes</h1>
              <p className="text-[11px] text-bakery-caramel font-semibold uppercase tracking-wider">Handcrafted Bakery & Confectionery</p>
              <p className="text-[11px] text-gray-500 mt-1">104 Park Avenue, Indiranagar, Bengaluru - 560038</p>
              <p className="text-[11px] text-gray-500">Email: support@dhakshubakes.local • FSSAI Lic No: 11223344556677</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-cream-100 text-bakery-dark text-xs font-bold rounded-lg border border-cream-300">
                INVOICE #{order.orderNumber}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5 uppercase">
                Payment: {order.paymentStatus}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Address */}
          <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-cream-50 rounded-2xl border border-cream-200">
            <div>
              <span className="font-bold text-bakery-dark uppercase tracking-wider block mb-1 text-[10px]">Billed To:</span>
              <p className="font-bold text-bakery-dark">{order.customerName}</p>
              <p className="text-gray-600">{order.customerEmail}</p>
            </div>

            {order.shippingAddress && (
              <div>
                <span className="font-bold text-bakery-dark uppercase tracking-wider block mb-1 text-[10px]">Shipping Address:</span>
                <p className="font-bold text-bakery-dark">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
                <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-cream-200 text-bakery-dark font-serif font-bold text-[11px] uppercase">
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2">Variant</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-gray-700">
                {order.items && order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-2 font-bold text-bakery-dark">{item.productName}</td>
                    <td className="py-2.5 px-2 text-bakery-caramel font-semibold">{item.variantName}</td>
                    <td className="py-2.5 px-2 text-center font-extrabold">{item.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-medium">₹{item.unitPrice}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-bakery-dark">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Authoritative Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs text-gray-600 border-t border-cream-200 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-bakery-dark">₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({order.appliedCouponCode})</span>
                  <span>- ₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-bakery-dark">
                  {order.deliveryFee == 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.deliveryFee}`}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST / Tax</span>
                  <span className="font-bold text-bakery-dark">₹{order.taxAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-bakery-dark border-t-2 border-bakery-dark pt-2">
                <span>Grand Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Thank You Note */}
          <div className="text-center pt-6 border-t border-cream-200 space-y-1">
            <p className="font-serif font-bold text-sm text-bakery-dark">Thank you for baking with Dhakshu Bakes!</p>
            <p className="text-[10px] text-gray-400">This is a computer-generated tax invoice and requires no physical signature.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
