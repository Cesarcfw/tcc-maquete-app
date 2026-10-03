---
name: Clinical IoT Operations
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414750'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727782'
  outline-variant: '#c1c7d2'
  surface-tint: '#1260a5'
  primary: '#004277'
  on-primary: '#ffffff'
  primary-container: '#005a9e'
  on-primary-container: '#b1d1ff'
  inverse-primary: '#a2c9ff'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#394156'
  on-tertiary: '#ffffff'
  tertiary-container: '#50586e'
  on-tertiary-container: '#c7cee9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  telemetry-value:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
  telemetry-unit:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a high-reliability clinical aesthetic tailored for critical hospital automation, telemetry, and smart medical environments. The interface balances technical precision with calm ergonomic efficiency, engineered to eliminate cognitive load and optical fatigue under 24/7 continuous operation.

Rooted in a **Precision Minimalist & High-Legibility Clinical** design movement, it pairs crisp information architecture with tactile, deterministic physical-digital affordances. The experience must evoke unshakeable stability, instantaneous situational awareness, and total adherence to safety standards. Every UI component communicates machine state and live sensor telemetry with zero ambiguity, optimizing touch ergonomics for medical staff wearing PPE, surgical gloves, or handling ruggedized ward tablets.

## Colors
The color architecture prioritizes anti-glare readability, functional containment, and strict compliance with medical protocol signaling (Manchester Triage System & Industrial Gas Safety standards).

### Core Palette
- **Primary Surgical Blue (`#005A9E`)**: Signifies clinical authority, core commands, and active selection.
- **Secondary Slate Cyan (`#0284C7`)**: Designates interactive telemetry toggles, real-time sync pulses, and highlighted informational nodes.
- **Deep Slate Ground (`#0F172A`)**: Primary structural framing, high-density data matrices, and maximum-contrast typographic headers.
- **Clinical Neutrals**: Neutral background `#F8FAFC` (anti-glare matte ground), surface container `#FFFFFF` (elevated cards), and boundary borders `#E2E8F0` / `#CBD5E1`.

### Clinical Alert & Manchester Triage Spectrum
Color must never be the sole indicator of critical status; it is always paired with iconography, state text, and structural accents.
- **Immediate / Resuscitation (`#DC2626`)**: Critical alarm, life support priority, emergency valve shutoff.
- **Very Urgent (`#EA580C`)**: High-priority risk, elevated pressure, imminent equipment trip.
- **Urgent (`#CA8A04`)**: Parameter drift, sensor desynchronization warning.
- **Standard / Safe (`#16A34A`)**: Nominal operation, normal telemetry, stable atmospheric pressure.
- **Non-Urgent (`#2563EB`)**: Routine maintenance check, automated scheduling flag.
- **Physical Hazard & Gas Alert**: Hazard amber `#D97706` accented with a high-contrast diagonal safety hatch (`repeating-linear-gradient(45deg, #F59E0B, #F59E0B 10px, #18181B 10px, #18181B 20px)`) used for hazardous gas containment and physical actuator locks.

### Operational State Tokens
- **Connected (Live)**: `#16A34A` with a subtle rhythmic pulse.
- **Disconnected (Offline)**: `#64748B` with a slashed diagnostic ring.
- **Stale (Outdated Telemetry)**: `#EAB308` with a persistent clock indicator badge.
- **Simulated (Test Sandbox)**: Violet `#7C3AED` with a cross-hatched edge badge to prevent confusion with production hospital equipment.

## Typography
Typographic rules prioritize hyper-legibility across distance and rapid scanning during medical interventions. 

- **Display & Section Headers**: `Plus Jakarta Sans` delivers a clean, modern, and open structural geometry that avoids harsh geometric coldness while retaining authoritative presence.
- **Operational Data & Body**: `Inter` is applied across all body copy, forms, dense telemetry readouts, tables, and sensor graphs. Tabular numbers (`font-variant-numeric: tabular-nums;`) must be strictly applied across all real-time counters, gas ppm figures, pressure gauges, and timestamps to eliminate layout shift during live refreshes.
- **Letter Spacing**: Use slight micro-tracking (`+0.02em`) on small uppercase labels (`label-sm`) for rapid deciphering on low-resolution hardware displays.

