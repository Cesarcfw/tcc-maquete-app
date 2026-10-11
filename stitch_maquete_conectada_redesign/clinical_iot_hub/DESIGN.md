---
name: Clinical IoT Hub
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006399'
  on-secondary: '#ffffff'
  secondary-container: '#7bc2ff'
  on-secondary-container: '#004f7b'
  tertiary: '#00685f'
  on-tertiary: '#ffffff'
  tertiary-container: '#008378'
  on-tertiary-container: '#f4fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#94ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004b74'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
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
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-precision, clinical-grade interface engineered for hospital environments, medical simulation beds, and IoT telemetry monitors. The visual language conveys uncompromising reliability, sterile clarity, and rapid perceptual comprehension under high-stress conditions. 

Balancing corporate health rigor with cutting-edge IoT telemetry, the design system employs a **Modern Clinical** style: crisp surfaces, low-glare dark modes, gentle surface tiering, balanced whitespace, and purposeful semantic demarcation. A strict distinction exists between clinical patient triage metrics (Manchester System) and environmental telemetry (such as ambient gas presence, humidity, and room temperature) to ensure zero cognitive ambiguity for healthcare personnel.

## Colors

The color system delivers high contrast, calibrated luminance levels, and complete semantic isolation across medical and environmental dimensions.

### Core Foundation
- **Medical Primary (`#0284c7` / `#0369a1`):** Represents clinical authority, operational stability, and structural actions.
- **Surface & Canvas:**
  - *Light Mode:* Canvas `#f8fafc`, Card Surface `#ffffff`, Border Subdued `#e2e8f0`.
  - *Dark Mode:* Canvas `#0b1329`, Card Surface `#111c38`, Elevated Surface `#162347`, Border Subdued `#1e293b`.

### Manchester Clinical Triage System
Strictly reserved for patient classification and bed priority lights:
- **Emergência (Immediate):** `#ef4444` (Red)
- **Muito Urgente (Very Urgent):** `#f97316` (Orange)
- **Urgente (Urgent):** `#eab308` (Yellow)
- **Pouco Urgente (Standard):** `#22c55e` (Green)
- **Não Urgente (Non-urgent):** `#3b82f6` (Blue)

### Environmental IoT & Hazard Distinction
- **Gas Presence Alert:** Uses an amber-hazard palette (`#d97706` / `#b45309`) decoupled from triage tokens. Accompanied by industrial diagonal warning hatch patterns to prevent clinical confusion with patient triage.
- **Simulation Badges:** Cyan-slate tone (`#e0f2fe` light / `#0c4a6e` dark) to unequivocally brand non-real-world testing modes.

## Typography

The type scale relies on **Plus Jakarta Sans** for its balanced humanist geometry, tall x-height, and legibility on medical monitors and handheld tablets. 

Key typographical rules:
- **Telemetry Readouts (`metric-display`):** Heavy, compact tabular numerics allowing vital metrics (temperatures, percentages, airflow, sensor flags) to be monitored from across a hospital room.
- **Section & Context Hierarchy:** Subtitles and helper text strictly use `body-sm` with dimmed contrast to keep structural focus on critical data.
- **Semantic Badging:** Captions and status indicators render in all-caps or medium-weight `label-sm` with subtle tracking to maximize instant visual scanning.

## Layout & Spacing

The layout is structured around an adaptive 12-column responsive fluid grid with dedicated sidebar navigation for administrative controls and breadcrumb-guided viewports.

### Breakpoints & Adaptive Flow
- **Mobile (< 768px):** Single column stack. Telemetry tiles collapse to 2-column or full-width grids. Margin: `1rem`, Gutter: `1rem`. Sidebar compresses to an off-canvas drawer or bottom action bar.
- **Tablet (768px – 1024px):** 6-column grid with a collapsed icon sidebar. Telemetry sensors group into pairs side-by-side.
- **Desktop (1025px+):** 12-column modular dashboard. Persistent sidebar (`260px` fixed). Dashboard sections reflow across dual main columns: Primary environmental controls (lighting, physical model mapping) span 7 columns, and real-time telemetry/triage monitors span 5 columns.

