# Fix Storage and Firestore Security Rules for Role-Based Admin Checks

## Goal
Resolve the storage upload permission error ("Failed to upload TRIP E-Bikes Video 001.mp4: Missing or insufficient permissions") by updating Firestore and Storage security rules to support role-based admin checks (checking if the user profile document in Firestore `profiles/{uid}` has `role == 'admin'` or `role == 'super_admin'`).

## Tasks
- [ ] Task 1: Update `firestore.rules` helper `isAdmin()` to check if the user profile document at `profiles/{uid}` has a `role` of either `'admin'` or `'super_admin'`, in addition to the existing email checks.
  → Verify: Local syntax validation of `firestore.rules`.
- [ ] Task 2: Update `storage.rules` helper functions (or define a new `isAdmin()` helper) to perform a cross-service Firestore check verifying if the profile document at `/databases/(default)/documents/profiles/$(request.auth.uid)` has a `role` of either `'admin'` or `'super_admin'`, in addition to existing email checks. Apply this helper to the write rules for `/products`, `/brand-assets`, `/videos`, and `/media`.
  → Verify: Local syntax validation of `storage.rules`.
- [ ] Task 3: Deploy/update the security rules using the Firebase CLI commands and verify they pass the rules compiler.
  → Verify: Run the firebase deployment commands or tests.

## Done When
- [ ] Both `firestore.rules` and `storage.rules` have been updated to check for Firestore `profiles/{uid}` role values ('admin' and 'super_admin').
- [ ] Uploading `TRIP E-Bikes Video 001.mp4` by an authenticated admin/super_admin is successful without any "Missing or insufficient permissions" error.

## Proposed Code Changes

### firestore.rules
```diff
-    function isAdmin() {
-      return request.auth != null &&
-        (request.auth.token.email != null &&
-         (request.auth.token.email == 'admin@gmail.com' ||
-          request.auth.token.email.matches('.*@tripmobility\\.ph$')));
-    }
+    function isAdmin() {
+      return request.auth != null &&
+        ((request.auth.token.email != null &&
+          (request.auth.token.email == 'admin@gmail.com' ||
+           request.auth.token.email.matches('.*@tripmobility\\.ph$'))) ||
+         (exists(/databases/$(database)/documents/profiles/$(request.auth.uid)) &&
+          get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role in ['admin', 'super_admin']));
+    }
```

### storage.rules
```diff
-    // Product assets: publicly viewable, editable by admins
+    // Helper to check if user is admin via email or Firestore role-based check
+    function isAdmin() {
+      return request.auth != null && (
+        (request.auth.token.email != null &&
+         (request.auth.token.email == 'admin@gmail.com' ||
+          request.auth.token.email.matches('.*@tripmobility\\.ph$'))) ||
+        (firestore.exists(/databases/(default)/documents/profiles/$(request.auth.uid)) &&
+         firestore.get(/databases/(default)/documents/profiles/$(request.auth.uid)).data.role in ['admin', 'super_admin'])
+      );
+    }
+
     match /products/{allPaths=**} {
       allow read: if true;
-      allow write: if request.auth != null && 
-        (request.auth.token.email == 'admin@gmail.com' || 
-         request.auth.token.email.matches('.*@tripmobility\\.ph$'));
+      allow write: if isAdmin();
     }
 
     // Brand assets: publicly viewable, editable by admins
     match /brand-assets/{allPaths=**} {
       allow read: if true;
-      allow write: if request.auth != null && 
-        (request.auth.token.email == 'admin@gmail.com' || 
-         request.auth.token.email.matches('.*@tripmobility\\.ph$'));
+      allow write: if isAdmin();
     }
 
     // Video uploads: publicly viewable, editable by admins
     match /videos/{allPaths=**} {
       allow read: if true;
-      allow write: if request.auth != null && 
-        (request.auth.token.email == 'admin@gmail.com' || 
-         request.auth.token.email.matches('.*@tripmobility\\.ph$'));
+      allow write: if isAdmin();
     }
 
     // Media Library assets (images & videos): publicly viewable, editable by admins
     match /media/{allPaths=**} {
       allow read: if true;
-      allow write: if request.auth != null && 
-        (request.auth.token.email == 'admin@gmail.com' || 
-         request.auth.token.email.matches('.*@tripmobility\\.ph$'));
+      allow write: if isAdmin();
     }
```
