import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  videos: string[];
  productName: string;
}

export default function ImageGallery({ images, videos, productName }: ImageGalleryProps) {
  const allMedia = [...images, ...videos];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  const hasMultiple = allMedia.length > 1;
  const isVideo = currentIndex >= images.length;

  const next = () => {
    if (allMedia.length > 0) {
      setCurrentIndex((currentIndex + 1) % allMedia.length);
    }
  };

  const prev = () => {
    if (allMedia.length > 0) {
      setCurrentIndex((currentIndex - 1 + allMedia.length) % allMedia.length);
    }
  };

  const handleImageError = (index: number) => {
    setImageError(prev => new Set(prev).add(index));
  };

  if (allMedia.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div className="relative">
        {isVideo ? (
          <video
            src={allMedia[currentIndex]}
            controls
            className="w-full aspect-[3/4] object-cover rounded-md bg-gray-100"
          />
        ) : imageError.has(currentIndex) ? (
          <div className="w-full aspect-[3/4] bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            Image unavailable
          </div>
        ) : (
          <img
            src={allMedia[currentIndex]}
            alt={`${productName} ${currentIndex + 1}`}
            className="w-full aspect-[3/4] object-cover rounded-md"
            onError={() => handleImageError(currentIndex)}
          />
        )}

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
              aria-label="Previous image"
            >
              '<'
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors"
              aria-label="Next image"
            >
              '>'
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allMedia.map((media, i) => {
            const isVideoThumb = i >= images.length;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  i === currentIndex ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-200'
                }`}
              >
                {isVideoThumb ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                    ▶ Video
                  </div>
                ) : imageError.has(i) ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    N/A
                  </div>
                ) : (
                  <img
                    src={media}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(i)}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
