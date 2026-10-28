# Plan: Fix & Normalize Realtime Product Specifications Display

## Context & Problem Analysis
- **User Issue**: In the "Have the Ride of Your Life / Assembled for Performance" section (`BikeAssemblyAnimation.tsx`), switching models (e.g., to "Trip Cargo Trike") displays corrupted data:
  - **Max Range**: Shows `4060km` instead of `40–60 km` (or `40-60 km`).
  - **Top Speed**: Shows `4050km/h` instead of `40–50 km/h`.
  - **Frame / Brakes / Tires**: Hardcoded fallback values ("High-tensile Alloy", "Hydraulic Disc Brakes", "26" × 4.0" Fat Tires") display even when the product is a trike/scooter with different specifications.
- **Root Cause**:
  1. `getNumericValue` strips non-numeric characters using `valStr.replace(/[^0-9]/g, "")`, which strips hyphens and concatenates range numbers (e.g. `"40-60"` -> `"4060"`).
  2. `AnimatedCounter` expects a single numeric target and appends a static suffix, destroying range representations and custom units.
  3. Spec key mismatch: Firestore and Admin CMS save keys in varying formats (`range`, `Range`, `Max Range`, `topSpeed`, `top_speed`, `Max Speed`, `motor`, `Motor Power`, `payload`, `Load Capacity`, `frame`, `Frame Material`, `brakes`, `Brake System`, `tires`, `Tire Specifications`, `chargingTime`, `chargeTime`).
  4. Incomplete live synchronization and normalization across components (`BikeAssemblyAnimation`, `ProductCard`, `ProductDetailPage`, `ComparePage`, `QuoteModal`).

---

## Proposed Changes

### 1. Specification Normalization Engine (`src/utils/specs.ts` & `src/constants/products.ts`)
- Create a centralized specification parser and normalizer:
  - Supports ranges (e.g. `"40-60 km"`, `"40 - 50 km/h"`), single numbers (`"800W"`, `"310 kg"`), and text values.
  - Safely extracts numeric bounds for progress bar percentages without corrupting display text.
  - Provides case-insensitive and alias-aware lookup (`getSpec(specs, 'range')`, `getSpec(specs, 'topSpeed')`, etc.).
- Update `syncLiveProducts` in `src/constants/products.ts` to normalize all incoming CMS specs while preserving full original key-value pairs.

### 2. Live Engineering Showcase Fix (`src/components/features/BikeAssemblyAnimation.tsx`)
- Fix the animated counter / display logic:
  - For range specs (e.g. `"40–60 km"`), animate or count smoothly to the target or display the exact formatted live string without stripping hyphens.
  - Correct progress bar percentage calculations using the upper bound of the parsed range.
  - Dynamically load live spec details (Frame, Brakes, Tires, Battery, etc.) directly from `activeProduct.specs` instead of static fallbacks.
  - Update Real-World Benefits (CO2, Charge Time) based on the live normalized battery and range specs.

### 3. Consistency Across Product Views
- **`src/components/features/ProductCard.tsx`**:
  - Use the normalized spec accessor so that Motor, Battery, Range, Top Speed, and Payload always display real live values without "N/A" or partial strings.
- **`src/pages/ProductDetailPage.tsx`**:
  - Update quick spec bar and specifications table to render all live specs cleanly and dynamically.
- **`src/pages/ComparePage.tsx`**:
  - Ensure side-by-side comparison keys match live product spec entries consistently.

---

## Execution Team (Orchestration - Phase 2)
1. **`project-planner`**: Specification architecture & task coordination.
2. **`debugger` / `database-architect`**: Root cause resolution, spec parser, and Firestore CMS normalization.
3. **`frontend-specialist`**: Component UI updates (`BikeAssemblyAnimation.tsx`, `ProductCard.tsx`, `ProductDetailPage.tsx`).
4. **`test-engineer`**: End-to-end verification, type checks, and build validation.

---

## Verification Plan
- [ ] Verify `BikeAssemblyAnimation` displays `"40–60 km"` and `"40–50 km/h"` correctly for "Trip Cargo Trike".
- [ ] Verify tab switching between all live models updates metrics, progress bars, and specifications dynamically.
- [ ] Verify no hardcoded bike fallback specs leak into scooters or trikes.
- [ ] Verify `ProductCard`, `ProductDetailPage`, and `ComparePage` render live specs consistently.
- [ ] Run `npx tsc --noEmit` and `npm run build` to confirm zero regressions.
