import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onCancel ? onCancel() : null;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll(
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
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-cream-200 space-y-4 animate-scaleUp"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-600' : 'bg-bakery-light text-bakery'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 id="confirm-modal-title" className="font-serif font-bold text-base text-bakery-dark">
              {title}
            </h3>
          </div>

          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-cream-100 transition-colors focus:ring-2 focus:ring-bakery-caramel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p id="confirm-modal-desc" className="text-xs text-gray-600 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-full border border-cream-300 text-gray-700 font-bold text-xs hover:bg-cream-100 transition-colors focus:ring-2 focus:ring-bakery-caramel"
          >
            {cancelText}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 py-2.5 px-4 rounded-full text-white font-bold text-xs shadow-sm transition-colors focus:ring-2 focus:ring-bakery-caramel ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-bakery-caramel hover:bg-bakery'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
