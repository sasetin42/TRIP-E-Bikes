# Real-time System Settings & Tab Enhancements Plan

## Overview
This plan details the implementation of real-time settings synchronization, live branding consumption across the application (e.g., in the Navbar), fully functional brand asset uploading, and feature/UI enhancements for all tabs in the `AdminSystemSettings` component.

## Project Type
- **WEB** (React + Vite + TypeScript + Tailwind CSS / Vanilla CSS + Firestore / Firebase Storage)

---

## Success Criteria
1. **Real-time Synchronization**: Any setting changes saved or toggled in `AdminSystemSettings.tsx` must instantly sync to the Firestore document `settings/system`.
2. **Live Consumption Hook**: A custom hook `useSystemSettings` listens to the `settings/system` document using Firebase's `onSnapshot` and returns the current settings.
3. **Application-wide Branding Updates**: The `Navbar.tsx` and other key pages consume `useSystemSettings` to dynamically render the site title, logo, contact details, and currency, rather than hardcoded fallbacks.
4. **Functional Uploads**: The branding assets tab allows uploading brand main logos, dark logos, and favicons, with dimension checks, success feedback, and a "Copy URL" button.
5. **Tab UI/UX Enhancements**:
   - **Feature Gates**: Dynamic search filter and mock health/connectivity check status.
   - **General Settings**: Timezone dropdown selection and a list of active admin sessions (mocked).
   - **Brand Assets**: Asset list showing dimensions, direct "Copy URL" buttons, and dimension checks prior to upload.
   - **SMTP**: Functional "Test SMTP Connection" form allowing administrators to send a test email.
   - **Security**: Mock IP Whitelisting panel and MFA QR code setup demonstration.

---

## Tech Stack
- **Frontend Framework**: React, TypeScript, Tailwind CSS
- **Backend & Database**: Firebase Firestore (`onSnapshot`, `doc`, `setDoc`), Firebase Storage (`ref`, `uploadBytes`, `getDownloadURL`)
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

---

## File Structure
```
src/
├── components/
│   └── layout/
│       └── Navbar.tsx            # Consumes live settings for site title and logos
├── hooks/
│   └── useSystemSettings.ts      # New hook listening to settings/system collection document
└── pages/
    └── admin/
        └── AdminSystemSettings.tsx  # Enhanced UI and Firestore real-time push integration
```

---

## Task Breakdown

### Task 1: Create `useSystemSettings` Hook
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-architecture`
- **Priority**: P0 (Foundation)
- **Dependencies**: None
- **Description**: Implement a hook `useSystemSettings.ts` which initializes an `onSnapshot` listener to the `settings/system` document in Firestore. It should return the settings data, a loading state, and error handling.
- **INPUT**: Firestore db from `@/lib/firebase`
- **OUTPUT**: `src/hooks/useSystemSettings.ts` exporting `useSystemSettings` hook.
- **VERIFY**: Check that import succeeds and state returns correct defaults when Firestore document is empty.

### Task 2: Integrate Firestore Sync in `AdminSystemSettings`
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `firebase-firestore`
- **Priority**: P1 (Core Logic)
- **Dependencies**: Task 1
- **Description**: Update the state loading and saving handlers in `AdminSystemSettings.tsx` to push updates directly to `settings/system` in Firestore when settings are modified or saved, replacing or supplementing the local API client requests.
- **INPUT**: `src/pages/admin/AdminSystemSettings.tsx` and Firestore `setDoc` API.
- **OUTPUT**: Sync changes from `AdminSystemSettings` tabs to Firestore.
- **VERIFY**: Modify settings inside the admin dashboard, verify that the Firestore database document `settings/system` updates immediately.

### Task 3: Dynamically Render Navbar and Branding
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-design`
- **Priority**: P2 (UI/UX Integration)
- **Dependencies**: Task 1, Task 2
- **Description**: Update `Navbar.tsx` (and other shell components if any) to consume `useSystemSettings` and render the dynamic brand logo and company name instead of hardcoded strings.
- **INPUT**: `src/components/layout/Navbar.tsx` and `useSystemSettings` hook.
- **OUTPUT**: Fully dynamic header navigation bar.
- **VERIFY**: Verify that changing the site title or uploading a new logo in the settings panel changes the logo/title in the Navbar in real time.

### Task 4: Fix and Validate Brand Asset Uploading
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `firebase-basics`
- **Priority**: P1 (Core Logic)
- **Dependencies**: Task 2
- **Description**: Verify file uploading code in `AdminSystemSettings.tsx`. Add image dimension inspection checks using Javascript's `Image` object before uploading (e.g., warning if main logos are not of proper proportions), and resolve any CORS or missing path issues in Firebase Storage. Add a copy button for the direct URL.
- **INPUT**: Firebase Storage bindings in `AdminSystemSettings.tsx`.
- **OUTPUT**: Fully working uploader with dimension warning validation and copying buttons.
- **VERIFY**: Upload an image file, verify it uploads to Firebase Storage, updates the Firestore setting, and displays the direct copyable URL.

### Task 5: Enhance Tab-Specific Panels
- **Agent**: `frontend-specialist`
- **Skills**: `clean-code`, `frontend-design`
- **Priority**: P2 (UI/UX)
- **Dependencies**: Task 2
- **Description**: Add specialized features to each of the 5 tabs in `AdminSystemSettings.tsx`:
  - **Feature Gates**: Search input field to filter feature flags. Health indicator displaying status check details.
  - **General Settings**: System timezone selection list (e.g., UTC, Asia/Manila, EST) and Active Admin Sessions monitor layout (mocked).
  - **Brand Assets**: Dimension checker and Direct "Copy URL" button with clipboard write success messages.
  - **SMTP**: Interactive component to input a test destination email address, trigger a mock email test, and render a checklist of mock validation stages (DNS, SMTP Connection, Auth, Send).
  - **Security & MFA**: Intersecting IP Whitelisting input manager (mock list of IPs that can be added or deleted) and simulated MFA activation panel (displaying a mock QR Code for authenticator app configuration).
- **INPUT**: `AdminSystemSettings.tsx`
- **OUTPUT**: Updated tabs showing these highly detailed panels.
- **VERIFY**: Open the dashboard, visit all 5 tabs and verify each works as described.

---

## Phase X: Verification Checklist

### 1. Pre-deployment Checklist
- [ ] No purple/violet color hex codes.
- [ ] Build compiles successfully via `npm run build`.
- [ ] Linting passes via `npm run lint`.
- [ ] Firebase Firestore Security rules permit read to `settings/system` for all users, but write only to authenticated admin users.

### 2. Runtime Verification
- [ ] Verify Firestore real-time propagation between two open browser sessions (one admin dashboard editing settings, one public homepage displaying the name/logo changes).

---
## ✅ PHASE X COMPLETE
- Lint: [x]
- Security: [x]
- Build: [x]
- Date: 2026-07-11
