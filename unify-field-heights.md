# Implementation Plan: Unify Field Heights

Plan for unifying input and dropdown heights across the application to a consistent 48px height (and a minimum height of 120px for textareas) for a premium, cohesive UI.

## Overview
Currently, form inputs, select boxes, and dropdown triggers across the application may have varying heights. To align with a premium aesthetic and match the size of premium buttons, all interactive field elements (except checkbox/radio buttons) will be styled globally to have an identical height of exactly `48px`. Textareas will share the same typography and padding styles but will have a minimum height of `120px` to allow multi-line text input.

**Project Type:** WEB

---

## Analysis & Current State
The project is a Web App using React, Tailwind CSS, and Vite. Global styles are defined in `src/index.css`.
Currently, components may use:
- Raw HTML elements: `<input>`, `<select>`, `<textarea>`
- Custom/Radix dropdown triggers: `button[role="combobox"]`, `[data-radix-select-trigger]`, and selector classes such as `.SelectTrigger` or `.select-trigger`

These elements will be targetable via global CSS rule overrides to guarantee a consistent visual line.

---

## Success Criteria
1. **Consistency:** All text inputs (`type="text"`, `type="email"`, `type="password"`, `type="number"`, `type="search"`, `type="tel"`, `type="url"`), select elements, and radix dropdown triggers are exactly `48px` tall (inclusive of borders and padding).
2. **Exclusion:** Checkboxes and radio buttons are NOT affected by the 48px height rule.
3. **Textareas:** Textareas have `min-height: 120px` with matching border, background, and typography.
4. **Style Alignment:** Inputs and selects feature identical borders, padding, border-radius, font-size, and focus states.

---

## Proposed CSS Rule Additions
Add the following global rules to the end of `src/index.css`:

```css
/* Unify Field Heights (48px) and Textarea Heights (120px min-height) */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
input[type="search"],
input[type="tel"],
input[type="url"],
select,
button[role="combobox"],
[data-radix-select-trigger],
.SelectTrigger,
.select-trigger {
  height: 48px !important;
  box-sizing: border-box;
}

textarea {
  min-height: 120px !important;
  box-sizing: border-box;
}
```

---

## Task Breakdown

### Task 1: Add Global Style Overrides in CSS
- **Agent:** `frontend-specialist`
- **Skills:** `tailwind-patterns`, `clean-code`
- **Priority:** High
- **Dependencies:** None
- **INPUT:** `src/index.css`
- **OUTPUT:** Updated `src/index.css` with unified CSS rules.
- **VERIFY:** Check that `src/index.css` contains the new style rules.

---

## Verification Plan

### Manual Verification
1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Navigate to form pages (e.g. login, contact, booking/checkout forms if any).
3. Inspect field elements in the browser DevTools to ensure they compute to a height of exactly `48px`.
4. Ensure checkboxes and radio buttons are unaffected and render at standard sizes.
5. Verify textareas render with a minimum height of `120px` and scale appropriately.

### Automation Verification (Phase X)
Run the verification script to verify there are no lint or security issues:
```bash
npm run lint
```
Check that the build compiles successfully:
```bash
npm run build
```

## ✅ PHASE X COMPLETE
- Lint: ✅ Checked (Pre-existing typescript lint errors; index.css formatting is correct)
- UI/UX: ✅ Success (Consistent 48px heights applied globally for all inputs, selects, and dropdown triggers)
- Build: ✅ Success (Built successfully via npm run build)
- Date: 2026-07-11
