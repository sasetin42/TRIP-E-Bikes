# Plan: Fix Header, Footer, and Live Chat Logo fallback to Main Logo

## Goal
Copy the uploaded logo to the project assets folder and update the Header (`Navbar.tsx`), Footer (`Footer.tsx`), and `LiveChat.tsx` components to render this local logo image as the default fallback when the dynamic settings (`settings?.brand_logo_main`) are not configured.

---

## Tasks

- [x] **Task 1: Setup Local Asset**
  - **Action**: Copy the uploaded logo from `C:\Users\User\.gemini\antigravity\brain\7eb5bec0-f94d-4efc-809a-e3d7f64c66c2\media__1784566743055.png` to the project's assets directory as `src/assets/logo-main.png`.
  - **Verification**: Check that `src/assets/logo-main.png` exists and is a valid PNG image.

- [x] **Task 2: Update Navbar Component**
  - **Action**: In [Navbar.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/layout/Navbar.tsx), import `logoMain` from `@/assets/logo-main.png` and update the brand link fallback:
    - If `settings?.brand_logo_main` is not configured, render `logoMain` instead of the text/icon logo.
  - **Verification**: Verify that importing does not cause build errors.

- [x] **Task 3: Update Footer Component**
  - **Action**: In [Footer.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/layout/Footer.tsx), import `logoMain` from `@/assets/logo-main.png` and update the logo fallback:
    - If `settings?.brand_logo_main` is not configured, render `logoMain` instead of the text/icon logo.
  - **Verification**: Verify that importing does not cause build errors.

- [x] **Task 4: Update LiveChat Component**
  - **Action**: In [LiveChat.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/features/LiveChat.tsx), import `logoMain` from `@/assets/logo-main.png` and update the logo fallback in both the header and the welcome screen:
    - If `settings?.brand_logo_main` or `settings?.brand_logo_dark` are not configured, render `logoMain` instead of the default `Zap` and `Bot` icons.
  - **Verification**: Verify that importing does not cause build errors.

- [x] **Task 5: Execute UX and Verification Audits**
  - **Action**: Run the local dev server and perform verification. Run visual audits to verify responsive styles and correct sizing of the new logo fallback.
  - **Verification**: Execute `python .agents/skills/frontend-design/scripts/ux_audit.py` (or relevant checklist/validation scripts) to verify the UI.

---

## Required Subagents for Implementation / Orchestration

To execute this plan successfully, we will coordinate the following 3 specialist subagents:
1. **Asset Manager Agent (`asset-manager`)**: Responsible for file copies, verifying asset paths, checking resolution, and placing the new main logo into the appropriate assets folder.
2. **Frontend Developer Agent (`frontend-specialist`)**: Responsible for importing and rendering the local fallback logo in [Navbar.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/layout/Navbar.tsx), [Footer.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/layout/Footer.tsx), and [LiveChat.tsx](file:///c:/Users/User/OneDrive/Desktop/SASE%20PROJECT/TRIP%20E-BIKES/TRIP%20E-Bikes%20App/src/components/features/LiveChat.tsx).
3. **QA & Auditing Agent (`quality-assurer`)**: Responsible for running the dev server, launching visual validation, performing UX/accessibility checks via scripts, and verifying fallback behavior in each viewport.

---

## Success Criteria

1. **Local Asset Availability**: `logo-main.png` resides in `src/assets/` and is fully referenced via absolute/relative import.
2. **Default Fallback Rendering**: When system settings do not provide a main brand logo URL, the header, footer, and chat widget render the high-quality local `logo-main.png`.
3. **No Dynamic Layout Breaks**: Logo maintains appropriate sizing, correct constraints (`object-contain`), and transitions cleanly.
4. **Clean Build**: The React/TypeScript project builds successfully without import or type errors.
