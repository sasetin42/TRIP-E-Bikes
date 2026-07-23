# Implementation Plan: Performance Section Design Fix

## 1. Context and Objective
The "Built For Performance" section (and related visual elements) in `HomePage.tsx` currently looks broken and unstyled. The objective is to completely overhaul the UI design of these sections to align with a premium, high-performance aesthetic (modern typography, proper spacing, engaging layout, and refined visual hierarchy).

## 2. Analysis of Current State (`HomePage.tsx` ~Line 344)
- **Technology Section (Built For Performance):** Currently uses a standard 2-column grid (`grid-cols-1 lg:grid-cols-2`). The text side uses basic spacing, while the animation/visual side (`BikeAssemblyAnimation`) is wrapped in a basic border box (`border border-black/5 p-6 bg-[#FAFAFA]`). 
- **Performance Metrics Section:** A simple 3-column layout with center-aligned text. It lacks premium visual flair or dynamic presentation of data.
- **Issues:** The layout feels generic, lacks depth (glassmorphism, subtle gradients, or micro-animations), and does not match the premium e-bike brand guidelines. The "Assembled for Performance" aspect (likely referring to the `BikeAssemblyAnimation` or a specific visual) looks broken in its current container.

## 3. Proposed Design Fix
1.  **Refined Typography & Spacing:** Increase padding for a more editorial feel. Use bolder, contrasting typography for headings and metrics.
2.  **Premium Materials & Cards:** Replace basic borders with elevated, subtly shadowed cards. 
3.  **Enhanced Layout:**
    -   **Built For Performance:** Upgrade the feature list (Aircraft Grade Aluminum, etc.) with custom icons, better alignment, and hover states. Give the `BikeAssemblyAnimation` container a more deliberate, framed presentation (e.g., a sleek, modern container that highlights the animation).
    -   **Performance Metrics:** Upgrade the data presentation to feature large, typography-driven data points with micro-interactions.

## 4. Implementation Steps
1.  **Update `HomePage.tsx` - Technology Section:**
    -   Modify the `section` wrapper to include a more distinct background or padding (`py-20 md:py-32`).
    -   Restyle the feature list map to use modern flex layouts with custom UI elements instead of a basic `w-2 h-2 rounded-full`.
    -   Overhaul the `BikeAssemblyAnimation` wrapper to feel like a premium showcase.
2.  **Update `HomePage.tsx` - Performance Metrics Section:**
    -   Enhance the metrics grid to use elevated typography and sleek accents.
3.  **Refine Tailwind Classes:** Ensure all spacing, colors, and responsive breakpoints are meticulously adjusted for a flawless mobile-to-desktop experience.

## 5. Verification
-   Run the local dev server.
-   Navigate to the homepage and scroll to the "Built For Performance" and "Performance Metrics" sections.
-   Verify that the layout is fully responsive, visually stunning, and matches the premium aesthetic requested.
