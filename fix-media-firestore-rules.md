# Plan - Fix Firestore Rules for Media Collection

This plan addresses upload and deletion failures for media/video assets in the Admin interface by adding proper read and write access rules for the Firestore `media` collection.

## 1. Files to Edit

- `firestore.rules` - The main Firestore rules definition file located in the workspace root.

## 2. Proposed Changes

### `firestore.rules`
Insert the rules for `/media/{docId}` right before the fallback catch-all block (around line 112):

```diff
+    // Media library metadata: public read, admin write
+    match /media/{docId} {
+      allow read: if true;
+      allow write: if isAdmin();
+    }
+
     // Default: deny everything else
     match /{document=**} {
       allow read, write: if false;
     }
```

## 3. Verification Criteria

1. **Rule Compilation/Deployment Verification (Optional/Local):**
   Run security rules tests if available, or deploy using Firebase CLI if connected:
   ```bash
   npx firebase deploy --only firestore:rules
   ```
2. **Functional Verification (Admin Dashboard):**
   - Log in to the application as an administrator.
   - Navigate to the Media section (`/admin/media` or through the Admin Products -> Images & Gallery).
   - Try uploading a new image/video. Verify that the upload completes successfully and the document is added to Firestore without permission errors.
   - Try deleting an item from the media gallery. Verify that both the Firestore document and the storage asset are deleted without throwing database permission exceptions.
