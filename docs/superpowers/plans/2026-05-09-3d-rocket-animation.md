# 3D Rocket Landing Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hero component with a scroll-driven 3D rocket landing sequence — a procedural SpaceX-style rocket descends from altitude to a landing pad while impact phrases appear at each stage.

**Architecture:** A `500vh` section uses CSS `position: sticky` to pin a full-screen container while the user scrolls. GSAP ScrollTrigger tracks scroll progress (0→1) and writes it to a shared module-level ref. R3F's `useFrame` reads that ref each animation frame to update rocket position, tilt, and exhaust intensity — no React re-renders in the animation loop. Phrase animations are GSAP-driven on HTML elements, also keyed off scroll progress.

**Tech Stack:** `@react-three/fiber`, `@react-three/drei`, `three`, `gsap` + ScrollTrigger, `next/dynamic` (ssr: false), Tailwind CSS

---

## File Map

**Create:**
- `components/RocketLanding/phrases.ts` — phrase data with scroll progress ranges
- `components/RocketLanding/scrollProgress.ts` — shared mutable ref (avoids React re-renders in the animation loop)
- `components/RocketLanding/PhraseOverlay.tsx` — HTML overlay, GSAP-driven phrase animations keyed to scroll progress
- `components/RocketLanding/RocketModel.tsx` — procedural rocket mesh + exhaust, reads `scrollProgress` in `useFrame`
- `components/RocketLanding/LandingPad.tsx` — grid + glowing ring, reads `scrollProgress` in `useFrame`
- `components/RocketLanding/RocketScene.tsx` — R3F Canvas, camera, lights, composes RocketModel + LandingPad
- `components/RocketLanding/index.tsx` — 500vh section, sticky container, GSAP ScrollTrigger, dynamic RocketScene + PhraseOverlay

**Modify:**
- `app/page.tsx` — swap `<Hero />` for `<RocketLanding />`

**Tests:**
- `__tests__/components/RocketLanding/phrases.test.ts`
- `__tests__/components/RocketLanding/PhraseOverlay.test.tsx`
- `__tests__/components/RocketLanding/RocketScene.test.tsx`
- `__tests__/components/RocketLanding/index.test.tsx`

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install 3D and animation libraries**

```bash
npm install three @react-three/fiber @react-three/drei gsap
```

- [ ] **Step 2: Verify no peer dependency errors**

```bash
npm ls three @react-three/fiber @react-three/drei gsap --depth=0
```

Expected: three lines each showing the installed version, no `UNMET PEER DEPENDENCY` warnings.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-three-fiber, drei, and gsap"
```

---

### Task 2: Phrase config and scroll progress module

**Files:**
- Create: `components/RocketLanding/phrases.ts`
- Create: `components/RocketLanding/scrollProgress.ts`
- Test: `__tests__/components/RocketLanding/phrases.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/RocketLanding/phrases.test.ts`:

```typescript
import { PHRASES } from '@/components/RocketLanding/phrases'

