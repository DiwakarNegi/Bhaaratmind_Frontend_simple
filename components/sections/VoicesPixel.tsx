"use client";

/* ============================================================
   VOICES — PIXEL ANIMATION
   Ported from the Omelette motion export (Voices Pixel.dc.html +
   animations-v3.jsx + voices-common.jsx + voices-pixel.jsx).

   The original is a continuous composition driven by an authored
   time axis T with five scenes (Voices 3s, Converge 2.5s, Think
   1.5s, Answer 4s, Reset 1s = 12s, looping). None are retimed on
   the site, so T is just elapsed wall-clock seconds looped over 12.

   The whole 1600x640 scene is a pure function of T, rendered as a
   crisp-edges SVG. It animates only while on screen and freezes to
   a settled still frame under prefers-reduced-motion.
   ============================================================ */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  createContext,
} from "react";

/* ---------- Palette (Organic ramps) ---------- */
const C = {
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

type Voice = { native: string; name: string; tone: string };
const VOICES: Voice[] = [
  { native: "हिन्दी", name: "HINDI", tone: C.a500 },
  { native: "தமிழ்", name: "TAMIL", tone: C.a300 },
  { native: "বাংলা", name: "BENGALI", tone: C.a400 },
  { native: "తెలుగు", name: "TELUGU", tone: C.s400 },
  { native: "ಕನ್ನಡ", name: "KANNADA", tone: C.n200 },
  { native: "मराठी", name: "MARATHI", tone: C.a400 },
];

const ANSWER = {
  kicker: "USEFUL ANSWER",
  asked: "ASKED IN HINDI",
  q: "पेंसिल पानी में मुड़ी हुई क्यों दिखती है?",
  pxLines: [
    "Light bends as it passes from",
    "water to air — refraction. Your",
    "eye traces it back to a shifted",
    "point, so the pencil looks bent.",
  ],
  meta: "NCERT · CH 9 · LIGHT",
  cta: "Try a quick quiz →",
};

const NATIVE_FONT =
  '"Noto Sans", "Noto Sans Devanagari", "Noto Sans Tamil", "Noto Sans Bengali", "Noto Sans Telugu", "Noto Sans Kannada", system-ui, sans-serif';

const LAYOUT = {
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
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type Ease = (t: number) => number;
const Easing = {
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
const MOTION = {
  enter: Easing.easeOutCubic,
  draw: Easing.easeInOutCubic,
  pop: Easing.easeOutBack,
};

function tw(T: number, s: number, e: number, ease?: Ease) {
  if (e <= s) return T >= s ? 1 : 0;
  const p = clamp((T - s) / (e - s), 0, 1);
  return (ease || MOTION.enter)(p);
}
function lin(T: number, s: number, e: number) {
  return clamp((T - s) / (e - s), 0, 1);
}

/* ---------- Scene cues + timing helpers ---------- */
const CUES = { Voices: 0, Converge: 3, Think: 5.5, Answer: 7, Reset: 11 };
const TOTAL = 12;
const STILL_T = 10.6; // settled frame for reduced motion

type Beats = {
  on: (i: number) => number;
  pulse: (i: number) => number;
  think: number;
  answer: number;
  reset: number;
};
function beats(c: typeof CUES): Beats {
  return {
    on: (i: number) => c.Voices + 0.25 + i * 0.28,
    pulse: (i: number) => c.Converge + i * 0.14,
    think: c.Think,
    answer: c.Answer,
    reset: c.Reset,
  };
}
const B = beats(CUES);
const PULSE_DUR = 1.3;

function voiceAct(T: number, B: Beats, i: number) {
  return tw(T, B.on(i), B.on(i) + 0.35) * (1 - tw(T, B.reset, B.reset + 0.7));
}
function lineDraw(T: number, B: Beats, i: number) {
  return tw(T, B.on(i) + 0.3, B.on(i) + 1.3, MOTION.draw);
}
function fadeOut(T: number, B: Beats) {
  return 1 - tw(T, B.reset, B.reset + 0.8);
}
function arrived(T: number, B: Beats, i: number) {
  return (
    tw(T, B.pulse(i) + PULSE_DUR - 0.05, B.pulse(i) + PULSE_DUR + 0.25, MOTION.pop) *
    fadeOut(T, B)
  );
}

const WAVE_ENV = [0.25, 0.35, 0.5, 0.4, 0.7, 0.85, 1, 0.8, 0.65, 0.45, 0.55, 0.35, 0.25];
function waveH(T: number, i: number, b: number, act: number) {
  const env = WAVE_ENV[b % WAVE_ENV.length];
  const osc =
    0.55 + 0.45 * Math.sin(T * 7.3 + b * 0.9 + i * 1.7) * Math.sin(T * 3.1 + b * 0.37 + i);
  return 0.1 + act * env * osc;
}

function bez(
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
function hash3(a: number, b: number, c: number) {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
const CORE_PATTERN = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
  [1, 1, 1],
  [0, 1, 1],
  [1, 1, 0],
];
const CORE_COLORS = [C.n500, C.n200, C.a500];

function typed(lines: string[], n: number) {
  const out: string[] = [];
  let left = Math.floor(n);
  for (const l of lines) {
    const k = clamp(left, 0, l.length);
    out.push(l.slice(0, k));
    left -= l.length;
  }
  return out;
}

/* ---------- Pixel geometry (6px grid) ---------- */
const PX = 6;
const snapP = (v: number) => Math.round(v / PX) * PX;

function pixRectPath(x: number, y: number, w: number, h: number, n: number) {
  const p = PX;
  let d = `M${x + n * p},${y}H${x + w - n * p}`;
  for (let k = 0; k < n; k++) d += `V${y + (k + 1) * p}H${x + w - (n - 1 - k) * p}`;
  d += `V${y + h - n * p}`;
  for (let k = 0; k < n; k++) d += `H${x + w - (k + 1) * p}V${y + h - (n - 1 - k) * p}`;
  d += `H${x + n * p}`;
  for (let k = 0; k < n; k++) d += `V${y + h - (k + 1) * p}H${x + (n - 1 - k) * p}`;
  d += `V${y + n * p}`;
  for (let k = 0; k < n; k++) d += `H${x + (k + 1) * p}V${y + (n - 1 - k) * p}`;
  return d + "Z";
}

function PixBox({
  x,
  y,
  w,
  h,
  n = 2,
  fill,
  edge,
  opacity = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  n?: number;
  fill: string;
  edge?: string;
  opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      {edge && <path d={pixRectPath(x, y, w, h, n)} fill={edge} />}
      <path
        d={pixRectPath(x + PX, y + PX, w - 2 * PX, h - 2 * PX, Math.max(0, n - 1))}
        fill={fill}
      />
    </g>
  );
}

type Cell = [number, number];
const cellsPath = (cells: Cell[], s = PX) =>
  cells.map(([x, y]) => `M${x},${y}h${s}v${s}h-${s}z`).join("");

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/* Static layers (background dots, radial glow, pixel connector lines) */
function usePixelStatic() {
  return useMemo(() => {
    const L = LAYOUT;
    const dots: Cell[] = [];
    for (let x = 18; x < L.W; x += 48)
      for (let y = 18; y < L.H; y += 48) dots.push([x, y]);
    const g1: Cell[] = [];
    const g2: Cell[] = [];
    const G = 12;
    const cx = 795;
    const cy = 348;
    for (let x = 0; x < L.W; x += G)
      for (let y = 0; y < L.H; y += G) {
        const d = Math.hypot((x - cx) / 440, (y - cy) / 300);
        if (d >= 1) continue;
        const it = Math.pow(1 - d, 1.5);
        const th = (BAYER[(y / G) % 4][(x / G) % 4] + 0.5) / 16;
        if (it > th) g1.push([x, y]);
        if (it * 1.6 - 0.6 > th) g2.push([x, y]);
      }
    const lines = VOICES.map((v, i) => {
      const x0 = L.lineX0;
      const y0 = L.rowY(i);
      const x1 = L.coreX - PX * 2;
      const y1 = L.inY(i);
      const out: Cell[] = [];
      let prev: Cell | null = null;
      for (let s = 0; s <= 500; s++) {
        const [bx, by] = bez(x0, y0, x1, y1, s / 500);
        const c: Cell = [snapP(bx), snapP(by) - PX / 2];
        if (prev && c[0] === prev[0] && c[1] === prev[1]) continue;
        if (prev && c[0] !== prev[0] && c[1] !== prev[1]) out.push([c[0], prev[1]]);
        out.push(c);
        prev = c;
      }
      return out;
    });
    return {
      dots: cellsPath(dots, 3),
      g1: cellsPath(g1, G),
      g2: cellsPath(g2, G),
      lines,
    };
  }, []);
}

/* ---------- Text (fonts) ---------- */
function useFontsTick() {
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
const FontTick = createContext(0);

// Renders native-script text at low resolution with hard (non-antialiased)
// alpha, then scales it up as crisp pixels.
function PixText({
  x,
  y,
  size,
  fill,
  children,
  anchor,
  scale = 2,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  children: string;
  anchor?: "start" | "middle" | "end";
  scale?: number;
}) {
  const tick = useContext(FontTick);
  const img = useMemo(() => {
    const fs = Math.round(size / scale);
    const font = `700 ${fs}px ${NATIVE_FONT}`;
    const cv = document.createElement("canvas");
    const cx = cv.getContext("2d")!;
    cx.font = font;
    const w = Math.ceil(cx.measureText(children).width) + 2;
    const h = Math.ceil(fs * 1.6);
    cv.width = w;
    cv.height = h;
    cx.font = font;
    cx.fillStyle = fill;
    cx.textBaseline = "alphabetic";
    cx.fillText(children, 1, Math.round(fs * 1.15));
    const d = cx.getImageData(0, 0, w, h);
    for (let k = 3; k < d.data.length; k += 4) d.data[k] = d.data[k] > 110 ? 255 : 0;
    cx.putImageData(d, 0, 0);
    return {
      src: cv.toDataURL(),
      w: w * scale,
      h: h * scale,
      base: Math.round(fs * 1.15) * scale,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, size, fill, scale, tick]);
  const ox = anchor === "middle" ? -img.w / 2 : anchor === "end" ? -img.w : 0;
  return (
    <image
      href={img.src}
      x={x + ox}
      y={y - img.base}
      width={img.w}
      height={img.h}
      preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function Silk({
  x,
  y,
  size = 13,
  fill,
  children,
  anchor,
  ls = 1,
}: {
  x: number;
  y: number;
  size?: number;
  fill: string;
  children: string;
  anchor?: "start" | "middle" | "end";
  ls?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      textAnchor={anchor || "start"}
      letterSpacing={ls}
      style={{ fontFamily: "Silkscreen, monospace" }}
    >
      {children}
    </text>
  );
}

/* ---------- Scene pieces ---------- */
function PixChip({
  i,
  v,
  T,
  B,
  ask,
}: {
  i: number;
  v: Voice;
  T: number;
  B: Beats;
  ask: number;
}) {
  const L = LAYOUT;
  const cy = L.rowY(i);
  const x = L.chipX;
  const y = cy - 24;
  const act = voiceAct(T, B, i);
  const edge = ask > 0.5 ? C.a500 : act > 0.5 ? C.chipEdge : "#3a2c22";
  const icon: Cell[] = [];
  for (let b = 0; b < 5; b++) {
    const h = Math.max(1, Math.round(waveH(T, i, b + 4, act) * 2.4));
    for (let k = -(h - 1); k <= h - 1; k++)
      icon.push([(x + 18 + b * PX * 1.5) | 0, cy - PX / 2 + (k * PX) / 2]);
  }
  return (
    <g>
      <PixBox
        x={x}
        y={y}
        w={L.chipW}
        h={L.chipH}
        n={2}
        fill={ask > 0.5 ? "#3d2a1d" : C.chip}
        edge={edge}
      />
      <path
        d={icon.map(([ix, iy]) => `M${ix},${iy}h3v3h-3z`).join("")}
        fill={v.tone}
        opacity={0.45 + 0.55 * act}
      />
      <g opacity={0.5 + 0.5 * act}>
        <PixText x={x + 58} y={cy + 8} size={22} fill={C.n100}>
          {v.native}
        </PixText>
        <Silk x={x + 142} y={cy + 5} size={12} fill={C.n300}>
          {v.name}
        </Silk>
      </g>
    </g>
  );
}

function PixWave({ i, v, T, B }: { i: number; v: Voice; T: number; B: Beats }) {
  const L = LAYOUT;
  const cy = L.rowY(i) - PX / 2;
  const act = voiceAct(T, B, i);
  const cells: Cell[] = [];
  const hot: Cell[] = [];
  for (let b = 0; b < L.bars; b++) {
    const h = Math.max(1, Math.round(waveH(T, i, b, act) * 4));
    const x = L.waveX + b * L.barGap;
    for (let k = -(h - 1); k <= h - 1; k++)
      (b === 6 && act > 0.4 ? hot : cells).push([x, cy + k * PX]);
  }
  return (
    <g>
      <path d={cellsPath(cells)} fill={v.tone} opacity={0.4 + 0.6 * act} />
      <path d={cellsPath(hot)} fill={C.n100} />
    </g>
  );
}

function PixLine({
  i,
  v,
  cells,
  T,
  B,
}: {
  i: number;
  v: Voice;
  cells: Cell[];
  T: number;
  B: Beats;
}) {
  const draw = lineDraw(T, B, i) * fadeOut(T, B);
  const n = Math.floor(cells.length * draw);
  const p = lin(T, B.pulse(i), B.pulse(i) + PULSE_DUR);
  const pe = MOTION.draw(p);
  const head = Math.floor(pe * (cells.length - 1));
  const trail: { c: Cell; o: number }[] = [];
  if (p > 0 && p < 1)
    for (let k = 0; k < 9; k++)
      if (head - k >= 0) trail.push({ c: cells[head - k], o: 1 - k / 9 });
  return (
    <g>
      <path d={cellsPath(cells.slice(0, n))} fill={v.tone} opacity={0.5} />
      {trail.map((t, k) => (
        <rect
          key={k}
          x={t.c[0] - (k === 0 ? PX / 2 : 0)}
          y={t.c[1] - (k === 0 ? PX / 2 : 0)}
          width={k === 0 ? PX * 2 : PX}
          height={k === 0 ? PX * 2 : PX}
          fill={k < 2 ? C.n100 : v.tone}
          opacity={t.o}
        />
      ))}
    </g>
  );
}

function PixCore({ T, B }: { T: number; B: Beats }) {
  const L = LAYOUT;
  const x = L.coreX;
  const y = L.coreY;
  const w = L.coreW;
  const h = L.coreH;
  const thinking = T >= B.think && T < B.think + 1.5;
  const lit =
    tw(T, B.think + 1.3, B.think + 1.6) * (1 - tw(T, B.reset, B.reset + 0.6));
  const bands = [C.a800, "#5a2e12", "#4d2810", C.a900];
  const dashes: React.ReactNode[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 3; c++) {
      const dx = x + 30 + c * 36;
      const dy = L.inY(r) - PX / 2;
      let flick = 0;
      if (thinking)
        flick =
          hash3(r, c, Math.floor(T * 14)) > 0.55 - 0.3 * lin(T, B.think, B.think + 1.5)
            ? 1
            : 0;
      const fin = CORE_PATTERN[r][c] ? lit : 0;
      dashes.push(
        <g key={r + "-" + c}>
          <rect x={dx} y={dy} width={PX * 3} height={PX} fill={C.n800} />
          {fin > 0 && (
            <rect
              x={dx}
              y={dy}
              width={PX * 3}
              height={PX}
              fill={CORE_COLORS[c]}
              opacity={fin}
            />
          )}
          {flick > 0 && (
            <rect
              x={dx}
              y={dy}
              width={PX * 3}
              height={PX}
              fill={c === 2 ? C.a400 : C.n100}
            />
          )}
        </g>
      );
    }
  const nodes = VOICES.map((v, i) => {
    const a = arrived(T, B, i);
    const s = PX * (1 + Math.round(a));
    return (
      <rect
        key={i}
        x={x - s / 2}
        y={L.inY(i) - s / 2}
        width={s}
        height={s}
        fill={a > 0.5 ? C.n100 : C.n600}
      />
    );
  });
  const bh = (h - 4 * PX) / 4;
  return (
    <g>
      <path
        d={pixRectPath(x - PX * 2, y - PX * 2, w + PX * 4, h + PX * 4, 5)}
        fill="none"
        stroke={C.a700}
        strokeWidth={2}
        strokeDasharray="3 6"
        opacity={0.6}
      />
      <path d={pixRectPath(x, y, w, h, 4)} fill={C.a600} />
      {bands.map((b, k) => (
        <rect
          key={k}
          x={x + PX * (k === 0 || k === 3 ? 3 : 1)}
          y={y + PX * 2 + k * bh}
          width={w - 2 * PX * (k === 0 || k === 3 ? 3 : 1)}
          height={bh}
          fill={b}
        />
      ))}
      {dashes}
      {nodes}
    </g>
  );
}

function PixOutput({ T, B }: { T: number; B: Beats }) {
  const L = LAYOUT;
  const cy = L.outY - PX / 2;
  const fo = fadeOut(T, B);
  const cells: Cell[] = [];
  const hot: Cell[] = [];
  const lead = tw(T, B.answer - 0.1, B.answer + 0.2);
  for (let x = L.coreX + L.coreW + PX; x < L.outX; x += PX)
    if (lead > 0) cells.push([x, cy]);
  for (let b = 0; b < 15; b++) {
    const on = tw(T, B.answer + b * 0.04, B.answer + b * 0.04 + 0.2);
    const env = Math.exp(-Math.pow((b - 7) / 4.5, 2));
    const osc = 0.6 + 0.4 * Math.sin(T * 9 + b * 1.3);
    const h = on > 0 ? Math.max(1, Math.round(on * env * osc * 5)) : 0;
    const x = L.outX + b * 12;
    for (let k = -(h - 1); k <= h - 1 && h > 0; k++)
      (b === 7 ? hot : cells).push([x, cy + k * PX]);
    if (on > 0) cells.push([x + PX, cy]);
  }
  const arr = tw(T, B.answer + 0.55, B.answer + 0.75);
  if (arr > 0)
    for (let k = 0; k < 4; k++)
      for (let j = -(3 - k); j <= 3 - k; j++) cells.push([L.outX + 180 + k * PX, cy + j * PX]);
  return (
    <g opacity={fo}>
      <path d={cellsPath(cells)} fill={C.a500} />
      <path d={cellsPath(hot)} fill={C.a300} />
    </g>
  );
}

function PixCard({ T, B }: { T: number; B: Beats }) {
  const L = LAYOUT;
  const x = L.cardX;
  const y = L.cardY;
  const w = L.cardW;
  const h = L.cardH;
  const rev =
    tw(T, B.answer + 0.5, B.answer + 1.1, MOTION.draw) *
    (1 - tw(T, B.reset, B.reset + 0.6, MOTION.draw));
  const hr = Math.round((h * rev) / (PX * 2)) * PX * 2;
  const qA = tw(T, B.answer + 0.95, B.answer + 1.35);
  const total = ANSWER.pxLines.join("").length;
  const typeP = lin(T, B.answer + 1.4, B.answer + 3.2);
  const lines = typed(ANSWER.pxLines, total * typeP);
  const curLine = Math.min(
    lines.findIndex((l, k) => l.length < ANSWER.pxLines[k].length),
    3
  );
  const cl = curLine < 0 ? 3 : curLine;
  const blink = Math.floor(T * 3) % 2 === 0;
  const foot = tw(T, B.answer + 3.2, B.answer + 3.6);
  if (hr <= 0) return null;
  return (
    <g>
      <clipPath id="voicespx-cardclip">
        <rect x={x - 4} y={y - 4} width={w + 8} height={hr + 4} />
      </clipPath>
      <g clipPath="url(#voicespx-cardclip)">
        <PixBox x={x} y={y} w={w} h={h} n={3} fill={C.n100} edge={C.a400} />
        <rect x={x + 30} y={y + 34} width={12} height={12} fill={C.a500} />
        <Silk x={x + 54} y={y + 45} size={13} fill={C.a700} ls={2}>
          {ANSWER.kicker}
        </Silk>
        <g opacity={qA}>
          <PixBox x={x + 24} y={y + 66} w={390} h={84} n={2} fill={C.a200} edge={C.a200} />
          <Silk x={x + 42} y={y + 92} size={10} fill={C.n700} ls={2}>
            {ANSWER.asked}
          </Silk>
          <PixText x={x + 42} y={y + 130} size={22} fill={C.ink}>
            {ANSWER.q}
          </PixText>
        </g>
        {lines.map((l, k) => (
          <text
            key={k}
            x={x + 30}
            y={y + 192 + k * 28}
            fontSize={27}
            fill={C.ink}
            style={{ fontFamily: "VT323, monospace" }}
          >
            {l}
          </text>
        ))}
        {typeP > 0 && foot < 1 && blink && (
          <rect
            x={x + 32 + lines[cl].length * 10.8}
            y={y + 172 + cl * 28}
            width={10}
            height={22}
            fill={C.a500}
          />
        )}
        <g opacity={foot}>
          <Silk x={x + 30} y={y + 300} size={10} fill={C.n600} ls={2}>
            {ANSWER.meta}
          </Silk>
          <text
            x={x + w - 28}
            y={y + 302}
            fontSize={26}
            fill={C.a700}
            textAnchor="end"
            style={{ fontFamily: "VT323, monospace" }}
          >
            {ANSWER.cta}
          </text>
        </g>
      </g>
    </g>
  );
}

function PixelPiece({ T }: { T: number }) {
  const S = usePixelStatic();
  const L = LAYOUT;
  const think =
    tw(T, B.think - 0.3, B.think + 0.4) * (1 - tw(T, B.answer + 0.5, B.answer + 2));
  const ask = tw(T, B.answer, B.answer + 0.2) * (1 - tw(T, B.reset, B.reset + 0.4));
  const tick = useFontsTick();
  return (
    <FontTick.Provider value={tick}>
      <svg
        viewBox={`0 0 ${L.W} ${L.H}`}
        width={L.W}
        height={L.H}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <rect width={L.W} height={L.H} fill={C.ground} />
        <path d={S.dots} fill={C.n800} opacity={0.5} />
        <path d={S.g1} fill={C.a900} opacity={0.9} />
        <path d={S.g2} fill={C.a800} opacity={0.55 + 0.45 * think} />
        {VOICES.map((v, i) => (
          <PixLine key={"l" + i} i={i} v={v} cells={S.lines[i]} T={T} B={B} />
        ))}
        {VOICES.map((v, i) => (
          <PixWave key={"w" + i} i={i} v={v} T={T} B={B} />
        ))}
        {VOICES.map((v, i) => (
          <PixChip key={"c" + i} i={i} v={v} T={T} B={B} ask={i === 0 ? ask : 0} />
        ))}
        <PixCore T={T} B={B} />
        <PixOutput T={T} B={B} />
        <PixCard T={T} B={B} />
        <Silk x={795} y={552} size={13} fill={C.n300} anchor="middle" ls={2}>
          ONE INTELLIGENCE
        </Silk>
        <PixText x={795} y={584} size={20} fill={C.n100} anchor="middle">
          एक बुद्धि
        </PixText>
        <Silk x={L.chipX} y={610} size={12} fill={C.n500} ls={2}>
          22+ VOICES IN
        </Silk>
      </svg>
    </FontTick.Provider>
  );
}

/* ---------- Clock + viewport/reduced-motion gating ---------- */
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Silkscreen&family=VT323&family=Noto+Sans+Devanagari:wght@700&family=Noto+Sans+Tamil:wght@700&family=Noto+Sans+Bengali:wght@700&family=Noto+Sans+Telugu:wght@700&family=Noto+Sans+Kannada:wght@700&display=swap";
const CANVAS_FAMS = [
  "Noto Sans Devanagari",
  "Noto Sans Tamil",
  "Noto Sans Bengali",
  "Noto Sans Telugu",
  "Noto Sans Kannada",
];

export default function VoicesPixel() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [T, setT] = useState(STILL_T);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  // Mount: load the pixel + native-script fonts, watch reduced-motion.
  useEffect(() => {
    setMounted(true);
    if (!document.getElementById("voices-pixel-fonts")) {
      const link = document.createElement("link");
      link.id = "voices-pixel-fonts";
      link.rel = "stylesheet";
      link.href = FONTS_HREF;
      document.head.appendChild(link);
    }
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts) CANVAS_FAMS.forEach((f) => fonts.load(`700 16px "${f}"`).catch(() => {}));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Run the loop only while on screen and motion is allowed.
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

  return (
    <div className="voices-anim" ref={wrapRef}>
      {mounted && <PixelPiece T={reduced ? STILL_T : T} />}
    </div>
  );
}
