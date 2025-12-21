import { useState, useEffect, useCallback } from 'react';
import { Product, SIZES, SizeKey } from '@/types/product';
import { calculateDiscount } from '@/services/googleSheetsService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  const handleBuyNowClick = () => {
    if (!selectedSize && product.availableSizes.length > 0) {
      setShowSizeWarning(true);
      return;
    }
    if (product.price === null) {
      toast({
        title: "Price not available",
        description: "Please inquire on WhatsApp for this product.",
        variant: "destructive",
      });
      return;
    }
    setShowBuyForm(true);
  };

  const handlePayment = async () => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(buyerPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productName: product.productName,
          amount: product.price,
          size: selectedSize,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Error",
          description: "Failed to get payment URL. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                aria-label="Close modal"
              >
                ✕
              </button>
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
                      className={`px-4 py-2 text-sm rounded-md border transition-all ${
                        isSelected
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

            {/* Buy Form */}
            {showBuyForm && (
              <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700">Enter your details</h3>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={20}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={75}
                />
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${product.price?.toLocaleString()}`}
                </button>
                <button
                  onClick={() => setShowBuyForm(false)}
                  className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!showBuyForm && (
              <div className="mt-6 space-y-3">
                {/* Buy Now Button */}
                {product.price !== null && (
                  <button
                    onClick={handleBuyNowClick}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Buy Now - ₹{product.price.toLocaleString()}
                  </button>
                )}

                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white bg-black hover:bg-gray-800 transition-colors font-medium"
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
            )}

            <p className="mt-3 text-xs text-gray-500">
              {product.price !== null 
                ? "Click 'Buy Now' to pay securely via Instamojo, or inquire on WhatsApp."
                : "By clicking WhatsApp you'll open a chat with prefilled details."}
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