describe('PHRASES config', () => {
  it('has 10 phrases', () => {
    expect(PHRASES).toHaveLength(10)
  })

  it('every phrase has from < to, both within [0, 1]', () => {
    PHRASES.forEach(p => {
      expect(p.from).toBeGreaterThanOrEqual(0)
      expect(p.to).toBeLessThanOrEqual(1)
      expect(p.from).toBeLessThan(p.to)
    })
  })

  it('every phrase style is statement or question', () => {
    PHRASES.forEach(p => {
      expect(['statement', 'question']).toContain(p.style)
    })
  })

  it('last phrase is the CTA with isCta true', () => {
    const last = PHRASES[PHRASES.length - 1]
    expect(last.text).toBe('What problem are we going to solve with AI?')
    expect(last.isCta).toBe(true)
  })

  it('questions are in Stage 2 (progress 0.22–0.62)', () => {
    const questions = PHRASES.filter(p => p.style === 'question')
    expect(questions).toHaveLength(4)
    questions.forEach(q => {
      expect(q.from).toBeGreaterThanOrEqual(0.22)
      expect(q.to).toBeLessThanOrEqual(0.62)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="phrases.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding/phrases'`

- [ ] **Step 3: Create the phrase config**

Create `components/RocketLanding/phrases.ts`:

```typescript
export type PhraseStyle = 'statement' | 'question'

export interface Phrase {
  id: string
  text: string
  style: PhraseStyle
  from: number
  to: number
  isCta?: boolean
}

export const PHRASES: Phrase[] = [
  {
    id: 'p1',
    text: 'Most AI never leaves the lab.',
    style: 'statement',
    from: 0.00,
    to: 0.10,
  },
  {
    id: 'p2',
    text: 'The gap between demo and production is where companies bleed money.',
    style: 'statement',
    from: 0.10,
    to: 0.22,
  },
  {
    id: 'p3',
    text: 'What models should I use?',
    style: 'question',
    from: 0.22,
    to: 0.33,
  },
  {
    id: 'p4',
    text: 'How do I serve them?',
    style: 'question',
    from: 0.33,
    to: 0.44,
  },
  {
    id: 'p5',
    text: 'What happens when something breaks?',
    style: 'question',
    from: 0.44,
    to: 0.55,
  },
  {
    id: 'p6',
    text: 'How do we handle hallucinations?',
    style: 'question',
    from: 0.55,
    to: 0.62,
  },
  {
    id: 'p7',
    text: 'Reliable, robust AI systems — built for the real world.',
    style: 'statement',
    from: 0.62,
    to: 0.72,
  },
  {
    id: 'p8',
    text: 'Voice agents. Agentic systems. Production pipelines.',
    style: 'statement',
    from: 0.72,
    to: 0.82,
  },
  {
    id: 'p9',
    text: 'Real problems. Real software. Real ROI.',
    style: 'statement',
    from: 0.82,
    to: 0.90,
  },
  {
    id: 'p10',
    text: 'What problem are we going to solve with AI?',
    style: 'statement',
    from: 0.90,
    to: 1.00,
    isCta: true,
  },
]
```

- [ ] **Step 4: Create the scroll progress module**

Create `components/RocketLanding/scrollProgress.ts`:

```typescript
export const scrollProgress = { current: 0 }
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="phrases.test" --no-coverage
```

Expected: PASS — 5 passing tests

- [ ] **Step 6: Commit**

```bash
git add components/RocketLanding/phrases.ts components/RocketLanding/scrollProgress.ts __tests__/components/RocketLanding/phrases.test.ts
git commit -m "feat: add phrase config and scroll progress module"
```

---

### Task 3: PhraseOverlay component

**Files:**
- Create: `components/RocketLanding/PhraseOverlay.tsx`
- Test: `__tests__/components/RocketLanding/PhraseOverlay.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/RocketLanding/PhraseOverlay.test.tsx`:

```tsx
import React, { useRef } from 'react'
import { render, screen } from '@testing-library/react'
import PhraseOverlay from '@/components/RocketLanding/PhraseOverlay'
import { PHRASES } from '@/components/RocketLanding/phrases'

jest.mock('gsap', () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    to: jest.fn(),
    set: jest.fn(),
  },
}))
jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(() => ({ kill: jest.fn() })),
  },
}))
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

function Wrapper() {
  const ref = useRef<HTMLElement>(null)
  return (
    <section ref={ref}>
      <PhraseOverlay containerRef={ref} />
    </section>
  )
}

describe('PhraseOverlay', () => {
  it('renders all statement phrases as visible text', () => {
    render(<Wrapper />)
    const statements = PHRASES.filter(p => p.style === 'statement')
    statements.forEach(p => {
      expect(screen.getByText(p.text)).toBeInTheDocument()
    })
  })

  it('renders question phrases split into character spans', () => {
    render(<Wrapper />)
    const questions = PHRASES.filter(p => p.style === 'question')
    const totalChars = questions.reduce((sum, p) => sum + p.text.length, 0)
    const charSpans = document.querySelectorAll('.char')
    expect(charSpans).toHaveLength(totalChars)
  })

  it('renders the CTA link pointing to /contact', () => {
    render(<Wrapper />)
    const link = screen.getByRole('link', { name: /let's talk/i })
    expect(link).toHaveAttribute('href', '/contact')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="PhraseOverlay.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding/PhraseOverlay'`

- [ ] **Step 3: Create PhraseOverlay**

Create `components/RocketLanding/PhraseOverlay.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PHRASES, type Phrase } from './phrases'

interface Props {
  containerRef: React.RefObject<HTMLElement | null>
}

function renderText(phrase: Phrase) {
  if (phrase.style === 'question') {
    return phrase.text.split('').map((char, i) => (
      <span key={i} className="char">
        {char === ' ' ? ' ' : char}
      </span>
    ))
  }
  return phrase.text
}

export default function PhraseOverlay({ containerRef }: Props) {
  const phraseRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const prevActiveId = useRef<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress
        const active = PHRASES.find(phrase => p >= phrase.from && p <= phrase.to)
        const activeId = active?.id ?? null

        if (activeId === prevActiveId.current) return

        if (prevActiveId.current) {
          const prevEl = phraseRefs.current[prevActiveId.current]
          if (prevEl) {
            gsap.to(prevEl, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' })
          }
        }

        if (activeId && active) {
          const el = phraseRefs.current[activeId]
          if (el) {
            if (active.style === 'statement') {
              gsap.fromTo(
                el,
                { opacity: 0, scale: 0.85, y: 25 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
              )
            } else {
              const chars = el.querySelectorAll('.char')
              gsap.set(chars, { opacity: 0 })
              gsap.to(chars, { opacity: 1, duration: 0.02, stagger: 0.04, ease: 'none' })
            }
          }
        }

        prevActiveId.current = activeId
      },
    })

    return () => trigger.kill()
  }, [containerRef])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {PHRASES.map(phrase => (
        <div
          key={phrase.id}
          ref={el => { phraseRefs.current[phrase.id] = el }}
          className={[
            'absolute max-w-3xl px-6 text-center opacity-0',
            phrase.style === 'statement'
              ? 'font-mono text-4xl font-bold text-white md:text-6xl'
              : 'font-mono text-xl italic text-text-secondary md:text-2xl',
          ].join(' ')}
        >
          {renderText(phrase)}
          {phrase.isCta && (
            <div className="pointer-events-auto mt-10">
              <Link
                href="/contact"
                className="rounded-lg border-2 border-accent px-8 py-3 font-mono font-semibold text-accent shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all hover:bg-accent hover:text-white hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
              >
                Let&apos;s Talk
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="PhraseOverlay.test" --no-coverage
```

Expected: PASS — 3 passing tests

- [ ] **Step 5: Commit**

```bash
git add components/RocketLanding/PhraseOverlay.tsx __tests__/components/RocketLanding/PhraseOverlay.test.tsx
git commit -m "feat: add PhraseOverlay with GSAP scroll-driven phrase animations"
```

---

### Task 4: RocketModel component

**Files:**
- Create: `components/RocketLanding/RocketModel.tsx`
- Test: `__tests__/components/RocketLanding/RocketModel.test.tsx`

- [ ] **Step 1: Write the smoke test**

Create `__tests__/components/RocketLanding/RocketModel.test.tsx`:

```tsx
import React from 'react'
import { render } from '@testing-library/react'

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}))

import RocketModel from '@/components/RocketLanding/RocketModel'

describe('RocketModel', () => {
  it('renders without crashing', () => {
    expect(() => render(<RocketModel />)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern="RocketModel.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding/RocketModel'`

- [ ] **Step 3: Create RocketModel**

Create `components/RocketLanding/RocketModel.tsx`:

```tsx
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollProgress } from './scrollProgress'

export default function RocketModel() {
  const groupRef = useRef<THREE.Group>(null)
  const exhaustMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    if (!groupRef.current || !exhaustMatRef.current) return
    const p = scrollProgress.current
    groupRef.current.position.y = THREE.MathUtils.lerp(12, 0, p)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(0.08, 0, Math.min(p / 0.7, 1))
    exhaustMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.3, 5, p)
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.35, 3, 16]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#c8c8c8" />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 1.85, 0]}>
        <coneGeometry args={[0.28, 0.8, 16]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#c8c8c8" />
      </mesh>

      {/* Fins — 3 evenly spaced */}
      {[0, 120, 240].map(deg => (
        <mesh
          key={deg}
          position={[
            Math.sin((deg * Math.PI) / 180) * 0.38,
            -1.2,
            Math.cos((deg * Math.PI) / 180) * 0.38,
          ]}
          rotation={[0, (deg * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.06, 0.7, 0.45]} />
          <meshStandardMaterial metalness={0.8} roughness={0.2} color="#a0a0a0" />
        </mesh>
      ))}

      {/* Exhaust flame */}
      <mesh position={[0, -1.75, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 1.8, 16]} />
        <meshStandardMaterial
          ref={exhaustMatRef}
          color="#ff6600"
          emissive="#ff4400"
          emissiveIntensity={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern="RocketModel.test" --no-coverage
```

Expected: PASS — 1 passing test

- [ ] **Step 5: Commit**

```bash
git add components/RocketLanding/RocketModel.tsx __tests__/components/RocketLanding/RocketModel.test.tsx
git commit -m "feat: add procedural RocketModel with scroll-driven position and exhaust"
```

---

### Task 5: LandingPad component

**Files:**
- Create: `components/RocketLanding/LandingPad.tsx`
- Test: `__tests__/components/RocketLanding/LandingPad.test.tsx`

- [ ] **Step 1: Write the smoke test**

Create `__tests__/components/RocketLanding/LandingPad.test.tsx`:

```tsx
import React from 'react'
import { render } from '@testing-library/react'

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}))

import LandingPad from '@/components/RocketLanding/LandingPad'

describe('LandingPad', () => {
  it('renders without crashing', () => {
    expect(() => render(<LandingPad />)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern="LandingPad.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding/LandingPad'`

- [ ] **Step 3: Create LandingPad**

Create `components/RocketLanding/LandingPad.tsx`:

```tsx
'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollProgress } from './scrollProgress'

export default function LandingPad() {
  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const innerRingMatRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    if (!ringMatRef.current || !innerRingMatRef.current) return
    const p = scrollProgress.current
    const approachProgress = Math.max(0, (p - 0.7) / 0.3)
    ringMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.2, 4, approachProgress)
    innerRingMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(0.1, 2, approachProgress)
  })

  return (
    <group>
      {/* Tron-style grid */}
      <gridHelper args={[30, 30, '#0a2a1a', '#0d1f14']} rotation={[0, 0, 0]} />

      {/* Outer landing ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.9, 1.1, 64]} />
        <meshStandardMaterial
          ref={ringMatRef}
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner landing dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0, 0.15, 32]} />
        <meshStandardMaterial
          ref={innerRingMatRef}
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern="LandingPad.test" --no-coverage
```

Expected: PASS — 1 passing test

- [ ] **Step 5: Commit**

```bash
git add components/RocketLanding/LandingPad.tsx __tests__/components/RocketLanding/LandingPad.test.tsx
git commit -m "feat: add LandingPad with Tron grid and scroll-driven glow ring"
```

---

### Task 6: RocketScene component

**Files:**
- Create: `components/RocketLanding/RocketScene.tsx`
- Test: `__tests__/components/RocketLanding/RocketScene.test.tsx`

- [ ] **Step 1: Write the smoke test**

Create `__tests__/components/RocketLanding/RocketScene.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: jest.fn(),
}))
jest.mock('@/components/RocketLanding/RocketModel', () => ({
  __esModule: true,
  default: () => <div data-testid="rocket-model" />,
}))
jest.mock('@/components/RocketLanding/LandingPad', () => ({
  __esModule: true,
  default: () => <div data-testid="landing-pad" />,
}))

import RocketScene from '@/components/RocketLanding/RocketScene'

describe('RocketScene', () => {
  it('renders the R3F canvas', () => {
    render(<RocketScene />)
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('renders RocketModel and LandingPad inside the canvas', () => {
    render(<RocketScene />)
    expect(screen.getByTestId('rocket-model')).toBeInTheDocument()
    expect(screen.getByTestId('landing-pad')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="RocketScene.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding/RocketScene'`

- [ ] **Step 3: Create RocketScene**

Create `components/RocketLanding/RocketScene.tsx`:

```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import RocketModel from './RocketModel'
import LandingPad from './LandingPad'

export default function RocketScene() {
  return (
    <Canvas
      camera={{ position: [0, 3, 9], fov: 55 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#050810']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 12, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -4, -4]} intensity={0.6} color="#0055ff" />
      <pointLight position={[0, -1, 0]} intensity={0.4} color="#00ff88" />
      <RocketModel />
      <LandingPad />
    </Canvas>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="RocketScene.test" --no-coverage
```

Expected: PASS — 2 passing tests

- [ ] **Step 5: Commit**

```bash
git add components/RocketLanding/RocketScene.tsx __tests__/components/RocketLanding/RocketScene.test.tsx
git commit -m "feat: add RocketScene with R3F Canvas, camera, and lighting"
```

---

### Task 7: RocketLanding main component

**Files:**
- Create: `components/RocketLanding/index.tsx`
- Test: `__tests__/components/RocketLanding/index.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/RocketLanding/index.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('next/dynamic', () => (fn: () => Promise<{ default: React.ComponentType }>) => {
  const Component = () => <div data-testid="rocket-scene" />
  Component.displayName = 'DynamicRocketScene'
  return Component
})
jest.mock('gsap', () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
  },
}))
jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: jest.fn(() => ({ kill: jest.fn() })),
  },
}))
jest.mock('@/components/RocketLanding/PhraseOverlay', () => ({
  __esModule: true,
  default: () => <div data-testid="phrase-overlay" />,
}))

import RocketLanding from '@/components/RocketLanding'

describe('RocketLanding', () => {
  it('renders a section with 500vh height', () => {
    const { container } = render(<RocketLanding />)
    const section = container.querySelector('section')
    expect(section).toHaveClass('h-[500vh]')
  })

  it('renders a sticky full-screen container inside the section', () => {
    const { container } = render(<RocketLanding />)
    const sticky = container.querySelector('.sticky')
    expect(sticky).toBeInTheDocument()
    expect(sticky).toHaveClass('h-screen')
  })

  it('renders the RocketScene (dynamic) and PhraseOverlay', () => {
    render(<RocketLanding />)
    expect(screen.getByTestId('rocket-scene')).toBeInTheDocument()
    expect(screen.getByTestId('phrase-overlay')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="RocketLanding/index.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/RocketLanding'`

- [ ] **Step 3: Create RocketLanding index**

Create `components/RocketLanding/index.tsx`:

```tsx
'use client'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollProgress } from './scrollProgress'
import PhraseOverlay from './PhraseOverlay'

const RocketScene = dynamic(() => import('./RocketScene'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#050810]" />,
})

export default function RocketLanding() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgress.current = self.progress
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section ref={sectionRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <RocketScene />
        <PhraseOverlay containerRef={sectionRef} />
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="RocketLanding/index.test" --no-coverage
```

Expected: PASS — 3 passing tests

- [ ] **Step 5: Commit**

```bash
git add components/RocketLanding/index.tsx __tests__/components/RocketLanding/index.test.tsx
git commit -m "feat: add RocketLanding main component with GSAP scroll progress tracking"
```

---

### Task 8: Wire up page.tsx

**Files:**
- Modify: `app/page.tsx`
- Modify: `__tests__/components/Hero.test.tsx` (kept as-is — Hero.tsx stays in the codebase)

- [ ] **Step 1: Write the updated page test**

Create `__tests__/app/page.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/RocketLanding', () => ({
  __esModule: true,
  default: () => <div data-testid="rocket-landing" />,
}))
jest.mock('@/components/About', () => ({
  __esModule: true,
  default: () => <div data-testid="about" />,
}))

import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders RocketLanding instead of Hero', () => {
    render(<HomePage />)
    expect(screen.getByTestId('rocket-landing')).toBeInTheDocument()
  })

  it('still renders About', () => {
    render(<HomePage />)
    expect(screen.getByTestId('about')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- --testPathPattern="app/page.test" --no-coverage
```

Expected: FAIL — `rocket-landing` not found (page still imports Hero)

- [ ] **Step 3: Update page.tsx**

Edit `app/page.tsx`:

```tsx
import RocketLanding from '@/components/RocketLanding'
import About from '@/components/About'

export default function HomePage() {
  return (
    <>
      <RocketLanding />
      <About />
    </>
  )
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test -- --no-coverage
```

Expected: All tests pass, including the original Hero tests (Hero component is unchanged).

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx __tests__/app/page.test.tsx
git commit -m "feat: replace Hero with RocketLanding on homepage"
```

---

## Done

All tasks complete. The homepage now has a scroll-driven 3D rocket landing animation. Verify in the browser by running `npm run dev` and scrolling through the homepage — the rocket should descend from altitude to the landing pad as you scroll, with phrases appearing at each stage and the "Let's Talk" CTA at touchdown.
