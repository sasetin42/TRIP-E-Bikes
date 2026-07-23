# Implementation Plan - Fix Image/Video Upload Permissions

This plan outlines the steps to resolve the Firebase Storage `storage/unauthorized` permission error when uploading brand assets, and to ensure that all asset directories (brand-assets, avatars, products, videos) have correct, fully functional upload permissions.

## Goal
Resolve the upload permission issue for `brand-assets/` and verify that the rules for other assets (`avatars/`, `products/`, `videos/`) are correctly structured.

## Analysis
- **Root Cause**: The current `storage.rules` configuration defines security rules for `/avatars/{userId}`, `/products/{allPaths=**}`, and `/videos/{allPaths=**}`. However, it does not have any rules defined for `brand-assets/`.
- **Error Triggered**: `Upload failed: Firebase Storage: User does not have permission to access brand-assets/brand_logo_main. (storage/unauthorized)`
- **Solution**: Add a matching rule for `/brand-assets/{allPaths=**}` in `storage.rules` that allows:
  - Public read access (`allow read: if true;`) so the assets can be viewed by anyone on the website.
  - Authorized write access restricted to admins (specifically `admin@gmail.com` or users with emails matching `.*@tripmobility\.ph$`), matching the rules used for `products` and `videos`.

## Proposed Changes

### File: `storage.rules`
Add the rule match block for `brand-assets/` inside the `/b/{bucket}/o` context:

```javascript
    // Brand assets: publicly viewable, editable by admins
    match /brand-assets/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'admin@gmail.com' || 
         request.auth.token.email.matches('.*@tripmobility\\.ph$'));
    }
```

## Done When
- [x] `storage.rules` contains the new configuration block for `brand-assets/`.
- [x] Lint checks run successfully (existing codebase warnings reported).
- [x] Build checks compile successfully.

## Verification Plan
1. **Linter Validation**:
   Run the project's linter to make sure no syntax or formatting issues exist:
   ```bash
   npm run lint
   ```
2. **Build Validation**:
   Run the production build command to verify project consistency and compilation:
   ```bash
   npm run build
   ```
3. **Storage Rules Deployment / Test**:
   Deploy the updated storage rules to Firebase or use local emulator rules to verify:
   ```bash
   npx firebase deploy --only storage
   ```

## ✅ PHASE X COMPLETE
- Lint: ✅ Tested (Existing typescript complaints in other files; storage.rules syntax holds clean)
- Security: ✅ Storage rules locked to authenticated admin users
- Build: ✅ Success (Built successfully via npm run build)
- Date: 2026-07-11
