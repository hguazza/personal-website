# Personal Website — Design Spec
**Date:** 2026-05-01  
**Author:** Henrique Mello Guazzelli  

---

## Overview

A personal website for Henrique Mello Guazzelli, an AI Engineer. The primary goal is to convert visitors into booked calls. The audience is a mix of technical peers and potential clients/companies. The tone is professional, technical, and personal — "brilliant engineer you'd grab coffee with."

---

## Architecture

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG/ISR, routing, performance |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Content (blog) | Notion API via `@notionhq/client` | Write posts in Notion, no code deploys |
| Post rendering | `notion-to-md` | Converts Notion blocks to markdown/HTML |
| Booking | Cal.com (free tier, embedded) | Inline widget, Google Calendar sync |
| Hosting | Vercel (free tier) | Auto-deploy from GitHub, domain support |

### Data Flow

- Static pages (Home, Projects, Contact) are fully statically generated at build time.
- Blog index and post pages use ISR (`revalidate: 3600`) — Notion content appears within ~1 hour of toggling the `Published` field.
- Cal.com is embedded via their JS snippet on the `/contact` page.

### Environment Variables

```
NOTION_API_KEY=
NOTION_DATABASE_ID=
CAL_LINK=
```

---

## Pages & Routes

### `/` — Home (single-page scroll)

Two scroll sections:

**Hero:**
- Headline: `"I build AI systems that work in the real world."`
- Subheading: `"AI Engineer specializing in voice AI, agentic systems, and production ML pipelines."`
- Primary CTA button: `"Book a call"` → links to `/contact` page

**About:**
- Mission and who you are
- Background: Big Data & Analytics degree, Post-grad in ML Engineering, studying Agentic AI at JHU
- Stack/tools displayed as badge tags

### `/projects` — Projects Portfolio

Grid of project cards. Each card has:
- Project title
- Short description (2–3 sentences)
- Tech stack tags
- No detail pages in scope — cards are self-contained

**Projects to include:**
1. Voice platform for call center debt collection (Deep, 2026)
2. Monitoring & quality agent — 90%+ accuracy replacing human evaluation
3. AI voice agent for operator training (LiveKit, Deepgram, ElevenLabs)
4. ML pipeline optimization (NiFi → Airflow, Whisper fine-tuning + post-processing)
5. Human evaluation platform + dataset prep + fine-tuning loop
6. Fraud detection agent — analyzed 5,000+ calls in 100 minutes (Elastic, async, semaphore), detected R$5M+ in fraud, eliminating manual analysis
7. AI governance framework (PEAS mapping, inventory, defensive layers)

### `/blog` — Articles & Resources

Grid of post cards pulled from Notion. Used to share news, papers, and articles.

**Notion database schema:**

| Field | Type |
|---|---|
| Title | Title |
| Slug | Text |
| Date | Date |
| Tags | Multi-select |
| Cover | Files & media |
| Published | Checkbox |

Toggling `Published` off hides the post without deleting it. New posts appear within ~1 hour.

### `/blog/[slug]` — Individual Post

- Full post body rendered from Notion blocks
- Title, date, tags displayed at top
- Back link to `/blog`

### `/contact` — Book a Call

- Copy: `"Have a project in mind or want to talk AI? Let's find 30 minutes."`
- Inline Cal.com widget (free tier)
- Cal.com account setup is part of the implementation plan

---

## Visual Design

**Color palette:**
- Background: near-black (e.g. `#0a0a0a`)
- Text: off-white (e.g. `#e8e8e8`)
- Accent: electric blue or teal (e.g. `#3b82f6` or `#2dd4bf`) — used for CTAs, links, hover states

**Typography:**
- Body: Inter or Geist (clean, readable)
- Headings / name / tagline: monospace font (nods to engineering identity)

**Layout:**
- Generous whitespace, content-first
- Project cards with subtle borders and hover shadows
- Stack/tool tags styled as small badges

**Details:**
- Subtle animated gradient or noise texture on hero section
- Smooth scroll transitions between sections
- Mobile-responsive navigation with hamburger menu

**Copy tone:** First person, direct, confident. "I build..." not "Henrique is an engineer who..."

---

## Navigation

Minimal top bar:
- Left: name or logo
- Right: Projects | Blog | Contact
- Mobile: hamburger menu

---

## Out of Scope (for now)

- Newsletter (explicitly deferred in context.md)
- Authentication / admin panel (Notion handles content management)
- Dark/light mode toggle (dark-only for now)
- Search on blog

---

## Setup Steps (part of implementation plan)

1. Initialize Next.js 14 project with Tailwind CSS
2. Create GitHub repo and connect to Vercel
3. Set up Cal.com free account and configure booking page
4. Create Notion integration and database
5. Build pages and components
6. Connect domain via Vercel DNS
