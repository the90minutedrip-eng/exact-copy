import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { fetchProducts, getCategories, clearCache } from '@/services/googleSheetsService';
import SearchAndFilters from './SearchAndFilters';
import ProductGrid from './ProductGrid';
import ProductModal from './ProductModal';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import PromoBanner from './PromoBanner';

const CONTACT_EMAIL = 'the90minutedrip@gmail.com';

export default function The90MinuteDrip() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
      // Set initial price range based on max price
      const max = Math.max(...data.map(p => p.price || 0), 0);
      setPriceRange([0, max]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Get max price for slider
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.price || 0), 0);
  }, [products]);

  // Get unique categories
  const categories = useMemo(() => getCategories(products), [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => p.searchIndex.includes(query));
    }

    // Filter by price range
    result = result.filter(p => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return result;
  }, [products, selectedCategories, searchQuery, priceRange]);

  const handleRetry = () => {
    clearCache();
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased flex flex-col">
      {/* Promo Banner */}
      <PromoBanner />

      {/* Header */}
      <header className="py-6 px-6 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">The 90-Minute Drip</h1>
            <div className="text-sm text-gray-500">
              {!loading && !error && (
                <span>{filteredProducts.length} of {products.length} jerseys</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : (
          <div className="space-y-6">
            {/* Search and Filters */}
            <SearchAndFilters
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={maxPrice}
            />

            {/* Product Grid */}
            <ProductGrid
              products={filteredProducts}
              onProductClick={setSelectedProduct}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Made for fans — browse and inquire on WhatsApp.</span>
            <Link to="/terms" className="underline hover:text-black">
              Terms & Conditions
            </Link>
          </div>
          <div>
            Contact:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-black">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
