# Plan: Fix Signup Avatar Storage Rules

## 1. Analysis & Problem Statement
Users encounter a storage unauthorized permission error when trying to upload their profile avatar during registration:
`Failed to upload avatar: Firebase Storage: User does not have permission to access avatars/1783788986067_avatar-boy-1.png.`

Currently, `storage.rules` restricts writes under `/avatars/{userId}` to authenticated users matching the user ID:
```javascript
match /avatars/{userId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```
However, during registration, the user is not yet authenticated, and the avatar filename does not match a `userId` (e.g., `1783788986067_avatar-boy-1.png`).

## 2. Proposed Changes
### 2.1 Update `storage.rules`
Modify the match pattern and write conditions for the avatars path:
- Change the match pattern from `/avatars/{userId}` to `/avatars/{fileName}`.
- Allow unauthenticated writes specifically for image uploads that are under 5MB.

```diff
-    // User avatars: publicly viewable, editable only by the owner user
-    match /avatars/{userId} {
-      allow read: if true;
-      allow write: if request.auth != null && request.auth.uid == userId;
-    }
+    // User avatars: publicly viewable, writable by anyone for images < 5MB (needed for registration flow)
+    match /avatars/{fileName} {
+      allow read: if true;
+      allow write: if request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
+    }
```

## 3. Verification & Deployment Steps
1. Deploy the updated Firebase Storage rules using:
   ```bash
   firebase deploy --only storage
   ```
2. Verify that registration works and avatars can be successfully uploaded.
