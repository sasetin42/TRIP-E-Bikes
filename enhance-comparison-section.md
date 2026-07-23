# Enhance E-Bike vs Motor-Bike Comparison Section

## Goal
Add top and bottom visual dividers with neon gradient styling, and integrate a premium background image overlay using `sustainabilityBg` for the comparison section in `src/pages/HomePage.tsx`.

## Tasks
- [ ] Task 1: Add a background image overlay to the showcase section in `src/pages/HomePage.tsx` using `sustainabilityBg` blended with vertical and horizontal dark gradients to ensure readability.
  - **Verify**: Inspect `src/pages/HomePage.tsx` around line 319 to ensure `sustainabilityBg` is rendered in an absolute container with low opacity (e.g. `opacity-20` or `opacity-30`) and `mix-blend-luminosity`.
- [ ] Task 2: Insert absolute neon gradient dividers at the top and bottom borders of the comparison showcase section.
  - **Verify**: The dividers should be absolute positioned containers with height `h-[1px]` or `h-[2px]`, styled with `bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent`.
- [ ] Task 3: Ensure all text and structural containers (such as titles, grids, tables) are properly layered above the background overlay by adding `relative z-10`.
  - **Verify**: Confirm that the children within the section use `relative z-10` class.
- [ ] Task 4: Verify syntax and build the application using TypeScript.
  - **Verify**: Run `npm run build` or `npx tsc --noEmit` and check for any syntax errors or build issues.

## Done When
- [ ] The E-Bike vs Motor-Bike section has premium background imagery with readable text.
- [ ] The top and bottom of the section have neon gradient dividers.
- [ ] The codebase passes TypeScript check and build successfully.
