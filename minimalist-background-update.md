# Task Plan: Update Bike Assembly Animation Background

## Objective
Change the background image in `BikeAssemblyAnimation.tsx` from the overly busy `sustainability-bg.jpg` to a more robust, minimalistic, and related image.

## Steps

### Phase 1: Image Selection
1. **Target Image Chosen:**
   - Based on the available assets in `src/assets`, the target replacement image is `particle-bg.jpg` (or alternatively, `admin-bg.jpg`). These provide a cleaner, more minimalistic backdrop suitable for the animation.

### Phase 2: Code Implementation
1. **Update `BikeAssemblyAnimation.tsx`:**
   - Locate the `BikeAssemblyAnimation.tsx` file in the project.
   - Change the import statement from `import bgImage from '@/assets/sustainability-bg.jpg'` (or similar) to import `particle-bg.jpg`.
   - Update the relevant `<img src={...} />` or background-image style to use the new reference.
2. **Ensure Text Legibility (Crucial):**
   - Verify that the dark overlay (e.g., an element with a dark background color and opacity, or CSS gradient) covering the background image is retained.
   - Ensure that any text overlaid on the animation remains highly legible against the new minimalistic background. Adjust overlay opacity slightly if the new image necessitates it.

### Phase 3: Verification
1. **Visual Check:**
   - Run the application locally or check the component preview to confirm the new background looks robust and minimalistic.
   - Confirm that the dark overlay is effectively maintaining text contrast.
