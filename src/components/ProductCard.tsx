import { useState } from 'react';
import { Product, SIZES, SizeKey } from '@/types/product';
import { calculateDiscount } from '@/services/googleSheetsService';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
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
    <article className="bg-white flex flex-col h-full">
      {/* Clickable Image and Title area */}
      <button onClick={onClick} className="w-full text-left flex-1 flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="object-contain h-full w-full"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.classList.add('fallback-shown');
              }}
            />
          ) : null}
          {!hasImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              No Image Available
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.limitedEdition && (
              <span className="bg-emerald-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium">
                Limited
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-medium">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full border-2 border-white shadow-lg transform -rotate-12">
                SOLD OUT
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors z-10"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Product Name */}
        <div className="pt-3 px-1">
          <h3 className="font-bold text-xs sm:text-sm text-black uppercase leading-tight line-clamp-2 tracking-wide">
            {product.productName}
          </h3>
        </div>
      </button>

      {/* Pricing and Actions - Not clickable for modal */}
      <div className="px-1 pb-2 mt-auto">
        {/* Price */}
        <div className="mt-2">
          {product.price !== null ? (
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  Rs. {product.originalPrice!.toLocaleString('en-IN')}.00
                </span>
              )}
              <span className="font-bold text-base sm:text-lg text-black">
                Rs. {product.price.toLocaleString('en-IN')}.00
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500 italic">Price on request</span>
          )}
        </div>

        {/* Size Selectors */}
        {product.availableSizes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SIZES.filter(size => product.availableSizes.includes(size)).map(size => (
              <button
                key={size}
                onClick={(e) => handleSizeClick(e, size)}
                className={`min-w-[32px] h-8 px-2 text-xs font-medium border transition-colors ${
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

        {/* Add to Cart Button */}
        {!isSoldOut && product.price !== null && (
          <Button
            onClick={handleAddToCart}
            className="w-full mt-3 bg-black text-white hover:bg-gray-800 rounded-none text-xs sm:text-sm font-semibold tracking-wider uppercase h-10"
          >
            ADD TO CART
          </Button>
        )}

        {/* Sold Out State */}
        {isSoldOut && (
          <Button
            disabled
            className="w-full mt-3 bg-gray-200 text-gray-500 rounded-none text-xs sm:text-sm font-semibold tracking-wider uppercase h-10 cursor-not-allowed"
          >
            SOLD OUT
          </Button>
        )}
      </div>
    </article>
  );
}
