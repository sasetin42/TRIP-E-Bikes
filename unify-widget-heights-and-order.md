# Unify Widget Heights and Order in Admin Media Controls

## Goal
Unify the heights of all the control widgets (Tabs, Search, List/Grid View Toggle, Sort Filters) in `src/pages/admin/AdminMedia.tsx` to `h-10` (40px) or `h-8` (32px) for inner elements, and reorder them on the right side of the control bar so Search comes first, followed by the Sort filter, and then the Grid/List toggle.

## Tasks

- [ ] Task 1: Unify heights of Tabs and its inner buttons.
  - Action: Update the tabs container classes (line 484) to include `h-10 items-center` and set inner buttons to `h-8 flex items-center justify-center` instead of `py-1.5`.
  - Verify: Tab wrapper height measures 40px in developer tools.

- [ ] Task 2: Unify height of Search bar input.
  - Action: Update search input (line 551-557) to use `h-10` instead of `py-2`.
  - Verify: Search bar height measures 40px in developer tools and is vertically aligned with the other controls.

- [ ] Task 3: Unify height of Sorting dropdown.
  - Action: Update the select element (line 513-517) to use `h-10` instead of `py-2`.
  - Verify: Dropdown height measures 40px in developer tools.

- [ ] Task 4: Unify heights of Grid/List View Toggle and its inner buttons.
  - Action: Update the toggle wrapper classes (line 527) to include `h-10 items-center` and set inner buttons to `h-8 w-8 flex items-center justify-center` instead of `p-1.5`.
  - Verify: Toggle wrapper height measures 40px in developer tools.

- [ ] Task 5: Rearrange layout order.
  - Action: Reorder the children in the flex container `flex flex-wrap items-center gap-3 w-full md:w-auto` (line 511) to be:
    1. Search bar
    2. Sorting Dropdown
    3. Grid / List View Toggle
  - Verify: View in browser shows Search -> Sort Dropdown -> Grid/List Toggle from left-to-right on the right side.

## Done When
- [ ] All four widgets (Tabs, Search, Sort Dropdown, Grid/List Toggle) are perfectly aligned horizontally and have a uniform height of `h-10` (40px).
- [ ] The control bar layout matches the requested order: Tabs on the left, and on the right side: Search, then Sort Filter, then Grid/List Toggle.
