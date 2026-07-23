# Change Logo to Dark Theme Logo

## Goal
Update all dark-themed layouts (Navbar.tsx, ProtectedAdminRoute.tsx, AdminLayout.tsx, AdminLogin.tsx) to strictly render the dark theme logo (`settings.brand_logo_dark`) with a fallback to `settings.brand_logo_main` (and default text/vector fallback), ensuring the logo fits the layouts perfectly under all layout states.

## Tasks
- [ ] Task 1: Update Navbar logo rendering logic in `src/components/layout/Navbar.tsx` to use `settings.brand_logo_dark || settings.brand_logo_main` and ensure `className="h-10 w-auto object-contain"` is applied to fit without clipping.
- [ ] Task 2: Update Admin verification loader in `src/components/layout/ProtectedAdminRoute.tsx` to strictly use `settings.brand_logo_dark || settings.brand_logo_main`.
- [ ] Task 3: Improve Sidebar logo rendering in `src/pages/admin/AdminLayout.tsx`. When the sidebar is collapsed (`sidebarOpen === false`), use `settings.brand_favicon` (if available) or the Zap icon fallback instead of squeezing the wide landscape logo into a tiny square. When open, ensure the dark logo uses `h-11 w-auto object-contain` with proper padding.
- [ ] Task 4: Update Admin Login screen in `src/pages/admin/AdminLogin.tsx` to strictly use `settings.brand_logo_dark || settings.brand_logo_main` with correct responsive scaling.

## Done When
- [ ] The dark theme logo (`settings.brand_logo_dark`) renders correctly in all specified layouts.
- [ ] If `brand_logo_dark` is missing, `brand_logo_main` renders as a fallback.
- [ ] If both are missing, the clean vector Zap icon and text layout renders as the final fallback.
- [ ] The collapsed admin sidebar displays the favicon/icon instead of a squished wide logo.

## Verification
- [ ] Run typescript checks to ensure compilation succeeds.
- [ ] Inspect pages in the browser and verify the logo fits perfectly on all breakpoints.
