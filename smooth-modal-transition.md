# Smooth Modal Transition Plan

## Goal
Add a smooth transition animation to the CustomerAuthModal when the user clicks the "Sign In" button or opens the auth modal.

## Affected Files
- `src/index.css`
- `src/components/features/CustomerAuthModal.tsx`

## Tasks

### Phase 1: CSS Animation Definitions
- [ ] **Task 1**: Define keyframe animations in `src/index.css` under the appropriate Tailwind layers or utilities:
  - `keyframes fadeIn`: transitioning opacity from `0` to `1`
  - `keyframes modalScaleIn`: transitioning opacity from `0` to `1`, scale from `0.95` to `1`, and translateY from `10px` to `0`
- [ ] **Task 2**: Add Tailwind animation utility classes:
  - `.animate-backdrop-in` applying `fadeIn` with a smooth duration (e.g., `0.2s ease-out forwards`)
  - `.animate-modal-in` applying `modalScaleIn` with a spring-like or smooth easing duration (e.g., `0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`)

### Phase 2: Apply Animations to Modal Components
- [ ] **Task 3**: Open `src/components/features/CustomerAuthModal.tsx` and find the backdrop `div` (line 249). Apply the `animate-backdrop-in` utility class to it.
- [ ] **Task 4**: Find the main modal container wrapper `div` (line 251). Apply the `animate-modal-in` utility class to it.

### Phase 3: Verification
- [ ] **Task 5**: Run the build check to ensure that the animations compile correctly and there are no syntax or build errors in the CSS or TSX changes.

## Done When
- [ ] Keyframe animations and utilities compile cleanly.
- [ ] CustomerAuthModal backdrop fades in smoothly.
- [ ] CustomerAuthModal container springs and scales into view smoothly on open.
