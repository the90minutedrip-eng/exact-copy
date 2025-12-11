# The 90-Minute Drip

A minimal, lightweight jersey catalog website that fetches product data from a Google Sheet CSV.

## Features

- **Live Google Sheet Integration**: Products are fetched from a published Google Sheet CSV
- **5-Minute Client-Side Cache**: Reduces API calls and improves performance
- **Search & Filter**: Instant client-side search across product name, team, category, and description
- **Category Filters**: Multi-select category filtering
- **Product Modal**: Image gallery with video support, size selection, and WhatsApp inquiry
- **Responsive Design**: Mobile-first grid layout
- **Lazy Loading**: Images load on demand for better performance

## Configuration

### CSV URL

Update the CSV URL in `src/services/googleSheetsService.ts`:

```typescript
export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv';
```

### WhatsApp Number

Update the WhatsApp number in `src/components/ProductModal.tsx`:

```typescript
const WHATSAPP_NUMBER = '918139016845';
```

## Google Sheet Column Headers

The sheet must have these exact headers (case-sensitive):

| Column | Type | Description |
|--------|------|-------------|
| ProductName | string | Product display name |
| Team | string | Team/brand name |
| Category | string | Product category (e.g., "new season", "retro") |
| Season | string | Season identifier (e.g., "2024-25") |
| Price | number | Current price (can include ₹ symbol) |
| OriginalPrice | number | Original price for discount calculation |
| ImageURLs | string | Comma-separated image URLs |
| VideoURLs | string | Comma-separated video URLs |
| Stock_XS | number | Stock quantity for XS |
| Stock_S | number | Stock quantity for S |
| Stock_M | number | Stock quantity for M |
| Stock_L | number | Stock quantity for L |
| Stock_XL | number | Stock quantity for XL |
| Stock_XXL | number | Stock quantity for XXL |
| LimitedEdition | string | "yes" or "no" |
| Description | string | Full product description |
| ShortDescription | string | Brief description for cards |
| Status | string | Must be "published" to show |
| DateAdded | string | Date for sorting (newest first) |

## Caching

Products are cached for 5 minutes (300,000ms) using:
1. **Memory cache**: Fast in-session retrieval
2. **localStorage**: Persists across page reloads

### Clear Cache

To force a fresh fetch, call:

```typescript
import { clearCache } from '@/services/googleSheetsService';
clearCache();
```

Or open browser DevTools and run:
```javascript
localStorage.removeItem('the90minutedrip_products');
localStorage.removeItem('the90minutedrip_cache_timestamp');
```

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically

## Adding New Columns

1. Add the column to your Google Sheet
2. Update `src/types/product.ts` with the new field
3. Update `parseProducts()` in `src/services/googleSheetsService.ts` to extract the value
4. Use the new field in your components

## How to Test Checklist

### WhatsApp Message
1. Click a product card
2. Select a size
3. Click "Inquire on WhatsApp"
4. Verify the prefilled message contains: Product, Team, Season, Size, Price

### Size Availability
1. Open a product modal
2. Verify sizes with stock > 0 are clickable
3. Verify sizes with stock = 0 show "Out of stock" and are disabled

### Discount Badge
1. Find a product where OriginalPrice > Price
2. Verify discount badge shows correct percentage
3. Verify original price is struck through

### Caching
1. Open Network tab in DevTools
2. Load the page (should fetch CSV)
3. Refresh within 5 minutes (should NOT fetch CSV)
4. Wait 5+ minutes and refresh (should fetch CSV again)
