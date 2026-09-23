# Plan: Fix FAQ Loading and Styling

This plan details the steps to investigate and completely resolve the issue causing the FAQs tab in the Content Management admin panel to hang, spin indefinitely, or display a broken "+ Add FAQ" button.

## Proposed Changes

### Phase 1: Diagnostics and Verification
- Inspect the browser console logs to ensure no Firebase Permission Denied errors or missing index errors are occurring on the `faqs` collection.
- Check why the `+ Add FAQ` button styling has a broken layout (white background block, misaligned green plus icon).

### Phase 2: Implementation of Fixes
1. **FAQ Loading Logic**: Verify that our previous implementation (using one-time `getDocs` query on mount to check for empty state, then subscribing to `onSnapshot`) is fully compiled and active.
2. **Button Styling**: Fix the CSS or Tailwind/inline styles for the "+ Add FAQ" button in `AdminContent.tsx` to align with the rest of the dark admin theme.
3. **Seeding Guard**: Ensure the seeding process is robust against concurrent execution.

### Phase 3: Testing & Verification
- Compile and run production build.
- Test document additions and deletions.

## Verification Plan
- Execute `npm run build` to ensure the project compiles successfully.
- Verify through manual check that the spinner resolves and FAQs load correctly.
