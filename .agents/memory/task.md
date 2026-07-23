# Task: Product Card Video Integration

## Overview
Enhance the user experience on the product gallery pages by adding a "Play Video" hover overlay button to each `ProductCard`. When clicked, this button will open a premium glassmorphic overlay modal containing an embedded video player. To support this feature, the system will sync a `videoUrl` property to product types, static constants, and live Firestore CMS mapping.

## Project Type
- **WEB** (React + TypeScript + Tailwind CSS)

## Success Criteria
1. **Types & Data Sync**: Add `videoUrl` (optional string) to the `Product` interface in [index.ts](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/types/index.ts) and map it in the Firebase CMS sync function inside [products.ts](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/constants/products.ts).
2. **Hover Overlay Button**: Create a premium glassmorphic hover overlay button (with a Play icon) centered or aligned on the `ProductCard` image. The button is only visible when the card or image is hovered.
3. **Video Overlay Modal**: Design and build a high-fidelity modal overlay that dims the background and centers a responsive video iframe/player.
4. **Lifecycle & Control**: Closing the modal (via close button, clicking the backdrop, or pressing Escape) must immediately unmount/close the player to ensure video audio does not continue playing in the background.

## Tech Stack
- **React** (v18+)
- **TypeScript**
- **Tailwind CSS** (v4 styling)
- **Lucide React** (icons)

## File Structure
- [src/types/index.ts](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/types/index.ts) (Types modification)
- [src/constants/products.ts](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/constants/products.ts) (Constants mapping)
- [src/components/features/ProductCard.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/features/ProductCard.tsx) (UI modification & Modal integration)

---

## Task Breakdown

### 1. Sync videoUrl to Types and Constants
- **Task ID**: `TASK-01`
- **Name**: Add `videoUrl` property to Product schema and mappings
- **Agent**: `database-architect`
- **Skills**: `clean-code`
- **Priority**: High
- **Dependencies**: None
- **INPUT**: 
  - `src/types/index.ts`
  - `src/constants/products.ts`
- **OUTPUT**:
  - `videoUrl?: string | null;` added to the `Product` interface.
  - `videoUrl: p.video_url || p.videoUrl || null` mapped in `syncLiveProducts`.
- **VERIFY**: Run type check `npx tsc --noEmit` to verify type safety.

### 2. Implement Play Video Hover Trigger
- **Task ID**: `TASK-02`
- **Name**: Add Play hover button to ProductCard image
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-design`
- **Priority**: High
- **Dependencies**: `TASK-01`
- **INPUT**: `src/components/features/ProductCard.tsx`
- **OUTPUT**: A rounded/glassmorphic "Play video" button containing a play icon appearing over the product image during group hover. The button is only displayed if `product.videoUrl` is present.
- **VERIFY**: Hover over the product image and confirm the Play button animates in smoothly with micro-interaction hover effects.

### 3. Build Video Modal Overlay
- **Task ID**: `TASK-03`
- **Name**: Create the video player overlay modal
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-design`
- **Priority**: High
- **Dependencies**: `TASK-02`
- **INPUT**: `src/components/features/ProductCard.tsx`
- **OUTPUT**: 
  - Modal component/state in `ProductCard` (or as a separate module).
  - Background overlay (`backdrop-blur-md bg-black/80`).
  - Secure iframe rendering for YouTube videos and raw mp4/web video URLs.
- **VERIFY**: Clicking the Play button launches the modal, centering the video, and scaling the container dynamically.

### 4. Interactive & Accessibility Controls
- **Task ID**: `TASK-04`
- **Name**: Setup modal close triggers and cleanup
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`
- **Priority**: Medium
- **Dependencies**: `TASK-03`
- **INPUT**: `src/components/features/ProductCard.tsx`
- **OUTPUT**:
  - Escape key listener, backdrop click-to-close handler, and explicit close button (`X` icon).
  - Component unmounting cleanup to terminate video playback.
- **VERIFY**: Open the video, click away or press Escape, and ensure the video stops playing and its sound stops instantly.

---

## Phase X: Final Verification

### Automated Checks
- [ ] **Type Check**: Run `npx tsc --noEmit` and resolve any type mismatches.
- [ ] **Lint Check**: Run `npm run lint` and verify there are no compilation warnings or errors.
- [ ] **Build Check**: Run `npm run build` to ensure production build completeness.

### Manual UX Check
- [ ] **Graceful Layout**: The overlay modal fits screens of all sizes (responsiveness).
- [ ] **Audio Stop**: Confirm audio stops playing immediately upon closing the modal.
- [ ] **Visual Theme**: Colors align with active theme conventions (no pure purple/violet).
