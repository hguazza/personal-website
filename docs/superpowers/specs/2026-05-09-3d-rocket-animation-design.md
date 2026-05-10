# 3D Rocket Landing Animation — Design Spec

**Date:** 2026-05-09
**Status:** Approved

---

## Overview

Replace the current `Hero` component on the homepage with a scroll-driven 3D rocket landing sequence. As the user scrolls, a procedural rocket descends from the top of the screen to a landing pad, with impact phrases appearing and disappearing at specific scroll progress points. The aesthetic is futuristic, dark, and high-tech — inspired by SpaceX Starship landings.

---

## Page Structure & Scroll Mechanics

The `RocketLanding` section replaces `<Hero />` in `app/page.tsx`. The section is `500vh` tall, giving ample scroll room for the full narrative arc. Inside it, a sticky full-screen container pins the canvas and phrase overlay in view while the user scrolls.

GSAP ScrollTrigger maps scroll progress (`0 → 1`) to:
- **Rocket Y position** — starts high, descends to the landing pad
- **Rocket tilt/rotation** — subtle entry angle correction as it approaches
- **Exhaust flame intensity** — emissive glow grows as the rocket nears the ground
- **Phrase visibility windows** — each phrase appears at a defined scroll % range, holds, then fades out

After the `500vh` section ends, the rest of the page (`About`, nav, etc.) continues normally.

---

## Rocket Model & Visual Aesthetic

A procedural rocket built with `@react-three/drei` primitives (cylinders, cones, fins) — no external GLTF asset. This enables full control over materials, instant load, and tight visual alignment with the site palette.

**Visual treatment:**
- Dark space background matching the existing dark theme
- Rocket in silver/chrome metallic material (`MeshStandardMaterial` with high metalness/low roughness)
- Exhaust: emissive cone/particle system that intensifies on final approach
- Futuristic ground plane: Tron-style grid with a glowing circular landing pad
- Landing pad circle glows brighter as the rocket approaches touchdown

---

## Phrase Narrative Arc

Phrases render as an HTML overlay on top of the 3D canvas (not inside WebGL) for crisp rendering, accessibility, and easy Tailwind styling.

| Stage | Scroll % | Content | Style |
|-------|----------|---------|-------|
| 1 — High altitude | 0–20% | "Most AI never leaves the lab." / "The gap between demo and production is where companies bleed money." | Bold statement slam-in |
| 2 — Mid descent | 20–50% | *"What models should I use?"* / *"How do I serve them?"* / *"What happens when something breaks?"* / *"How do we handle hallucinations?"* | Terminal typing effect, muted |
| 3 — Final approach | 50–70% | "Reliable, robust AI systems — built for the real world." / "Voice agents. Agentic systems. Production pipelines." | Bold statement slam-in |
| 4 — Landing | 70–90% | "Real problems. Real software. Real ROI." | Bold statement slam-in |
| 5 — Touchdown | 90–100% | "What problem are we going to solve with AI?" + **[Let's Talk]** CTA | Fade in with glowing pulse border |

**Typography:**
- All phrases use `font-mono` (already in the project)
- Statements: `text-4xl` to `text-6xl`, full white or accent color
- Questions: `text-xl`, italic, muted/gray

**Animation styles:**
- **Statements** — fast scale + fade-in (`scaleX: 0.8 → 1`, `opacity: 0 → 1`), ~300ms
- **Questions** — character-by-character typing reveal, ~50ms per character
- **CTA button** — fade in with a pulsing glow border matching the landing pad

---

## Component Architecture

```
components/RocketLanding/
├── index.tsx          — main section, 500vh scroll container, GSAP ScrollTrigger setup
├── RocketScene.tsx    — R3F Canvas, camera, lighting
├── RocketModel.tsx    — procedural rocket mesh + exhaust particles
├── LandingPad.tsx     — ground grid + glowing landing circle
└── PhraseOverlay.tsx  — HTML phrase layer, scroll-progress-driven visibility
```

`app/page.tsx` changes:
```tsx
// Before
import Hero from '@/components/Hero'
// After
import RocketLanding from '@/components/RocketLanding'
```

---

## Performance

- `RocketScene` dynamically imported via `next/dynamic` with `ssr: false` — WebGL cannot run server-side
- R3F Canvas wrapped in `<Suspense>` with a plain dark fallback to prevent blank flash on load
- GSAP ScrollTrigger registered once on mount, cleaned up on unmount via `useEffect` return
- Phrase overlay is plain HTML/CSS — zero additional render cost
- No external 3D assets to fetch

---

## New Dependencies

```
@react-three/fiber   — React renderer for Three.js
@react-three/drei    — helpers: procedural geometries, environment, effects
gsap                 — scroll trigger + phrase animations
```

---

## Out of Scope

- Mobile-specific fallback (static hero) — can be addressed in a follow-up
- Sound effects
- Loading progress indicator beyond the Suspense fallback
