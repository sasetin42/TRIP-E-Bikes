# Plan: Add Admin Customers Page

## Goal
Add a dedicated "Customers" management page under the admin panel route `/admin/customers` that displays a list of all registered customer accounts with their complete details (avatar, name, email, date of birth, registration/activity date), search features, and action buttons.

## Analysis
- **Navigation Menu Link**: Needs to be registered in `src/pages/admin/AdminLayout.tsx` within the `NAV_ITEMS` array. We will use the `User` icon from `lucide-react`.
- **Routing**: Needs to be defined in `src/App.tsx` within the protected admin routes sub-hierarchy as `<Route path="customers" element={<AdminCustomers />} />`.
- **Database Query**: Read-time sync or one-off fetch from the `profiles` collection in Firestore. Since the rules allow `isAdmin()` to read all profiles, we can fetch all or query where `role == 'customer'`.
- **Component UX & Styling**: Follow the existing dark cyber-neon glass panel theme (using background colors like `#070707`, `#0D0D0D`, border styling, and `#39FF14` accent colors). It should render a responsive, clean table view with search functionality, detail modals, and standard styling handles.

## Tasks

### Phase 1: Route & Navigation Registration
- [ ] **Task 1.1**: Register the route in `src/App.tsx`
  - Path: `/admin/customers`
  - Component: Import `AdminCustomers` dynamically/statically and set it as the element for `<Route path="customers" element={<AdminCustomers />} />` under `<Route path="/admin" element={<AdminLayout />}>`.
- [ ] **Task 1.2**: Register navigation item in `src/pages/admin/AdminLayout.tsx`
  - In `NAV_ITEMS`, add:
    ```typescript
    { icon: User, label: "Customers", href: "/admin/customers" }
    ```
  - Verify that the `User` icon is already imported from `lucide-react`.

### Phase 2: Page Component Creation
- [ ] **Task 2.1**: Create `src/pages/admin/AdminCustomers.tsx`
  - Set up Firestore listeners/fetchers for the `profiles` collection where `role == 'customer'`.
  - Render a clean table in cyber-neon styling.
  - Display:
    * Avatar: Circular avatar, falling back to name initials if none is uploaded.
    * Name: Customer username.
    * Email: Registered email.
    * Date of Birth: Format DOB elegantly if present.
    * Date Registered / Last Active: Display timestamps.
  - Implement a search bar to filter client-side (or server-side) by Name or Email.
  - Action buttons: "View Details" (modal with complete info) and "Delete Profile" (with safety confirmation toast).

### Phase 3: Verification & Build
- [ ] **Task 3.1**: Run TypeScript and Lint Checks
  - Command: `npm run lint` or `npx tsc --noEmit`
- [ ] **Task 3.2**: Execute Production Build
  - Command: `npm run build`
- [ ] **Task 3.3**: Verify route access and rendering in the browser.

## Done When
- [ ] Navigating to `/admin/customers` loads the list of profiles where `role === 'customer'`.
- [ ] The search bar correctly filters results by name or email.
- [ ] Action buttons function as expected (modal open/close and confirmation dialogs).
- [ ] Production build succeeds without errors.
