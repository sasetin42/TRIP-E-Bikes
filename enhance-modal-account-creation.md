# Enhance Modal Account Creation Plan

## Goal
Enhance the modal account creation in `src/components/features/CustomerAuthModal.tsx` by adding password, date of birth, and avatar upload to Step 1 (Register mode), validating all inputs, uploading the profile image to Firebase Storage, and passing all registration fields to the OTP verification step.

## Affected Files
- `src/components/features/CustomerAuthModal.tsx`

## Tasks

### Phase 1: Imports & Hooks Setup
- [ ] **Task 1**: Add imports for UI icons and Firebase Storage helpers:
  - `Calendar`, `User`, `Lock` from `lucide-react`
  - `ref`, `uploadBytes`, `getDownloadURL` from `firebase/storage`
  - `storage` from `@/lib/firebase`
- [ ] **Task 2**: Add state hooks for the new fields and image upload state:
  - `dob` (date of birth string)
  - `password` (re-allocated to Step 1)
  - `avatarFile` (File object)
  - `avatarUrl` (downloaded string url)
  - `previewUrl` (local preview string url)

### Phase 2: UI Design (Register Mode - Step 1)
- [ ] **Task 3**: Design profile image upload section at the top of the form with circular preview, click-to-upload, and drag-and-drop support.
- [ ] **Task 4**: Add **Full Name** field with `User` icon inside.
- [ ] **Task 5**: Keep **Email Address** field with `Mail` icon inside.
- [ ] **Task 6**: Move **Password** field to Step 1 with `Lock` icon inside, eye visibility toggle, and strength bar below.
- [ ] **Task 7**: Add **Date of Birth** input (`type="date"`) with `Calendar` icon inside and matching dark custom styling.

### Phase 3: Registration Submission Flow Update (Step 1)
- [ ] **Task 8**: Validate that all inputs (Full Name, Email, Password, Date of Birth, and Profile Image) are non-empty before initiating the registration process.
- [ ] **Task 9**: Upload the avatar image file to Firebase Storage under `'avatars/'` and get the `avatarUrl` download URL.
- [ ] **Task 10**: Call `send_otp` endpoint via API with the validated email.

### Phase 4: OTP Verification & Registration Finalization (Step 2)
- [ ] **Task 11**: Keep verification code input screen for OTP.
- [ ] **Task 12**: Update `handleVerifyAndRegister` to call `verify_otp` passing the gathered fields including `password`, `dob`, and `avatarUrl` as the user's avatar.

## Done When
- All registration fields are strictly validated on the client side.
- Avatar image is successfully uploaded to Firebase Storage and its URL is displayed in a preview.
- Complete registration details (including avatar URL and Date of Birth) are sent and verified successfully upon OTP confirmation.

## Verification & Build Scripts
- Build check: `npm run build`
