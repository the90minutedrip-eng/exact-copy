import { useState } from 'react';
import { Product, SIZES, SizeKey } from '@/types/product';
import { calculateDiscount } from '@/services/googleSheetsService';
import { useCart } from '@/contexts/CartContext';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>(null);
  
  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const discount = hasDiscount ? calculateDiscount(product.price!, product.originalPrice!) : 0;
  const hasImage = product.images.length > 0;
  const isSoldOut = product.availableSizes.length === 0;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedSize) {
      addToCart(product, selectedSize);
      toast.success(`${product.productName} added to cart!`);
    } else {
      toast.error('Please select a size');
    }
  };

  const handleSizeClick = (e: React.MouseEvent, size: SizeKey) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <article className="bg-white flex flex-col">
      {/* Clickable Image area */}
      <button onClick={onClick} className="w-full text-left">
        {/* Image - more compact aspect ratio */}
        <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center relative overflow-hidden">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="object-contain h-full w-full"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}

          {/* Badges - compact */}
          <div className="absolute top-1 left-1 flex flex-col gap-0.5">
            {product.limitedEdition && (
              <span className="bg-black text-white text-[8px] px-1 py-0.5 font-medium">
                LIMITED
              </span>
            )}
            {discount > 0 && (
              <span className="bg-black text-white text-[8px] px-1 py-0.5 font-medium">
                {discount}% off
              </span>
            )}
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black text-[10px] font-bold px-2 py-1">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 hover:bg-white flex items-center justify-center z-10"
            aria-label="Share product"
          >
            <Share2 className="w-3 h-3 text-black" />
          </button>
        </div>
      </button>

      {/* Product Info - compact */}
      <div className="py-2 flex flex-col gap-1">
        {/* Product Name */}
        <button onClick={onClick} className="text-left">
          <h3 className="font-bold text-[10px] sm:text-xs text-black uppercase leading-tight line-clamp-2 tracking-wide">
            {product.productName}
          </h3>
        </button>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          {product.price !== null ? (
            <>
              {hasDiscount && (
                <span className="text-[9px] sm:text-[10px] text-gray-500 line-through">
                  Rs. {product.originalPrice!.toLocaleString('en-IN')}
                </span>
              )}
              <span className="font-bold text-xs sm:text-sm text-black">
                Rs. {product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-gray-500 italic">Price on request</span>
          )}
        </div>

        {/* Size Selectors - inline compact */}
        {product.availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-0.5">
            {SIZES.filter(size => product.availableSizes.includes(size)).map(size => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`min-w-[22px] h-5 px-1 text-[9px] font-medium border transition-colors ${
                  selectedSize === size
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Add to Cart Button - sharp corners */}
        {!isSoldOut && product.price !== null && (
          <button
            onClick={handleAddToCart}
            className="w-full mt-1 bg-black text-white hover:bg-gray-800 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase h-7 transition-colors"
          >
            ADD TO CART
          </button>
        )}

        {/* Sold Out State */}
        {isSoldOut && (
          <button
            disabled
            className="w-full mt-1 bg-gray-200 text-gray-500 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase h-7 cursor-not-allowed"
          >
            SOLD OUT
          </button>
        )}
      </div>
    </article>
  );
}
