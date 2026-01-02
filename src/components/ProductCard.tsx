import { Product } from '@/types/product';
import { calculateDiscount } from '@/services/googleSheetsService';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.price && product.originalPrice > product.price;
  const discount = hasDiscount ? calculateDiscount(product.price!, product.originalPrice!) : 0;
  const hasImage = product.images.length > 0;
  const isSoldOut = product.availableSizes.length === 0;

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
      <button onClick={onClick} className="w-full text-left flex-1">
        {/* Image or Fallback */}
        <div className="h-56 bg-gray-50 flex items-center justify-center relative">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.productName}
              className="object-cover h-full w-full"
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
          <div className="absolute top-2 left-2 flex flex-col gap-0.5 sm:gap-1 max-w-[45%]">
            {product.limitedEdition && (
              <span className="bg-emerald-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium shadow-sm whitespace-nowrap">
                <span className="sm:hidden">Limited</span>
                <span className="hidden sm:inline">Limited Edition</span>
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-medium shadow-sm whitespace-nowrap">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Category Label */}
          {product.category && (
            <span className="absolute top-2 right-2 bg-black/80 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-sm truncate max-w-[80px] sm:max-w-[120px]">
              {product.category}
            </span>
          )}

          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-red-500 text-white font-bold text-sm sm:text-base px-4 py-2 rounded-full border-2 border-white shadow-lg transform -rotate-12">
                SOLD OUT
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="font-medium text-black line-clamp-1">{product.productName}</div>
          {product.team && (
            <div className="text-xs text-gray-500 mt-1">{product.team}</div>
          )}
          {product.shortDescription && (
            <div className="text-sm text-gray-600 mt-2 line-clamp-2">{product.shortDescription}</div>
          )}

          {/* Price */}
          <div className="mt-3 flex items-center gap-2">
            {product.price !== null ? (
              <>
                <span className="font-semibold text-black">₹{product.price.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-500 italic">Price on request</span>
            )}
          </div>

          {/* Available sizes preview */}
          {product.availableSizes.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {product.availableSizes.slice(0, 4).map(size => (
                <span key={size} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {size}
                </span>
              ))}
              {product.availableSizes.length > 4 && (
                <span className="text-xs text-gray-400">+{product.availableSizes.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </button>

      <div className="p-4 pt-0">
        <Button
          onClick={handleViewClick}
          variant="outline"
          className="w-full border-black text-black hover:bg-black hover:text-white transition-colors text-xs sm:text-sm"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span className="sm:hidden">View</span>
          <span className="hidden sm:inline">View Availability</span>
        </Button>
      </div>
    </article>
  );
}

