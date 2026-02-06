import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Share2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Product, SIZES, SizeKey } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { calculateDiscount } from '@/services/googleSheetsService';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '918139016845';

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const discount = hasDiscount ? calculateDiscount(product.price!, product.originalPrice!) : 0;
  const allMedia = [...product.images, ...product.videos];
  const hasStock = product.availableSizes.length > 0;

  // Set default size to first available
  useEffect(() => {
    if (product.availableSizes.length > 0) {
      setSelectedSize(product.availableSizes[0] as SizeKey);
    }
  }, [product.availableSizes]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const generateWhatsAppMessage = () => {
    const priceText = product.price !== null ? `₹${product.price.toLocaleString()}` : 'Price on request';
    const message = `Hello, I'm interested in this jersey from The 90-Minute Drip.
Product: ${product.productName}
Team: ${product.team}
Season: ${product.season}
Size: ${selectedSize || 'Not selected'}
Price: ${priceText}
Can you confirm availability and next steps?`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    if (!selectedSize && product.availableSizes.length > 0) {
      setShowSizeWarning(true);
      return;
    }
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${generateWhatsAppMessage()}`, '_blank');
  };

  const handleBuyClick = () => {
    if (!selectedSize && product.availableSizes.length > 0) {
      setShowSizeWarning(true);
      return;
    }
    navigate('/order', {
      state: {
        product: {
          ...product,
          selectedSize: selectedSize || product.availableSizes[0]
        }
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.availableSizes.length > 0) {
      setShowSizeWarning(true);
      return;
    }
    if (selectedSize) {
      addToCart(product, selectedSize);
      toast.success(`${product.productName} added to cart!`);
      onClose();
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    const shareData = {
      title: product.productName,
      text: product.shortDescription || `Check out ${product.productName}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Full screen on mobile, centered card on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white w-full sm:max-w-lg sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-14 z-10 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
          aria-label="Share product"
        >
          <Share2 className="w-4 h-4 text-gray-700" />
        </button>

        {/* Main Image */}
        <div className="w-full aspect-square bg-gray-50 relative">
          {allMedia.length > 0 ? (
            currentImageIndex >= product.images.length ? (
              <video
                src={allMedia[currentImageIndex]}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={allMedia[currentImageIndex]}
                alt={`${product.productName}`}
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image Available
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {allMedia.map((media, i) => {
              const isVideo = i >= product.images.length;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`flex-shrink-0 w-16 h-16 border-2 transition-all ${
                    i === currentImageIndex 
                      ? 'border-black' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                      ▶
                    </div>
                  ) : (
                    <img
                      src={media}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Info */}
        <div className="px-4 pb-6 pt-2">
          {/* Product Name */}
          <h2 id="modal-title" className="text-lg font-bold text-black uppercase tracking-wide leading-tight">
            {product.productName}
          </h2>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="mt-3">
              <span className="inline-block bg-black text-white text-sm px-3 py-1 font-medium">
                {discount}% off
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="mt-2">
            {product.price !== null ? (
              <>
                {hasDiscount && (
                  <div className="text-gray-500 line-through text-sm">
                    Rs. {product.originalPrice!.toLocaleString('en-IN')}.00
                  </div>
                )}
                <div className="text-2xl font-bold text-black italic">
                  Rs. {product.price.toLocaleString('en-IN')}.00
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Shipping calculated at checkout.
                </div>
              </>
            ) : (
              <div className="text-lg text-gray-500 italic">Price on request</div>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3 flex items-center gap-2">
            {hasStock ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium text-sm">In stock!</span>
              </>
            ) : (
              <span className="text-red-500 font-medium text-sm">Out of stock</span>
            )}
          </div>

          {/* Size Selector */}
          {hasStock && (
            <div className="mt-4">
              <div className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                size:
                {showSizeWarning && !selectedSize && (
                  <span className="text-red-500 text-xs">Please select a size</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.filter(size => product.availableSizes.includes(size)).map(size => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 text-sm font-medium border transition-all ${
                        isSelected
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleBuyClick}
                disabled={!hasStock}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-white bg-black hover:bg-gray-800 transition-colors font-semibold text-sm uppercase tracking-wider disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!hasStock}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleWhatsAppClick}
              className="w-full inline-flex items-center justify-center gap-2 py-3 border border-gray-300 text-black hover:border-black transition-colors font-medium text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Inquire on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
