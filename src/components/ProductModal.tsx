import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product, SIZES, SizeKey } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { calculateDiscount } from '@/services/googleSheetsService';
import ImageGallery from './ImageGallery';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '918139016845';
const DESCRIPTION_CHAR_LIMIT = 150;

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const discount = hasDiscount ? calculateDiscount(product.price!, product.originalPrice!) : 0;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 p-4 overflow-y-auto">
            <ImageGallery
              images={product.images}
              videos={product.videos}
              productName={product.productName}
            />
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 id="modal-title" className="text-xl font-semibold text-black">
                  {product.productName}
                </h2>
                {product.team && (
                  <div className="text-sm text-gray-500 mt-1">{product.team}</div>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {product.category && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  )}
                  {product.season && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.season}
                    </span>
                  )}
                  {product.limitedEdition && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                      Limited Edition
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center gap-3">
              {product.price !== null ? (
                <>
                  <span className="text-2xl font-bold text-black">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{product.originalPrice!.toLocaleString()}
                      </span>
                      <span className="bg-red-500 text-white text-sm px-2 py-1 rounded font-medium">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-lg text-gray-500 italic">Price on request</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {showFullDescription || product.description.length <= DESCRIPTION_CHAR_LIMIT
                    ? product.description
                    : `${product.description.slice(0, DESCRIPTION_CHAR_LIMIT)}...`}
                </p>
                {product.description.length > DESCRIPTION_CHAR_LIMIT && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {showFullDescription ? 'Show less' : 'More'}
                  </button>
                )}
              </div>
            )}

            {/* Size Selector */}
            <div className="mt-6">
              <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                Select size
                {showSizeWarning && !selectedSize && (
                  <span className="text-red-500 text-xs">Please select a size</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => {
                  const inStock = product.stock[size] > 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`px-4 py-2 text-sm rounded-md border transition-all ${isSelected
                          ? 'ring-2 ring-green-500 border-transparent bg-green-50 text-green-700'
                          : inStock
                            ? 'border-gray-200 hover:border-gray-400 text-gray-700'
                            : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                      {size}
                      {!inStock && (
                        <span className="block text-xs text-gray-400">Out of stock</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleBuyClick}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-black hover:bg-gray-800 transition-colors font-medium border border-black"
                  disabled={product.availableSizes.length > 0 && !selectedSize}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-black bg-white hover:bg-gray-50 transition-colors font-medium border border-gray-200"
                  title="Add to Cart"
                  disabled={product.availableSizes.length > 0 && !selectedSize}
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-black bg-white hover:bg-gray-50 transition-colors font-medium border border-gray-200"
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

            <p className="mt-3 text-xs text-gray-500">
              By clicking WhatsApp you'll open a chat with prefilled details.
            </p>

            {/* Date Added (Admin note) */}
            {product.dateAdded && (
              <p className="mt-4 text-xs text-gray-400">
                Added: {product.dateAdded}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
