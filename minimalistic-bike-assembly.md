# Plan: Minimalistic Bike Assembly Animation Redesign

## Objective
Redesign `src/components/features/BikeAssemblyAnimation.tsx` to match the main brand styles (minimalistic, clean, monochrome/subtle accents) and remove the heavy gamer-like neon green accents and borders.

## Steps

### 1. Remove Neon Grid Background
- Locate the container with the `background-image: linear-gradient...` neon grid.
- Remove these background properties to create a clean, solid, or subtle gradient background that aligns with the brand.

### 2. Update Typography
- Find and replace all instances of the `font-orbitron` class.
- Replace with the standard `Inter` or sans-serif font class used across the brand.

### 3. Remove Neon Accents
- Locate all `#39FF14` neon green text colors, border colors, and drop shadows.
- Replace these with clean white/black colors, or use the subtle `#00B074` brand accent where appropriate.

### 4. Redesign Performance Metrics and Cards
- Locate the performance metrics (bars) and the "Real-World Benefits" card.
- Remove heavy borders and glowing effects.
- Apply minimalistic borders, such as `border-white/10`.
- Ensure typography inside these elements is clean and readable.

### 5. Remove Specific Extraneous Classes
- Remove the `neon-trail-border-container` wrapper or class.
- Remove the `gradient-text` class, replacing it with solid text colors that match the brand guidelines.
