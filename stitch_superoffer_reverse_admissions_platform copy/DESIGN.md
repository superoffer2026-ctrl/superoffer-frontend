---
name: SuperOffer Design System
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edf0'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e5e1e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#3e4943'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#6e7a73'
  outline-variant: '#bdc9c1'
  surface-tint: '#006c4e'
  primary: '#005d42'
  on-primary: '#ffffff'
  primary-container: '#047857'
  on-primary-container: '#9ffdd3'
  inverse-primary: '#7bd8b1'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#99efe5'
  on-secondary-container: '#006f67'
  tertiary: '#005d3e'
  on-tertiary: '#ffffff'
  tertiary-container: '#007852'
  on-tertiary-container: '#8fffc9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f5cc'
  primary-fixed-dim: '#7bd8b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#9cf2e8'
  secondary-fixed-dim: '#80d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e5e1e4'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.035em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  numerical-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
  space-4xl: 6rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  max-width-content: 1280px
---

## Brand & Style

This design system embodies the high-stakes precision of elite opportunity discovery. Built for an international reverse admissions and talent marketplace, the UI inverts traditional power dynamics: institutions and enterprises petition the candidate. The aesthetic aligns with the rigorous craft of Linear, Stripe, and Apple—prioritizing absolute clarity, immaculate structural lines, and decisive signal-over-noise ratios.

### Visual Philosophy
- **Pristine Monochromatic Foundation:** Pure `#FFFFFF` serves as the canvas across every surface tier. Structural hierarchy is achieved purely through hairline borders, micro-insets, and microscopic diffuse shadows rather than tinted panel backdrops.
- **Architectural Restraint:** Whitespace is treated as active structural matter. Layouts prioritize generous breathing room balanced by razor-sharp internal alignment.
- **Signature Emerald Currency:** A high-precision emerald accent signifies momentum, offer status, verification, and prestige.
- **Micro-tactility:** Interactive surfaces feature subtle edge lights and minute hover transformations that signal world-class execution without visual clutter.

## Colors

The palette leverages high-contrast ink values over an uncompromised pure white baseline, punctuated by a deep emerald spectrum denoting offers, institutional status, and active bids.

### Palette Architecture
- **Canvas & Surface:** `#FFFFFF` universally. Containers do not rely on grey fills to separate content; separation is strictly managed by hairlines (`rgba(17, 17, 19, 0.06)` or `#F0F0F2`) and depth tokens.
- **Primary Ink:** Deep Near-Black (`#111113`) for high-legibility display headlines, crucial numbers, and primary button foregrounds.
- **Secondary Ink:** Refined Zinc (`#52525B`) for contextual summaries, structural captions, and muted labels.
- **Tertiary/Muted Ink:** Soft Slate (`#71717A`) for secondary metadata, subtle timestamps, and disabled iconography.
- **Signature Emerald Core:**
  - `emerald-base`: `#047857` (Primary interactive highlights, badges, validated statuses)
  - `emerald-deep`: `#065F46` (Hover actions, authoritative institutional stamps)
  - `emerald-light`: `#ECFDF5` (Pill backgrounds, spotlight highlights, status track fills)
  - `emerald-border`: `#A7F3D0` (Subtle boundary lines for verified opportunity states)
- **Border Spectrum:**
  - `border-subtle`: `rgba(17, 17, 19, 0.06)` (Standard card edge, container boundary)
  - `border-medium`: `rgba(17, 17, 19, 0.12)` (Interactive controls, form inputs, divider rules)
  - `border-focus`: `#111113` (Active keyboard and click focus boundary)

## Typography

Typographic hierarchy uses **Plus Jakarta Sans** across all breakpoints. The typographic treatment pairs editorial authority with technical clarity:
- **Optical Kerning & Tight Tracking:** Large titles utilize tight negative letter-spacing (`-0.03em` to `-0.035em`) to evoke confidence and institutional weight.
- **Generous Line Height:** Body copy avoids cramped metrics. Generous leading allows extensive qualification data, institutional biographies, and multi-line criteria to remain readable.
- **Micro Labels:** Functional indicators, ticker badges, and system indicators utilize uppercase or semi-bold variants with wider tracking (`+0.04em`) to maintain sharp legibility at scale.
- **Tabular Numerals:** For currency values, scholarship valuations, and metrics, use `font-feature-settings: 'tnum' 1, 'cv05' 1` to guarantee vertical baseline alignment across dynamic dashboards.

## Layout & Spacing

The layout is constructed on an 8-point geometric grid system anchored by a strict maximum container width of `1280px`.

### Responsive Grid
- **Desktop (1024px+):** 12-column grid, 24px gutters, dynamic outer margins automatically centered up to `1280px`. Fluid interior split cards allow 4-column (side filters/meta), 8-column (incoming offer queues), and 6-column symmetrical pairing.
- **Tablet (768px - 1023px):** 8-column grid, 20px gutters, 32px safe horizontal margins. Split columns automatically collapse into unified tabbed stacks.
- **Mobile (320px - 767px):** 4-column fluid grid, 16px gutters, 16px outer boundary margins. All offer cards, telemetry stats, and bid rows collapse to single-column full-width modules.

