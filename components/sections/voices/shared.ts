"use client";

/* ============================================================
   VOICES — shared primitives
   Ported verbatim from the Omelette export's voices-common.jsx
   (palette, voices, answer content, layout, easing, timing +
   scene-cue math) plus the clock/fonts machinery every version
   of the animation drives itself from. One source for v1, v2, 3D.
   ============================================================ */

import { useState, useEffect, useRef } from "react";

/* ---------- Palette (Organic ramps) ---------- */
export const C = {
  bg: "#f5ead8",
  ink: "#201e1d",
  a200: "#ffe1d0",
  a300: "#ffc6a5",
  a400: "#f6a06b",
  a500: "#d67f48",
  a600: "#b2622d",
  a700: "#8c491a",
  a800: "#643312",
  a900: "#402310",
  s300: "#ccdbb2",
  s400: "#aebf92",
  s500: "#8fa073",
  n100: "#f9f4ed",
  n200: "#eee7db",
  n300: "#dcd3c4",
  n400: "#c0b6a5",
  n500: "#a19786",
  n600: "#82796a",
  n700: "#645c50",
  n800: "#474238",
  n900: "#2e2b25",
  ground: "#221a14",
  ground2: "#3b2b20",
  chip: "#2f241c",
  chipEdge: "#4d3b2e",
} as const;

export type Voice = { native: string; name: string; tone: string };
export const VOICES: Voice[] = [
  { native: "हिन्दी", name: "HINDI", tone: C.a500 },
  { native: "தமிழ்", name: "TAMIL", tone: C.a300 },
  { native: "বাংলা", name: "BENGALI", tone: C.a400 },
  { native: "తెలుగు", name: "TELUGU", tone: C.s400 },
  { native: "ಕನ್ನಡ", name: "KANNADA", tone: C.n200 },
  { native: "मराठी", name: "MARATHI", tone: C.a400 },
];

export const ANSWER = {
  kicker: "USEFUL ANSWER",
  asked: "ASKED IN HINDI",
  q: "पेंसिल पानी में मुड़ी हुई क्यों दिखती है?",
  lines: [
    "Light bends as it passes from water to air —",
    "refraction. Your eye traces it back to a",
    "shifted point, so the pencil looks bent.",
  ],
  pxLines: [
    "Light bends as it passes from",
    "water to air — refraction. Your",
    "eye traces it back to a shifted",
    "point, so the pencil looks bent.",
  ],
  meta: "NCERT · CH 9 · LIGHT",
  cta: "Try a quick quiz →",
};

export const NATIVE_FONT =
  '"Noto Sans", "Noto Sans Devanagari", "Noto Sans Tamil", "Noto Sans Bengali", "Noto Sans Telugu", "Noto Sans Kannada", system-ui, sans-serif';

export const LAYOUT = {
  W: 1600,
  H: 640,
  chipX: 60,
  chipW: 222,
  chipH: 48,
  rowY: (i: number) => 108 + i * 84,
  waveX: 294,
  bars: 13,
  barGap: 12,
  lineX0: 450,
  coreX: 720,
  coreY: 180,
  coreW: 150,
  coreH: 336,
  inY: (i: number) => 228 + i * 48,
  outX: 888,
  outY: 348,
  cardX: 1110,
  cardY: 186,
  cardW: 438,
  cardH: 324,
};

/* ---------- Easing + interpolation ---------- */
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export type Ease = (t: number) => number;
export const Easing = {
  easeOutCubic: (t: number) => {
    const u = t - 1;
    return u * u * u + 1;
  },
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};
export const MOTION = {
  enter: Easing.easeOutCubic,
  draw: Easing.easeInOutCubic,
  pop: Easing.easeOutBack,
};

export function tw(T: number, s: number, e: number, ease?: Ease) {
  if (e <= s) return T >= s ? 1 : 0;
  const p = clamp((T - s) / (e - s), 0, 1);
  return (ease || MOTION.enter)(p);
}
export function lin(T: number, s: number, e: number) {
  return clamp((T - s) / (e - s), 0, 1);
}

