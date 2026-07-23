# Implementation Plan: Product Detail & Admin Backend Enhancements

🤖 **Applying knowledge of `@[project-planner]`...**  
📚 **Using skill: `@[plan-writing]`...**

---

## 1. Overview
This plan details the implementation of several product page enhancements and admin backend improvements for the TRIP E-Bikes application. The changes span UI styling refinements, user-profile interaction sync with Firestore, and support for document uploads in the admin product catalog.

## 2. Project Type
* **Type**: `WEB` (Vite, React, TypeScript, Tailwind CSS, Firestore, Firebase Storage)
* **Primary Agent**: `@frontend-specialist` (UI/UX layout and interactions), `@backend-specialist` (Firestore syncing and file upload handling)

---

## 3. Success Criteria
* **Sticky Left Column**: The product image + key specs column remains visible/sticky on large screens (`lg`) during scrolling.
* **Price Block Polish**: Pricing card is more compact, uses premium gradients/borders, and does not show the monthly installment or financing text.
* **Favorites Sync**: Logged-in users can click "Add to Favorites", which toggles and persists the product key in their `profiles/{uid}` document under a `favorites` array in Firestore. Guests clicking "Add to Favorites" are prompted to sign in via `CustomerAuthModal`.
* **Colorful Solid Buttons**: The "Download Brochure" and "Share" buttons have solid, vibrant backgrounds replacing the muted outline/transparent styles.
* **Brochure Upload**: Admins can upload a PDF brochure in `AdminProducts.tsx` which uploads to Firebase Storage, updates the `brochure_url` field in Firestore, and lets users download it via the detail page button.
* **Glowing Neon Borders**: Active color selection buttons animate with a 2px rotating glowing neon trail.

---

## 4. Tech Stack & Decisions
* **UI styling**: Tailwind CSS, CSS animations (for neon border trail).
* **State & Sync**: React state, Firestore `profiles` and `products_cms` collections, Firebase Storage (`/brochures/{product_key}.pdf`).
* **Authentication**: Firebase Authentication (checks customer auth status via `useCustomerAuth`).

---

## 5. Affected Files & Directory Layout
* `src/types/index.ts` - Add `brochureUrl?: string;` property to `Product` interface.
* `src/constants/products.ts` - Sync `brochure_url` from Firestore data in `syncLiveProducts`.
* `src/pages/ProductDetailPage.tsx` - Implement Sticky container, Price redesign, Favorites sync, Solid buttons, and Neon color selector border.
* `src/pages/admin/AdminProducts.tsx` - Add brochure upload input, storage integration, and save/load logic.

---

## 6. Task Breakdown

### Task 1: Type Definitions & Database Sync Mapping
* **Agent**: `@backend-specialist`
* **Skill**: `clean-code`
* **Priority**: P0
* **Dependencies**: None
* **Description**: Extend product models and constants to support `brochure_url`.
* **INPUT**: `src/types/index.ts` and `src/constants/products.ts`
* **OUTPUT**: Updated TypeScript interfaces and mapping function.
* **VERIFY**: No compilation errors on type check.

---

### Task 2: Admin Product Brochure Upload Field
* **Agent**: `@backend-specialist`
* **Skill**: `database-design`
* **Priority**: P1
* **Dependencies**: Task 1
* **Description**: Add a file picker field for PDF brochure in the Edit/Add Product modal of `AdminProducts.tsx`. Handle uploading to Firebase Storage and updating `brochure_url`.
* **INPUT**: `src/pages/admin/AdminProducts.tsx`
* **OUTPUT**: File upload field integrated into the admin form, saving URL to database.
* **VERIFY**: Upload a PDF and check that `brochure_url` is successfully saved to the `products_cms` document.

---

### Task 3: Sticky Column & Redesigned Price Card
* **Agent**: `@frontend-specialist`
* **Skill**: `frontend-design`
* **Priority**: P2
* **Dependencies**: None
* **Description**:
  1. Wrap the left-hand column inside `ProductDetailPage.tsx` in a sticky-enabled wrapper (`lg:sticky lg:top-28`).
  2. Redesign the pricing card: remove monthly financing text, reduce spacing/padding, and style with a premium glassmorphic/border look.
* **INPUT**: `src/pages/ProductDetailPage.tsx`
* **OUTPUT**: Sticky column layout and redesigned price block.
* **VERIFY**: Scroll down the page and confirm the left column floats correctly. Confirm pricing card layout matches the design requirements.

---

### Task 4: Favorites Sync Integration
* **Agent**: `@frontend-specialist` / `@backend-specialist`
* **Skill**: `firebase-firestore`
* **Priority**: P1
* **Dependencies**: None
* **Description**: Hook up "Add to Favorites" button to read/write from Firestore `profiles/{uid}.favorites` array. Handle guest redirection to login.
* **INPUT**: `src/pages/ProductDetailPage.tsx`
* **OUTPUT**: Working favorites toggle with icon reflection (solid/hollow heart) and database sync.
* **VERIFY**: Login as a customer, click favorite, check Firestore database to verify the array includes the product ID. Verify icon states.

---

### Task 5: Colorful Solid Action Buttons
* **Agent**: `@frontend-specialist`
* **Skill**: `frontend-design`
* **Priority**: P2
* **Dependencies**: Task 2
* **Description**: Redesign "Download Brochure" and "Share" buttons to use solid, vibrant background colors. Bind the download brochure button to the product's `brochureUrl`.
* **INPUT**: `src/pages/ProductDetailPage.tsx`
* **OUTPUT**: High-contrast styled action buttons with functional brochure downloads.
* **VERIFY**: Clicking the button downloads the uploaded PDF or shows a toast if no brochure is available.

---

### Task 6: Glowing Neon Border Trail on Selected Colors
* **Agent**: `@frontend-specialist`
* **Skill**: `frontend-design`
* **Priority**: P2
* **Dependencies**: None
* **Description**: Style the selected color option button in `ProductDetailPage.tsx` with a rotating gradient border (2px trail).
* **INPUT**: `src/pages/ProductDetailPage.tsx`, custom CSS in `src/index.css` if needed.
* **OUTPUT**: Glowing border effect on active select state.
* **VERIFY**: Visually confirm neon rotation animation is smooth and conforms to style rules.

---

## 7. Phase X: Verification Checklist
Before submitting, the following steps must be completed:
- [ ] TypeScript check compiles successfully (`npx tsc --noEmit`)
- [ ] Run application build to ensure no bundle errors (`npm run build`)
- [ ] Run standard security and lint checks
- [ ] Check color contrast compliance on redesigned buttons and price card
- [ ] Perform local browser walkthrough and verify functionality in real-time

---

## 8. Socratic Gate & Edge-Case Questions for the User
Before coding, please confirm your preferences on the following:
1. **Brochure Upload Size & Type**: Should we restrict the brochure field strictly to `.pdf` files, or allow any document type (`.doc`, `.docx`, `.pdf`)?
2. **Missing Brochure Behavior**: If a product has no brochure uploaded, should we disable/hide the "Download Brochure" button, or keep it visible and show a helpful Toast notification when clicked?
3. **Favorites Sync Guest Prompt**: When a guest user clicks "Add to Favorites", we will open the login modal. If they successfully log in, should we automatically add that product to their favorites list immediately, or let them click it again?