Component interiors maintain standard internal padding increments using `space-md` (`1rem`) and `space-lg` (`1.5rem`) for cards.

## Elevation & Depth

Visual depth is conveyed through subtle tonal surfaces coupled with soft, ultra-diffused ambient shadows, preventing high-contrast glare in low-light hospital wards.

- **Level 0 (Base Canvas):** Background surface (`#f8fafc` in light, `#0b1329` in dark).
- **Level 1 (Cards & Modules):** Raised container surface with a faint 1px structural outline (`#e2e8f0` light, `#1e293b` dark) and a soft ambient drop shadow:
  - *Light Mode:* `0 4px 20px -2px rgba(15, 23, 42, 0.05)`
  - *Dark Mode:* `0 4px 24px -2px rgba(0, 0, 0, 0.35)`
- **Level 2 (Interactive Floating Controls & Modals):** Accentuated surface depth for active telemetry drawers, profile switchers, and dropdown selects:
  - *Light Mode:* `0 10px 25px -5px rgba(2, 132, 199, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`
  - *Dark Mode:* `0 12px 30px -4px rgba(0, 0, 0, 0.5)`

## Shapes

The interface embraces a modern, friendly, yet clinical geometry with continuous curvature (`rounded-xl` for cards, `rounded-lg` for interactive segments). 

- **Primary Cards & Containers:** Standardized at `1rem` (16px) border-radius to foster an approachable, refined hardware-software integration.
- **Segmented Controls & Action Buttons:** Standardized at `0.75rem` (12px) border-radius for ergonomics and touch targets on medical tablets.
- **Badges, Pills & Avatars:** Fully rounded pill radius (`9999px`) to emphasize distinct system states and simulation watermarks.

## Components

### 1. Telemetry & Sensor Cards
- Metric cards (Temperature, Humidity, Gas) display a standardized header with an integrated circular icon badge (`40x40px`, 12px radius, primary tint background).
- Telemetry values are styled with `metric-display`, accompanied by simulated status footnotes in muted caption font (`body-sm`).

### 2. Hazard & Gas Presence Alert Component
- Independent of patient clinical status. When triggered, it renders an amber-hazard perimeter border (`2px solid #d97706`), an icon of an environmental sensor, and an optional 45-degree micro-striped safety header banner (`repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #d97706 10px, #d97706 20px)`). Text must state: *"Detecção de gás genérica. Sem aferição toxicológica específica."*

### 3. Manchester Triage Selector & Badges
- A dedicated patient priority card with five distinct, high-contrast segmented states.
- The active triage level features a prominent left indicator bar (`4px` width) or glowing pill container colored with the exact Manchester token (`#ef4444`, `#f97316`, `#eab308`, `#22c55e`, or `#3b82f6`) and explicit text describing time urgency.

### 4. Simulation Environment Badges ('Ambiente de Simulação')
- Displayed persistently in the global app bar and atop experimental cards.
- Rendered as a pill chip featuring a warning beacon icon, a soft cyan background (`#e0f2fe`), dark cyan text (`#0369a1`), and a 1px border (`#bae6fd`).

### 5. Buttons & Segmented Role Controls
- **Primary Buttons:** High-contrast background in `#0284c7`, hover state in `#0369a1`, with white typography and 12px rounded corners.
- **Segmented Access Switches (Matrix de Acessos):** Grouped outline container with 3-way toggle states ("Sem acesso", "Visualizar", "Controlar"). Active selection transitions smoothly with a solid soft-blue fill and bold text.

### 6. Environmental Sliders & Toggles
- Smooth, touch-friendly 24px slider thumbs with persistent intensity badges (e.g., `65%`) and quick-select segmented pills (`Apagar`, `25%`, `50%`, `100%`).