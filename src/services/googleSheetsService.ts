import { Product, ProductStock, SIZES, SizeKey } from '@/types/product';

// ========== CONFIGURATION ==========
// Update this URL if your Google Sheet changes
export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhXztEoZijRFFNLgqkppafn53GAlKR8GVNU46NMLMc8msG2pHewnjcHDI_pDQNwDtvGuKULt7PLMb2/pub?output=csv';

// Cache TTL: 5 minutes (300,000 ms)
const CACHE_TTL = 300000;
const CACHE_KEY = 'the90minutedrip_products';
const CACHE_TIMESTAMP_KEY = 'the90minutedrip_cache_timestamp';

interface CacheData {
  products: Product[];
  timestamp: number;
}

// In-memory cache
let memoryCache: CacheData | null = null;

/**
 * Parse a numeric value, stripping currency symbols and non-numeric chars
 */
function parsePrice(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const cleaned = value.replace(/[₹$,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse stock value to number
 */
function parseStock(value: string): number {
  const parsed = parseInt(value?.trim() || '0', 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse comma-separated URLs into array
 */
function parseUrls(value: string): string[] {
  if (!value || value.trim() === '') return [];
  return value
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Parse CSV text into rows
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parse CSV data into Product objects
 */
export function parseProducts(csvText: string): Product[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const products: Product[] = [];

  // Create header index map
  const getIndex = (name: string): number => headers.indexOf(name);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Get values by header name
    const getValue = (name: string): string => {
      const idx = getIndex(name);
      return idx >= 0 && row[idx] ? row[idx].trim() : '';
    };

    // Only include published products
    const status = getValue('Status');
    if (status !== 'published') continue;

    const stock: ProductStock = {
      XS: parseStock(getValue('Stock_XS')),
      S: parseStock(getValue('Stock_S')),
      M: parseStock(getValue('Stock_M')),
      L: parseStock(getValue('Stock_L')),
      XL: parseStock(getValue('Stock_XL')),
      XXL: parseStock(getValue('Stock_XXL')),
    };

    const availableSizes = SIZES.filter(size => stock[size] > 0);

    const productName = getValue('ProductName');
    const team = getValue('Team');
    const category = getValue('Category');
    const shortDescription = getValue('ShortDescription');

    // Build search index for fast filtering
    const searchIndex = [productName, team, category, shortDescription]
      .join(' ')
      .toLowerCase();

    const product: Product = {
      id: `product-${i}-${Date.now()}`,
      productName,
      team,
      category,
      season: getValue('Season'),
      price: parsePrice(getValue('Price')),
      originalPrice: parsePrice(getValue('OriginalPrice')),
      images: parseUrls(getValue('ImageURLs')),
      videos: parseUrls(getValue('VideoURLs')),
      stock,
      availableSizes,
      limitedEdition: getValue('LimitedEdition').toLowerCase() === 'yes',
      description: getValue('Description'),
      shortDescription,
      status,
      dateAdded: getValue('DateAdded'),
      searchIndex,
      buyLink: getValue('BuyLink'),
    };

    products.push(product);
  }

  // Sort by newest first (DateAdded)
  products.sort((a, b) => {
    const dateA = new Date(a.dateAdded).getTime() || 0;
    const dateB = new Date(b.dateAdded).getTime() || 0;
    return dateB - dateA;
  });

  return products;
}

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  // Check memory cache first
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL) {
    return true;
  }

  // Check localStorage
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (timestamp && Date.now() - parseInt(timestamp, 10) < CACHE_TTL) {
      return true;
    }
  } catch {
    // localStorage not available
  }

  return false;
}

/**
 * Get cached products
 */
function getCachedProducts(): Product[] | null {
  // Try memory cache first
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL) {
    return memoryCache.products;
  }

  // Try localStorage
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const data = localStorage.getItem(CACHE_KEY);
    
    if (timestamp && data && Date.now() - parseInt(timestamp, 10) < CACHE_TTL) {
      const products = JSON.parse(data) as Product[];
      // Update memory cache
      memoryCache = { products, timestamp: parseInt(timestamp, 10) };
      return products;
    }
  } catch {
    // localStorage not available or parse error
  }

  return null;
}

/**
 * Save products to cache
 */
function setCachedProducts(products: Product[]): void {
  const timestamp = Date.now();
  
  // Update memory cache
  memoryCache = { products, timestamp };

  // Update localStorage
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch {
    // localStorage not available or quota exceeded
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
  memoryCache = null;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch {
    // localStorage not available
  }
}

/**
 * Fetch and parse products from Google Sheet
 */
export async function fetchProducts(): Promise<Product[]> {
  // Check cache first
  const cached = getCachedProducts();
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  const products = parseProducts(csvText);

  // Cache the results
  setCachedProducts(products);

  return products;
}

/**
 * Get unique categories from products
 */
export function getCategories(products: Product[]): string[] {
  const categories = new Set<string>();
  products.forEach(p => {
    if (p.category) {
      categories.add(p.category);
    }
  });
  return Array.from(categories).sort();
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round((originalPrice - price) / originalPrice * 100);
}
