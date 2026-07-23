# Hide Price and Stock Details

The objective is to completely remove all references to product prices ("STARTING AT") and stock availability ("IN STOCK") across the product components.

## Proposed Changes

### `src/components/features/ProductCard.tsx`
- **[MODIFY]** Remove the `Price + Stock` section block (lines 230-245). This will completely eliminate the price display and the stock status badge from the grid/list cards on the Home and Products pages.

### `src/pages/ProductDetailPage.tsx`
- **[MODIFY]** Remove the stock indicator badge overlaid on the main product image (lines 263-268).
- **[MODIFY]** Remove the `Target Price` display block (lines 385-390) from the custom specs/pricing section, leaving only the warranty and servicing guarantees in the box, or restructuring the box to look balanced without the price.

## User Review Required
- Please review if you want to keep the warranty/servicing guarantees box in the Product Detail page without the price, or if we should completely remove that box or re-align its contents. 
- Do you approve this plan to proceed with the code changes?