### Spacing Principles
- **Macro Separation:** Major section transitions leverage `space-3xl` (72px) and `space-4xl` (96px) to reinforce an unhurried, luxury technology atmosphere.
- **Micro Precision:** Atomic elements (badges, avatar clusters, value readouts) strictly adhere to increments of `0.25rem` (4px) and `0.5rem` (8px).

## Elevation & Depth

Because background fills remain `#FFFFFF` everywhere, depth is communicated through microscopic multi-layer shadow diffusions and crisp hairlines. Surfaces avoid heavy opaque cast shadows or dirty grey atmospheric blurs.

### Elevation Tiers
- **Surface Level 0 (Base Canvas):** Pure `#FFFFFF`.
- **Surface Level 1 (Static Cards & Containers):**
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 19, 0.06)`
  - Shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.01)`
- **Surface Level 2 (Interactive / Hovered Opportunity Cards):**
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 19, 0.10)`
  - Shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)`
  - Transition: `box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1), border-color 200ms ease`
- **Surface Level 3 (Dropdowns, Command Menus, Popovers):**
  - Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 19, 0.08)`
  - Shadow: `0 16px 36px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)`
- **Surface Level 4 (Modals, Bid Sheets & Application Sheets):**
  - Backdrop: `rgba(17, 17, 19, 0.3)` with `backdrop-filter: blur(8px)`
  - Modal Background: `#FFFFFF`
  - Border: `1px solid rgba(17, 17, 19, 0.08)`
  - Shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)`

## Shapes

The geometric form language communicates modern refinement: structured enough to convey institutional legitimacy, with sufficient soft curvature to maintain high consumer appeal.

### Geometry Specifications
- **Pills / Status Chips:** `rounded-full` (9999px) for admission status, tags, and categorical meta-chips.
- **Buttons & Input Fields:** `rounded-lg` (8px to 10px) to establish a firm, physical footprint for primary and secondary actions.
- **Cards & Data Modules:** `rounded-xl` (12px to 16px) for opportunity showcases, portfolio summaries, and analytics containers.
- **Modal Dialogues & Sheets:** `rounded-2xl` (20px to 24px) for focal surfaces.

## Components

### 1. Buttons
- **Primary Action (The Direct Match):** Background `#111113`, text `#FFFFFF`, 10px border radius, subtle inner top edge light (`inset 0 1px 0 rgba(255, 255, 255, 0.12)`). On hover, background shifts to `#27272A`.
- **Emerald Accent Action (SuperOffer Trigger):** Background `#047857`, text `#FFFFFF`, subtle inner top light (`inset 0 1px 0 rgba(255, 255, 255, 0.2)`). Hover: `#065F46`.
- **Secondary Outlined:** Background `#FFFFFF`, border `1px solid rgba(17, 17, 19, 0.12)`, text `#111113`. Hover: border `#111113`, background `rgba(17, 17, 19, 0.02)`.
- **Ghost Action:** Background transparent, text `#52525B`. Hover: text `#111113`, background `rgba(17, 17, 19, 0.04)`.

### 2. Opportunity Cards (Core Marketplace Unit)
- Background `#FFFFFF` with `border: 1px solid rgba(17, 17, 19, 0.06)`.
- Inner layout structured with generous 24px padding, clear separation between institutional branding/logo, candidate qualification match score, and headline scholarship/stipend valuation.
- Interactive hover: Subtle vertical translate (`translateY(-2px)`), hairline border darkens to `rgba(17, 17, 19, 0.12)`, shadow transitions to Surface Level 2.

### 3. Chips & Match Badges
- **Verified Match Chip:** Height 24px, padding 0 10px, background `#ECFDF5`, border `1px solid #A7F3D0`, text `#047857`, font size 11px, font weight 600. Includes an optional glowing pulse dot indicator.
- **Category & Discipline Chips:** Height 24px, padding 0 8px, background `#FFFFFF`, border `1px solid rgba(17, 17, 19, 0.08)`, text `#52525B`, font size 12px.

### 4. Input Fields & Search Bars
- Pure white background (`#FFFFFF`), border `1px solid rgba(17, 17, 19, 0.14)`, border radius 10px, padding 12px 16px.
- Focus State: Border color `#111113`, outer micro-ring `0 0 0 1px #111113`, shadow `0 2px 4px rgba(0, 0, 0, 0.02)`.
- Placeholder text in `#71717A`.

### 5. Checkboxes & Radio Controls
- Checkbox: 18px × 18px, border radius 5px, border `1px solid rgba(17, 17, 19, 0.2)`. Selected state: `#111113` background with crisp `#FFFFFF` checkmark.
- Radio: 18px circular, border `1px solid rgba(17, 17, 19, 0.2)`. Selected state: inner solid dot `#047857` with emerald highlight ring.

### 6. Reverse Admissions Auction/Bid Module
- Dedicated real-time panel showcasing incoming institution bids.
- Fixed `#FFFFFF` container with a hairline top border accent in emerald gradient (`linear-gradient(90deg, #047857 0%, #10B981 100%)`).
- Real-time indicator: Emerald pulse marker alongside timestamp in `#52525B`.