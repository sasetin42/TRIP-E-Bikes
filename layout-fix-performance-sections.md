# Plan: Layout Fix for Performance Sections

## Goal
The goal of this task is to restructure the `HomePage.tsx` layout to separate the "Assembled for Performance" animation from the "Built For Performance" section. Currently, the `<BikeAssemblyAnimation />` is deeply nested inside the right column of the "Built For Performance" grid, which breaks the layout and prevents it from being a full-width section.

## Steps

### 1. Extract `BikeAssemblyAnimation`
- Locate the `<BikeAssemblyAnimation />` component inside `HomePage.tsx`.
- Move it outside and above the "Built For Performance" section.
- Wrap it in a full-width container (e.g., a `<section>` or `<div>` with `w-full`) to ensure it spans the entire row as a standalone layout block.

### 2. Refactor "Built For Performance" Section
- Since the right column containing the animation is being removed, the grid layout of the "Built For Performance" section needs to be updated.
- Change the container from a 2-column grid (`grid-cols-1 lg:grid-cols-2`) to a 1-column layout (`grid-cols-1` or remove grid classes if unnecessary).
- Adjust the text alignment and spacing of the "Built For Performance" content (e.g., headings, paragraphs, and lists) to look balanced in a 1-column layout. Consider centering the content or organizing it in a more horizontal flow depending on the design requirements.

### 3. Verify Layout
- Ensure the `<BikeAssemblyAnimation />` is fully visible, functional, and takes up a single row.
- Ensure the "Built For Performance" section is situated directly below the animation and scales properly on both mobile and desktop screens.

## Files to Modify
- `HomePage.tsx` (in the appropriate `src/pages` or `src/components` directory)

## Execution
This file serves as the task plan. Once approved, the changes will be executed systematically following the steps above.
