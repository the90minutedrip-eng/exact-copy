

## Plan: Add Share Button to Product Card

### Overview
Add a share button to the product card that allows users to easily share product links with others. The button will use the Web Share API on supported devices (mobile) and fall back to copying the link to clipboard on desktop.

### Implementation Details

#### 1. Share Button Placement
- Add an icon-only share button in the top-right corner of the product image
- Position it below the category badge to avoid overlap
- Use a semi-transparent circular button for clean aesthetics

#### 2. Share Functionality
The share feature will work in two ways:

**On Mobile (using Web Share API):**
- Opens native share sheet (WhatsApp, Instagram, SMS, etc.)
- Shares product name, short description, and URL

**On Desktop (clipboard fallback):**
- Copies the product URL to clipboard
- Shows a toast notification confirming the copy

#### 3. URL Structure
The share URL will use the current website URL with a product ID query parameter:
```
https://the90minutedrip.lovable.app/?product={productId}
```

This way, when someone opens the link, it will load the homepage and can potentially deep-link to the product modal.

---

### Technical Details

#### File Changes: `src/components/ProductCard.tsx`

**New imports:**
- `Share2` icon from `lucide-react`
- `toast` from `sonner` for clipboard feedback

**New share handler function:**
```typescript
const handleShare = async (e: React.MouseEvent) => {
  e.stopPropagation();
  
  const shareUrl = `${window.location.origin}/?product=${product.id}`;
  const shareData = {
    title: product.productName,
    text: product.shortDescription || `Check out ${product.productName}`,
    url: shareUrl,
  };

  if (navigator.share && navigator.canShare(shareData)) {
    // Mobile: Use native share
    await navigator.share(shareData);
  } else {
    // Desktop: Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  }
};
```

**Share button UI:**
- Positioned in bottom-right of image area
- Circular button with white background and subtle shadow
- Responsive sizing: `w-7 h-7 sm:w-8 sm:h-8`
- Share2 icon with responsive sizing

```jsx
<button
  onClick={handleShare}
  className="absolute bottom-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
  aria-label="Share product"
>
  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
</button>
```

---

### Visual Layout

```text
+----------------------------------+
|  [Limited]        [Category]     |  <- Top badges
|                                  |
|       Product Image              |
|                                  |
|          SOLD OUT (if applicable)|
|                          [Share] |  <- Bottom-right share button
+----------------------------------+
|  Product Name                    |
|  Team                           |
|  Description...                 |
|  Price                          |
|  Sizes: [S] [M] [L] +2          |
+----------------------------------+
|  [View Availability Button]      |
+----------------------------------+
```

---

### Summary of Changes

| File | Changes |
|------|---------|
| `src/components/ProductCard.tsx` | Add Share2 import, add toast import, add handleShare function, add share button in image area |

