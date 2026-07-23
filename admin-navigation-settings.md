# Navigation Pages Toggle Feature

This document outlines the plan to implement functional toggle switches in the Admin Panel's System Settings, allowing the administrators to enable or disable navigation pages (Products, Compare, Industries, Financing, About, Service, Blog).

## User Review Required
> [!IMPORTANT]
> The toggles will be added under the existing **Feature Gates** tab in the System Settings, as they fit the description of enabling/disabling app features.
> If a page is disabled, it will disappear from both the Desktop and Mobile navigation menus in the header.
> Please let me know if you would prefer a dedicated "Navigation" tab in the system settings instead of adding them to the Feature Gates tab.

## Proposed Changes

### Component Changes

#### [MODIFY] `src/pages/admin/AdminSystemSettings.tsx`
- Expand the fallback data (used when merging Firestore/API data) to include settings for each navigation item:
  - `nav_products_enabled`
  - `nav_compare_enabled`
  - `nav_industries_enabled`
  - `nav_financing_enabled`
  - `nav_about_enabled`
  - `nav_service_enabled`
  - `nav_blog_enabled`
  - `nav_book_service_enabled` (optional, for the CTA)
- Add new icon mappings for these keys in `FEATURE_ICONS` (e.g., using `Compass`, `FileText`, `Briefcase` from `lucide-react`).
- Set their default fallback values to `true`.

#### [MODIFY] `src/components/layout/Navbar.tsx`
- Update the `NAV_LINKS` array to include the corresponding `settingKey`.
- Filter the `NAV_LINKS` array dynamically using the `settings` object fetched from the existing `useSystemSettings` hook.
- If a setting is set to `false`, the link will not be rendered in the header or mobile menu.

## Verification Plan

### Manual Verification
- Go to the Admin Panel -> System Settings -> Feature Gates.
- Toggle various navigation items (e.g., disable "Products" and "Blog").
- Save changes.
- Visit the public-facing site and verify that the "Products" and "Blog" links are no longer visible in the Navbar (both desktop and mobile menus).