## Layout & Spacing
The layout follows a fluid-responsive modular grid designed for diverse operational hardware, ranging from mobile station monitors (4.7" to 6.5") to bedside tablets (10" to 12") and wall-mounted operating theater command displays (24"+).

- **Grid Architecture**: 
  - Mobile: 4-column fluid system, 16px margins, 16px gutters.
  - Tablet: 8-column layout, 24px margins, 20px gutters.
  - Desktop / Command Console: 12-column layout with a fixed max-width container of 1600px, 32px margins, 24px gutters.
- **Touch Target Ergonomics**: All interactive elements (toggles, emergency valve controls, override buttons) enforce a minimum touch target area of `48px x 48px` to ensure reliable operation by staff wearing nitrile or surgical gloves.
- **Telemetry Grouping**: Sensor grids collapse from a dense 4-tile horizontal row on desktop into stacked 2x2 matrix units on tablet, and single-column full-width metrics on mobile devices.

## Elevation & Depth
To minimize ocular fatigue under sterile white clinical illumination, depth is communicated through crisp **low-contrast outlines** complemented by **subtle tonal layering** rather than heavy drop shadows.

- **Level 0 (Canvas Base)**: `#F8FAFC` anti-glare foundation.
- **Level 1 (Card & Module Surfaces)**: Solid `#FFFFFF` enclosed by a 1px structural border of `#E2E8F0`. No ambient blur; flat and pure.
- **Level 2 (Active Controls & Modals)**: Lifted surface `#FFFFFF` bounded by `#CBD5E1` with an ultra-diffused, cool-tinted shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)`.
- **Level 3 (Urgent Alerts & Overrides)**: Raised floating panels using a 2px high-contrast semantic stroke corresponding to triage severity (e.g., `#DC2626` for critical), accompanied by a high-clarity drop shadow: `0 12px 24px -4px rgba(15, 23, 42, 0.12)`.

## Shapes
A controlled, calibrated shape radius of **Level 1 (Soft)** provides an architectural, instrumentation-grade feel. 

- Standard interactive controls, form fields, and telemetry tiles adopt a balanced `4px` (`0.25rem`) corner radius.
- Cards, alerts, and modal dialogs utilize `rounded-lg` (`8px` / `0.5rem`).
- Strict industrial actuators and physical override switches retain sharp interior bevels with `rounded-sm` (`2px`) for clear physical metaphor.
- Status indicator pills and mode badges utilize dedicated full capsule tracks (`9999px`) to maintain semantic separation from rectangular sensor data displays.

## Components

### Buttons & Actuators
- **Primary Action**: Solid `#005A9E` background, white label, 48px height, 4px border radius. Hover: `#00487E`. Active: `#003761` with an inward physical depression offset (`transform: translateY(1px)`).
- **Secondary Action**: Bordered button with 1.5px `#005A9E` outline, transparent fill, `#005A9E` text.
- **Emergency Critical Button**: High-visibility `#DC2626` with bold uppercase tracking, secondary confirmation press-and-hold requirement (2000ms fill timer) to prevent accidental actuation.
- **Manual Lockout Switch**: Toggle mechanism framed with safety diagonal hazard lines for locked status.

### Status Badges & Sensor Chips
- Rounded capsule badges with a distinct 6px status beacon.
  - **Live**: Border `#86EFAC`, fill `#F0FDF4`, beacon `#16A34A` with subtle CSS beacon animation.
  - **Offline**: Border `#E2E8F0`, fill `#F1F5F9`, beacon `#64748B`.
  - **Stale**: Border `#FDE047`, fill `#FEFCE8`, beacon `#CA8A04`.
  - **Simulated**: Border `#DDD6FE`, fill `#F5F3FF`, beacon `#7C3AED` with uppercase "[SIM]" micro-label.

### Telemetry Cards
- Structured 3-tier card: Top utility bar (Sensor name, connection icon, battery/signal level); Center (Numerical metric display with tabular alignment, min/max target range thresholds); Footer (Timestamp of last ping + quick-action telemetry chart drawer).
- Out of range metrics instantly shift card top-border from neutral `#E2E8F0` to a 4px solid status color matching the Manchester severity scale.

### Form Inputs & Adjusters
- Inputs feature a crisp 1px neutral border (`#CBD5E1`), 44px field height, `#0F172A` text, and zero glare background (`#FFFFFF`). Focus state yields a 2px outer ring in `#0284C7` with no offset.
- Incremental adjustments (e.g., flow rate, room temperature) use large segmented stepper targets (+/-) spaced apart by at least 12px to prevent accidental taps.

### Checkboxes & Segmented Controls
- Checkboxes are 22x22px square with a 3px radius. Active state: `#005A9E` with a bold white check mark.
- Segmented environment selectors use a flush tab group design with a recessed slate rail (`#F1F5F9`) and a high-contrast active tab (`#FFFFFF` with `#0F172A` text and subtle micro-shadow).