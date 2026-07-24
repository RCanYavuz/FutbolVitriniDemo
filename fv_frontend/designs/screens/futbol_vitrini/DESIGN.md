---
name: Futbol Vitrini
colors:
  surface: '#08151e'
  surface-dim: '#08151e'
  surface-bright: '#2e3b45'
  surface-container-lowest: '#030f19'
  surface-container-low: '#101d27'
  surface-container: '#14212b'
  surface-container-high: '#1f2b36'
  surface-container-highest: '#2a3641'
  on-surface: '#d7e4f2'
  on-surface-variant: '#bacbb9'
  inverse-surface: '#d7e4f2'
  inverse-on-surface: '#25323c'
  outline: '#859585'
  outline-variant: '#3b4a3d'
  surface-tint: '#00e475'
  primary: '#75ff9e'
  on-primary: '#003918'
  primary-container: '#00e676'
  on-primary-container: '#00612e'
  inverse-primary: '#006d35'
  secondary: '#8dcdff'
  on-secondary: '#00344f'
  secondary-container: '#00affe'
  on-secondary-container: '#003f5f'
  tertiary: '#dee5ef'
  on-tertiary: '#2a3139'
  tertiary-container: '#c2c9d3'
  on-tertiary-container: '#4d545d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#62ff96'
  primary-fixed-dim: '#00e475'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#cae6ff'
  secondary-fixed-dim: '#8dcdff'
  on-secondary-fixed: '#001e30'
  on-secondary-fixed-variant: '#004b70'
  tertiary-fixed: '#dce3ed'
  tertiary-fixed-dim: '#c0c7d1'
  on-tertiary-fixed: '#151c23'
  on-tertiary-fixed-variant: '#40474f'
  background: '#08151e'
  on-background: '#d7e4f2'
  surface-variant: '#2a3641'
  pitch-black: '#0B0F12'
  surface-primary: '#161D24'
  surface-secondary: '#212B36'
  pitch-green: '#00E676'
  tactical-blue: '#00B0FF'
  border-standard: '#2C3A47'
  text-muted: '#919EAB'
  accent-red: '#FF4842'
typography:
  display-lg:
    fontFamily: Barlow
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Barlow
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Barlow
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  data-metric:
    fontFamily: Barlow
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 16px
  max-width: 1440px
---

# Futbol Vitrini - UI/UX Design Specification & Master AI Prompt
This document serves as the comprehensive design system specification, information architecture blueprint, and advanced AI engineering prompt for the "Futbol Vitrini" web platform.
---
## Part 1: Design System & UX Framework (Design.md)
### 1. Architectural Philosophy & Context
"Futbol Vitrini" bridges the gap between raw, amateur talent and highly structured professional scouting networks. The interface must balance emotional sports engagement (the passion of football) with rigorous, data-driven analytical utility (the clarity required by scouts and coaches). 
* **Primary User Personas:**
    * *The Player:* Needs an intuitive, motivating interface to showcase achievements, often uploading media via mobile devices.
    * *The Scout / Club Representative:* Operates on desktop, looking for rapid data filtering, objective metrics, and side-by-side comparison tables. Bounded by limited time; efficiency is key.
    * *The Coach:* Focuses on tactical development, requiring high-frequency data input tools (evaluations) and micro-trend visualizations.
### 2. Visual Identity & Design Tokens (Dark Mode Optimization)
To avoid the amateur feel and deliver a premium, elite-tier sports analytics environment, the color palette avoids overwhelming neon greens, utilizing deep, structural charcoal and pitch tones instead.
+------------------------------------------------------------------------+
| TOKEN TYPE        | VALUE / CODE          | UX PURPOSE                 |
+------------------------------------------------------------------------+
| Base Background   | #0B0F12 (Pitch Black) | Reduces eye strain, deep   |
| Surface Primary   | #161D24 (Dark Slate)  | Cards, Sidebars, Modals    |
| Surface Secondary | #212B36 (Light Slate) | Active states, Hover inputs|
| Accent Primary    | #00E676 (Pitch Green) | CTAs, Primary Ratings, Data|
| Accent Secondary  | #00B0FF (Tactical Blue)| AI Features, System Prompts|
| Text Primary      | #FFFFFF (Pure White)  | Headings, Critical Metrics |
| Text Secondary    | #919EAB (Muted Grey)  | Subtext, Labels, Footnotes |
| Border Standard   | #2C3A47 (Low Contrast)| Grid alignments            |
+------------------------------------------------------------------------+
* **Typography Hierarchy:**
    * *Font Family:* `Inter` or `Barlow` (Barlow provides a slightly condensed, athletic aesthetic suitable for scoreboards and tables; Inter provides ultimate legibility for analytical data).
    * *Display / Headings:* Bold/Semi-Bold tracking (-0.02em) for an impactful, modern look.
    * *Data Display:* Monospace variant or tracking-adjusted numerals for clean table alignment.
