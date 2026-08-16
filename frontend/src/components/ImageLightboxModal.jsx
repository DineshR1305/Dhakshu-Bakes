import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function ImageLightboxModal({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  onSelectIndex,
  altText = 'Product Image'
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowLeft' && images.length > 1) {
          const prev = (currentIndex - 1 + images.length) % images.length;
          onSelectIndex(prev);
        } else if (e.key === 'ArrowRight' && images.length > 1) {
          const next = (currentIndex + 1) % images.length;
          onSelectIndex(next);
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
  }, [isOpen, onClose, currentIndex, images.length, onSelectIndex]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex]?.imageUrl || images[0]?.imageUrl || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="High resolution product image view"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={onClose}
            aria-label="Close image viewer"
            className="p-2.5 rounded-full bg-white/90 hover:bg-white text-bakery-dark transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-bakery-caramel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main High Res Image */}
        <div className="relative w-full h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden bg-cream-950/20 shadow-2xl">
          <img
            src={currentImage}
            alt={altText}
            className="max-w-full max-h-full object-contain rounded-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200';
            }}
          />

          {/* Prev / Next Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white text-bakery-dark transition-all shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 hover:bg-white text-bakery-dark transition-all shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnails Strip */}
        {images.length > 1 && (
          <div className="flex gap-2.5 mt-4 overflow-x-auto p-2 bg-black/40 backdrop-blur-xs rounded-full">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => onSelectIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx ? 'border-bakery-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.imageUrl} alt={img.altText || altText} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
