import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface SearchAndFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
}

export default function SearchAndFilters({
  categories,
  selectedCategories,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
}: SearchAndFiltersProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, onSearchChange]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onCategoryChange([]);
    setLocalQuery('');
    onSearchChange('');
    onPriceRangeChange([0, maxPrice]);
  };

  const hasFilters = selectedCategories.length > 0 || searchQuery.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <label htmlFor="search" className="sr-only">Search jerseys</label>
        <input
          id="search"
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search jerseys..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {localQuery && (
          <button
            onClick={() => {
              setLocalQuery('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-500">Filter:</span>
            {categories.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full border transition-all ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {category}
                </button>
              );
            })}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Price Range Filter */}
        {maxPrice > 0 && (
          <div className="w-full sm:w-64 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
              <span className="text-xs sm:text-sm text-gray-500">Price Range</span>
              <span className="text-xs sm:text-sm font-medium">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              min={0}
              max={maxPrice}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>₹0</span>
              <span>₹{maxPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