/* ---------- Scene cues + timing helpers ---------- */
export const CUES = { Voices: 0, Converge: 3, Think: 5.5, Answer: 7, Reset: 11 };
export const TOTAL = 12;
export const STILL_T = 10.6; // settled frame for reduced motion

export type Beats = {
  on: (i: number) => number;
  pulse: (i: number) => number;
  think: number;
  answer: number;
  reset: number;
};
export function beats(c: typeof CUES): Beats {
  return {
    on: (i: number) => c.Voices + 0.25 + i * 0.28,
    pulse: (i: number) => c.Converge + i * 0.14,
    think: c.Think,
    answer: c.Answer,
    reset: c.Reset,
  };
}
export const B = beats(CUES);
export const PULSE_DUR = 1.3;

export function voiceAct(T: number, B: Beats, i: number) {
  return tw(T, B.on(i), B.on(i) + 0.35) * (1 - tw(T, B.reset, B.reset + 0.7));
}
export function lineDraw(T: number, B: Beats, i: number) {
  return tw(T, B.on(i) + 0.3, B.on(i) + 1.3, MOTION.draw);
}
export function fadeOut(T: number, B: Beats) {
  return 1 - tw(T, B.reset, B.reset + 0.8);
}
export function arrived(T: number, B: Beats, i: number) {
  return (
    tw(T, B.pulse(i) + PULSE_DUR - 0.05, B.pulse(i) + PULSE_DUR + 0.25, MOTION.pop) *
    fadeOut(T, B)
  );
}

export const WAVE_ENV = [
  0.25, 0.35, 0.5, 0.4, 0.7, 0.85, 1, 0.8, 0.65, 0.45, 0.55, 0.35, 0.25,
];
export function waveH(T: number, i: number, b: number, act: number) {
  const env = WAVE_ENV[b % WAVE_ENV.length];
  const osc =
    0.55 + 0.45 * Math.sin(T * 7.3 + b * 0.9 + i * 1.7) * Math.sin(T * 3.1 + b * 0.37 + i);
  return 0.1 + act * env * osc;
}

export function bez(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  t: number
): [number, number] {
  const mx = x0 + (x1 - x0) * 0.5;
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * x1,
    u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1,
  ];
}
export function hash3(a: number, b: number, c: number) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
export const CORE_PATTERN = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 1],
  [0, 1, 1],
  [1, 1, 0],
];
export const CORE_COLORS = [C.n500, C.n200, C.a500];

export function typed(lines: string[], n: number) {
  const out: string[] = [];
  let left = Math.floor(n);
  for (const l of lines) {
    const k = clamp(left, 0, l.length);
    out.push(l.slice(0, k));
    left -= l.length;
  }
  return out;
}

export type Cell = [number, number];

/* ---------- Fonts ---------- */
// Re-render once the pixel + native-script fonts finish loading so the
// canvas-rasterised text re-bakes with the right glyphs.
export function useFontsTick() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) return;
    const bump = () => setN((v) => v + 1);
    fonts.ready.then(bump).catch(() => {});
    fonts.addEventListener("loadingdone", bump);
    return () => fonts.removeEventListener("loadingdone", bump);
  }, []);
  return n;
}

export function ensureFontLink(id: string, href: string, fams: string[]) {
  if (typeof document === "undefined") return;
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) fams.forEach((f) => fonts.load(f).catch(() => {}));
}

/* ---------- Clock ---------- */
// Drives the authored time axis T by looping elapsed seconds over TOTAL.
// Runs only while the panel is on screen; freezes to STILL_T under
// prefers-reduced-motion.
export function useVoicesClock(opts: {
  fontId: string;
  fontHref: string;
  fams: string[];
}) {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [T, setT] = useState(STILL_T);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    ensureFontLink(opts.fontId, opts.fontHref, opts.fams);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted || reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const loop = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      setT(((ts - startRef.current) / 1000) % TOTAL);
      rafRef.current = requestAnimationFrame(loop);
    };
    const start = () => {
      if (rafRef.current == null) {
        startRef.current = null;
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [mounted, reduced]);

  return { mounted, reduced, T: reduced ? STILL_T : T, wrapRef };
}
