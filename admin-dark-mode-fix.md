# Admin Panel Dark Mode Fix Plan

## Goal Description
The Admin Panel currently has readability and design issues because several components (especially cards and panels) use the global `.glass` CSS class. The `.glass` class is defined in `index.css` with a highly opaque white background (`rgba(255, 255, 255, 0.95)`), which is intended for the light-mode public website but clashes with the dark-mode layout of the Admin Panel. 

This plan will replace the `.glass` class in all admin pages with dark-mode native Tailwind utility classes (e.g., `bg-white/5 backdrop-blur-md` or `bg-white/2`) to ensure completely readable and consistent dark styling across all admin pages.

## User Review Required
> [!IMPORTANT]
> This change will modify the background styling of cards, panels, and dropdowns across all 18+ admin pages to make them uniformly dark and readable. Please review the plan below to ensure it aligns with your expectations.

## Proposed Changes

### `src/pages/admin/` (All Admin Components)

We will use a bulk text replacement to target the `glass` class exclusively within the `src/pages/admin` directory, ensuring the public-facing website is untouched.

- Replace instances of `glass` in className strings with `bg-white/5 backdrop-blur-md` across all Admin pages.
- We will do a full sweep of all files in `src/pages/admin/` to remove the `glass` class and inject appropriate dark-mode background and blur utility classes.

### Additional Fixes
- We will review specific pages (like `AdminDashboard.tsx`, `AdminProducts.tsx`, `AdminAnalytics.tsx`) to ensure no hardcoded `bg-white` or `bg-gray-50` classes are breaking the dark layout for main structural containers.

## Verification Plan

### Manual Verification
- Start the development server and navigate through the Admin Panel.
- Verify that the Dashboard, Analytics, Products, and other main pages render with dark cards and legible text.
- Verify that the main customer-facing website still retains its light mode `.glass` styling.
