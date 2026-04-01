# Design System Document: High-End Hospitality & Tourism

## 1. Overview & Creative North Star: "The Modern Concierge"
This design system is built to transform a guest platform into a high-end editorial experience. We are moving away from "utility software" and toward "digital hospitality." 

**Creative North Star: The Modern Concierge.** 
The interface should feel like an attentive, silent host. It avoids the "boxed-in" look of standard mobile apps by utilizing intentional asymmetry, overlapping elements, and high-contrast typography scales. We prioritize "white space" (breathing room) over density, treating every screen like a page from a luxury travel magazine. By layering surfaces rather than drawing lines, we create an environment that feels expensive, calm, and curated.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the deep authority of Dark Blue and the heritage of Gold, executed through a lens of modern sophistication.

### Core Palette (Material Design Tokens)
*   **Primary (`#000666`):** The "Midnight" anchor. Used for high-level branding and key interactions.
*   **Secondary (`#735c00`):** The "Refined Gold." Used sparingly to highlight prestige, premium features, and price points.
*   **Surface / Background (`#f9f9f9`):** A soft, warm gray that reduces eye strain and provides a premium "paper" feel compared to pure white.
*   **Tertiary (`#380b00`):** Deep earthy tones for subtle variety in editorial sections.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. In this system, boundaries are defined exclusively by background color shifts. To separate a guest’s itinerary from the header, place the card (`surface_container_lowest`) on a slightly darker section (`surface_container_low`). 

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper.
1.  **Base Layer:** `surface` (The foundation).
2.  **Sectioning:** `surface_container_low` (Used to group related content).
3.  **Actionable Cards:** `surface_container_lowest` (Pure white, highest contrast against the background to signify interactability).
4.  **Floating Elements:** Use `primary_container` or `secondary_container` for high-importance overlays.

### The "Glass & Gradient" Rule
To elevate the "Modern Concierge" aesthetic, use Glassmorphism for the Bottom Navigation Bar and top-level headers. Apply a semi-transparent `surface` color with a `backdrop-blur` of 20px. 

---

## 3. Typography: The Editorial Voice
We use a dual-font strategy to balance international modernism with Ethiopian heritage.

*   **Display & Headline (Manrope):** Our "Voice." Bold, wide, and authoritative. Use `display-lg` for hero welcome messages (e.g., "Good morning, Guest").
*   **Body & Label (Inter):** Our "Intelligence." Highly legible and clean.
*   **Amharic Support:** For Abyssinica SIL, increase line-height by 1.2x compared to the English counterpart to ensure the intricate characters have room to breathe.

**Hierarchy Strategy:**
*   **Editorial Contrast:** Pair a massive `display-sm` headline with a tiny, all-caps `label-md` in Gold (`secondary`) for a high-fashion aesthetic.
*   **Price Display:** Prices in ETB must always use `title-lg` with the `secondary` (Gold) color to signify value and luxury.

---

## 4. Elevation & Depth
We eschew traditional shadows in favor of **Tonal Layering.**

*   **The Layering Principle:** Depth is achieved by "stacking." A card does not need a shadow if it is `#ffffff` sitting on a `#f3f3f3` (`surface_container_low`) background.
*   **Ambient Shadows:** Where a shadow is required for a floating action button (FAB), use a multi-layered, highly diffused shadow: `0px 20px 40px rgba(26, 35, 126, 0.06)`. Note the tint—the shadow is a faint blue, not gray, to keep the UI "clean."
*   **The Ghost Border:** If accessibility requires a stroke, use `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Cards (The Hero Component)
*   **Style:** Rounded corners at `xl` (1.5rem / 24px) for a soft, approachable feel.
*   **Rule:** No dividers. Use Spacing `6` (2rem) to separate internal content. 
*   **Layout:** Use asymmetrical padding—e.g., more padding at the bottom than the top—to give the content an editorial "lift."

### The Floating Emergency Button
*   **Placement:** Bottom right, but detached from the navigation bar.
*   **Style:** `error` (#ba1a1a) container with `on_error` white icon. 
*   **Interaction:** On scroll, collapse to a circle; when idle, expand to include a "SOS" label using `label-md`.

### Language Toggle (EN/AM)
*   **Style:** A pill-shaped `surface_container_high` toggle. 
*   **Animation:** A smooth sliding "thumb" using `secondary_fixed` to highlight the active language.

### Bottom Navigation Bar
*   **Design:** Floating (not edge-to-edge). Rounded `full`. 
*   **Visual:** Glassmorphic background (backdrop-blur 16px).
*   **Icons:** Use "on_surface_variant" for inactive states and "primary" with a small gold dot (`secondary`) underneath for the active state.

### Buttons
*   **Primary:** Dark Blue (`primary`). High roundedness (`full`). No shadow.
*   **Secondary:** Gold (`secondary_container`) with `on_secondary_container` text. Used for "Book Now" or "Upgrade."
*   **Tertiary:** Text-only with a `secondary` underline of 2px, offset by 4px.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical image cropping (e.g., one corner 24px, others 0px) for hero imagery to create a custom, high-end feel.
*   **Do** use ETB currency as a prefix in `label-sm` followed by the amount in `title-lg`.
*   **Do** prioritize smooth "Staggered Fade-In" animations for card lists to mimic the feeling of a concierge opening a door.

### Don't:
*   **Don’t** use pure black (#000000) for text. Use `on_surface` (#1a1c1c) to maintain a soft, premium look.
*   **Don’t** use standard 1px dividers between list items. Use a 12px vertical gap (`spacing-3`) and a background color shift.
*   **Don’t** cram more than three cards on a screen. If it feels crowded, increase the white space. Luxury is the luxury of space.

### Accessibility Note:
Ensure that while we use soft colors, the contrast ratio between `on_surface_variant` and `surface` remains at least 4.5:1 for readability. The Gold (`secondary`) should primarily be used for decorative or non-essential text elements, or paired with a dark background to ensure visibility.