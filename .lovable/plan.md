

## Plan: Use Stable Product ID from Google Sheet + Deep Linking

### Overview
Now that you've added an `ID` column to your Google Sheet with unique numbers, we'll update the code to use these stable IDs. This will make shared product links work correctly!

### What Will Change

#### 1. Use Your New ID Column
Instead of generating IDs like `product-1-1234567890`, the app will now use the actual ID from your Google Sheet (e.g., `101`, `102`, etc.)

#### 2. Deep Linking Support
When someone opens a shared link like `yoursite.com/?product=101`, the product modal will automatically open for that product.

---

### Technical Details

#### File 1: `src/services/googleSheetsService.ts`

**Changes:**
- Read the new `ID` column from the CSV
- Use it as the product's stable identifier
- Fall back to row index if ID is missing (safety measure)
- Add `findProductById()` helper function for deep linking

```typescript
// Line 149 changes from:
id: `product-${i}-${Date.now()}`

// To:
id: getValue('ID') || `product-${i}`
```

**New helper function:**
```typescript
export function findProductById(products: Product[], id: string): Product | undefined {
  return products.find(p => p.id === id);
}
```

---

#### File 2: `src/components/The90MinuteDrip.tsx`

**Changes:**
- Import `useSearchParams` from react-router-dom
- After products load, check for `?product=` in URL
- If found, auto-open that product's modal
- Clear the URL parameter after opening (keeps URL clean)

**New effect for deep linking:**
```typescript
useEffect(() => {
  const productId = searchParams.get('product');
  if (productId && products.length > 0 && !loading) {
    const product = findProductById(products, productId);
    if (product) {
      setSelectedProduct(product);
      setSearchParams({}, { replace: true }); // Clean URL
    }
  }
}, [products, loading, searchParams]);
```

---

### Share URL Flow After Implementation

```text
1. User clicks Share button on product with ID "101"
       ↓
2. URL copied: https://yoursite.com/?product=101
       ↓
3. Recipient opens link
       ↓
4. Page loads, detects ?product=101
       ↓
5. Finds product with ID "101"
       ↓
6. Auto-opens ProductModal for that product
```

---

### Summary of Changes

| File | Changes |
|------|---------|
| `src/services/googleSheetsService.ts` | Use `ID` column for product ID, add `findProductById()` helper |
| `src/components/The90MinuteDrip.tsx` | Add deep-link support to auto-open shared product URLs |

---

### Important Note
Make sure the `ID` column header in your Google Sheet is exactly `ID` (case-sensitive) for this to work correctly.

