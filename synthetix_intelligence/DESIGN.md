---
name: Synthetix Intelligence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c90a1'
  outline-variant: '#424656'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002b75'
  primary-container: '#0066ff'
  on-primary-container: '#f8f7ff'
  inverse-primary: '#0054d6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#c3c7cd'
  on-tertiary: '#2c3136'
  tertiary-container: '#6e7278'
  on-tertiary-container: '#f4f8fe'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#001849'
  on-primary-fixed-variant: '#003fa4'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#dfe3e9'
  tertiary-fixed-dim: '#c3c7cd'
  on-tertiary-fixed: '#171c20'
  on-tertiary-fixed-variant: '#43474c'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-xl-mobile:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a sophisticated, high-fidelity AI platform. It blends the structural rigors of enterprise SaaS with the ethereal, forward-leaning aesthetics of generative technology. The visual narrative centers on "Illuminated Intelligence"—where dark, focused workspaces are punctuated by vibrant, glowing accents that signify AI activity and data synthesis.

The design style is a hybrid of **Modern Corporate** and **Glassmorphism**. It utilizes deep charcoal canvases to provide a high-contrast foundation for pure white typography and electric gradient accents. This creates a focused, "dark mode first" environment that feels premium, professional, and cutting-edge.

## Colors
The palette is rooted in a "void" aesthetic—using nearly pure black for backgrounds to allow content and AI elements to pop.

- **Primary:** Electric Blue (#0066FF), used for primary actions and system-critical focus states.
- **Secondary:** Deep Violet (#8B5CF6), used in conjunction with blue to create dynamic gradients representing AI "processing" or "analysis" states.
- **Surface Tiers:** Use #111111 for primary cards and #1A1A1A for hovered or elevated states.
- **Accents:** Subtle border glows and shadows should utilize a low-opacity version of the primary/secondary gradient to simulate light emission from the components.

## Typography
This design system employs a tiered font strategy to balance technical precision with editorial impact.

- **Headings:** Use **Geist** for all headlines. Tracking should be tightened (negative letter-spacing) at larger sizes to create a dense, "engineered" feel.
- **Body:** **Inter** provides maximum legibility for long-form analysis and resource descriptions.
- **Data & Metadata:** **JetBrains Mono** is used for labels, timestamps, and AI confidence scores to evoke a sense of raw data processing and technical transparency.
- **Hierarchy:** Maintain high contrast between headlines (Pure White) and secondary body text (Gray-400) to guide the eye through complex layouts.

## Layout & Spacing
The layout follows a strict 12-column fluid grid for desktop, transitioning to a 4-column grid for mobile.

- **Rhythm:** Use a 4px base unit. Component internal padding should default to 24px (md) to ensure a spacious, premium feel.
- **Density:** Maintain generous white space (or "dark space") between major sections. Use 64px (xl) or larger for vertical section margins.
- **Alignment:** Content should be centered in the container-max width on ultra-wide screens to maintain readability.

## Elevation & Depth
Depth is achieved through layering and light simulation rather than traditional heavy shadows.

- **Surface Layers:** Use subtle value shifts (e.g., Background #050505 -> Card #111111).
- **Glassmorphism:** Elements like navigation bars and floating modals should use a 20px backdrop blur with a 10% opacity white fill and a 1px border (#FFFFFF10).
- **Glows:** High-priority cards should feature a "Subtle Border Glow." This is achieved with a 1px solid border at 20% opacity of the primary blue, paired with a very soft, 32px spread outer shadow of the same color at 5% opacity.
- **Shadows:** When used, shadows are "Ambient"—diffused (40px-60px blur) and tinted with a hint of the background color to avoid looking "muddy."

## Shapes
The shape language is sophisticated and modern, utilizing substantial rounding to soften the "tech" aesthetic.

- **Standard Radius:** 12px (0.75rem) for small components like inputs and small buttons.
- **Large Radius:** 24px (1.5rem) for primary content cards and containers.
- **Pill:** Used exclusively for tags, badges, and toggle switches.
- **Borders:** All borders on dark surfaces should be high-precision (1px) and low-contrast (#FFFFFF15) unless used for a focus state.

## Components
- **Buttons:** Primary buttons use the Electric-to-Violet gradient with white text. Secondary buttons are "Ghost" style with a 1px white border at 15% opacity.
- **Cards:** The "Resource Card" is the core component. It features a 24px corner radius, #111111 background, and a subtle gradient glow on hover.
- **Input Fields:** Dark backgrounds (#0A0A0A) with a 1px border. On focus, the border transitions to Primary Blue with a 4px soft outer glow.
- **Chips/Badges:** Monospaced text (JetBrains Mono) inside pill-shaped containers. AI-generated tags should have a subtle violet-tinted background.
- **AI Progress Bar:** A slim, 4px height bar using a moving linear gradient (Blue to Violet) to indicate active analysis.
- **Iconography:** Use 2px stroke-width line icons. In active states, icons gain a "Neo-Glow" effect, adopting the primary blue color with a small localized drop shadow of the same hue.