* **Grid System:** 12-Column Desktop Grid (1440px standard width, 24px gutters, 16px margins). Atomic components scale on an 8px base unit grid.
---
### 3. Screen Architecture & Usability Paradigms
#### Screen 1: Player Profile Showcase (Player Dashboard)
Designed to emphasize individual capabilities through clear visual hierarchy (Gestalt principle of Proximity and Enclosure).
* **Personal Information Area (The Core Identity Card):**
    * Positioned top-left or full-width header block. Uses a high-contrast avatar placeholder against a desaturated dynamic gradient background reflecting the player's primary position color zone (e.g., Attacker = Subtle Crimson Accent; Midfielder = Pitch Green; Defender = Tactical Blue).
    * Key data points (Age, Height, Weight, Dominant Foot) use large data-ink ratios—bold 24pt figures with 10pt muted labels below them.
* **Career Timeline (The Journey Component):**
    * Vertical or horizontal interactive stepper. Avoids table clutter by presenting club transfers, seasons, and match metrics as distinct spatial milestones. Hovering over a milestone reveals a micro-card showing goals/clean sheets for that specific season.
* **Yetenek Örümcek Ağı Grafiği (Spider/Radar Chart):**
    * Centralized visual anchor. Built using SVG with an semi-transparent `#00E676` fill (20% opacity) and a crisp 2px border. Scales on five axes: Shooting, Passing, Dribbling, Pace, Physicality. Ensures that even missing data points degrade gracefully without breaking the component's geometry.
* **Media Area (The Highlight Reel):**
    * 16:9 Aspect-ratio video layout with custom analytical overlays. The play button acts as a high-affordance floating action component. Inside the video card, subtle custom progress-bar timestamps allow users to skip directly to "Goals", "Assists", or "Defensive Actions".
#### Screen 2: Scout / Club Discovery Panel (Scouting Search Interface)
An high-density utility dashboard designed to prevent cognitive overload while maintaining vast filtering capabilities.
* **Advanced Filtering Sidebar (Left-aligned, 300px fixed width):**
    * Employs accordion menus to chunk content safely. Price/Age/Pace utilize dual-point sliders with immediate text feedback. Checkbox lists utilize clean hitboxes (minimum 44x44px target area according to accessibility patterns).
* **Player Pool Grid/List View Toggle:**
    * *Grid Card Layout:* Features the player's face, primary position badge, and an explicit, glowing AI-Generated Rating Badge (e.g., "AI Score: 8.4") positioned top right using the `#00B0FF` tactical blue token to differentiate system calculations from raw human input.
* **AI Recommendations Module:**
    * Top banner carousel styled with a subtle border gradient mimicking intelligence processing. Provides immediate reasoning hooks (e.g., *"Matches your tactical requirement for an aggressive left-winger"*).
* **Comparison Interface Drawer:**
    * A hidden bottom drawer that slides up when 2 or more players are checked. Provides a clean, side-by-side technical matrix. Differences in stats are highlighted using conditional text colors (Positive = Pitch Green; Negative = Muted Red).
#### Screen 3: Coach Management Panel (Coach Dashboard)
An analytical monitoring workspace focused on team health and iterative data collection.
* **Growth Tracking (Line Charts):**
    * Multi-series smooth line graphs plotting weekly physical output against tactical compliance scores. Features interactive tooltips and toggles to switch between squad averages and individual player vectors.
* **Team Analysis Matrix:**
    * A tactical field-view layout (bird's-eye view visualization of a football pitch) mapping out squad depth. Clicking a position instantly filters the performance cards below to show players matching that role.
* **Evaluation & Feedback Form Module:**
    * An input interface utilizing a 10-point stepped slider or rapid-click button groups for physical, technical, and mental metrics. Avoids open text boxes where structured numerical data is preferred, but includes a "Scout Notes" text field with character counters.
---
