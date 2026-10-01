# BhaaratMind — V5a Terracotta

A faithful Next.js recreation of the Figma design **“BhaaratMind — Home 1440 · V5a Terracotta”**, with scroll animations throughout and a pinned **sticky-story** treatment of the *Why BhaaratMind* section.

## Stack

- **Next.js 15** (App Router) + **React 18**
- **Tailwind CSS v4** (tokens) + hand-authored editorial CSS in `app/globals.css`
- **Lenis** smooth scrolling (own rAF loop; also drives smooth in-page anchor links)
- **next/font**: Newsreader (serif display), Inter (body), IBM Plex Mono (eyebrows)

No CSS framework lock-in beyond Tailwind's reset/tokens — the distinctive pieces are custom.

## Run

```bash
npm install
npm run dev -- -p 3001    # 3000 is used by the sibling `bharatmind-next` app
```

Open http://localhost:3001. Build with `npm run build`.

## Structure

```
app/
  layout.tsx        fonts, metadata, mounts <SmoothScroll/>
  globals.css       design tokens + every section's styles
  page.tsx          assembles the 8 sections
components/
  SmoothScroll.tsx  Lenis + scroll-reveal controller (client)
  Navbar.tsx        fixed nav with scroll-shadow
  icons.tsx         inline SVG icon set
  sections/         Hero, LanguageMarquee, Problem, WhySticky,
                    ManyVoices, Products, EarlyAccess, Footer
  visuals/          LotusMandala, WhyMocks (the 4 chapter mockups)
```

## The sticky-story (Why BhaaratMind)

`components/sections/WhySticky.tsx` pins the section (CSS `position: sticky` over
`4 × 100vh`) and cross-fades four chapters — *Understand → Context → Action →
With India* — as you scroll, with a live progress rail. It degrades gracefully:
the panels render **stacked and fully visible** by default, and the pinned
experience is enabled only on desktop (≥ 861 px) without `prefers-reduced-motion`.

## Motion notes

- **Scroll reveals** are applied as **inline CSS transitions** by `SmoothScroll`
  (immediate pass for above-the-fold + `IntersectionObserver` for the rest).
  This is deliberate: inline styles survive React reconciliation and need no
  animation-library ticker.
- All motion respects `prefers-reduced-motion: reduce` (everything renders
  static and visible).
- The design is responsive down to mobile (nav condenses, grids stack, the
  sticky-story becomes a normal stacked list).
