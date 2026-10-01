"use client";

/* ============================================================
   HERO SUN — centrepiece animation (replaces LotusMandala)
   Ported from the Omelette export's hero-sun.jsx: a seamless 8s
   loop (Rise -> Bloom -> Settle) where eight Indic scripts orbit
   a lotus, the lotus blooms, and each script flows into one sun,
   then returns. Two variants (Pixel default, Organic). Rendered
   natively as a pure function of the authored clock T; runs only
   while on screen and freezes to a settled frame under reduced
   motion. Pixel grid is emitted as one <path> per colour.
   ============================================================ */

import { useState, useEffect, useRef, useMemo } from "react";

const K = 280;
const TAU = Math.PI * 2;
const SITE = {
  petal0: "#FFCE97",
  petal1: "#E4742B",
  petal2: "#B4501A",
  back: "#A8431A",
  inner: "#FFE0BE",
  night: "#241B14",
  sun0: "#FFE3A6",
  sun1: "#F0A030",
  glow: "#F6B27A",
  orbit: "#A9421A",
  dot: "#FFF1DD",
};
const GLYPHS = [
  { ch: "अ", f: "Noto Sans Devanagari" },
  { ch: "অ", f: "Noto Sans Bengali" },
  { ch: "அ", f: "Noto Sans Tamil" },
  { ch: "అ", f: "Noto Sans Telugu" },
  { ch: "ಅ", f: "Noto Sans Kannada" },
  { ch: "અ", f: "Noto Sans Gujarati" },
  { ch: "അ", f: "Noto Sans Malayalam" },
  { ch: "ਅ", f: "Noto Sans Gurmukhi" },
];

const frac = (v: number) => v - Math.floor(v);

/* ---------- Easing + tween ---------- */
type Ease = (t: number) => number;
const Easing = {
  easeInCubic: (t: number) => t * t * t,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};
function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic,
}: {
  from?: number;
  to?: number;
  start?: number;
  end?: number;
  ease?: Ease;
}) {
  return (t: number) => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}

const MOTION = {
  dive: Easing.easeInCubic,
  rise: Easing.easeOutBack,
  breathe: Easing.easeInOutSine,
};

/* ---------- Scene clock ---------- */
const CUES = { Rise: 0, Bloom: 2.5, Settle: 5.5 };
const L = 8; // authored total
const STILL_T = 5.0; // settled frame for reduced motion

type Glyph = {
  ch: string;
  f: string;
  x: number;
  y: number;
  k: number;
  arrive: number;
};
type Beats = {
  T: number;
  p: number;
  bloom: number;
  glyphs: Glyph[];
  flash: number;
  pulse: number;
};

// Pure function of T (0 at T=0 and T=L -> seamless loop).
function useBeats(T: number): Beats {
  const p = frac(T / L);
  const bloom =
    animate({ from: 0, to: 1, start: CUES.Bloom - 0.6, end: CUES.Bloom + 1.2, ease: MOTION.rise })(T) -
    animate({ from: 0, to: 1, start: CUES.Settle + 0.2, end: L - 0.3, ease: MOTION.breathe })(T);
  const glyphs = GLYPHS.map((g, i) => {
    const dIn = CUES.Bloom + 0.1 + i * 0.22;
    const dEnd = dIn + 0.85;
    const rOut = CUES.Settle + 0.25 + i * 0.16;
    const rEnd = rOut + 1.05;
    const fall = animate({ from: 0, to: 1, start: dIn, end: dEnd, ease: MOTION.dive })(T);
    const back = animate({ from: 0, to: 1, start: rOut, end: rEnd, ease: MOTION.rise })(T);
    const k = fall - back;
    const sway = 6 * Math.sin(TAU * p);
    const ang = ((i * 45 - 90 + sway + 70 * fall * (1 - back)) * Math.PI) / 180;
    const r = 253 * (1 - k);
    return { ...g, x: K + Math.cos(ang) * r, y: K + Math.sin(ang) * r, k, arrive: dEnd };
  });
  const flash = glyphs.reduce(
    (s, g) => s + (T >= g.arrive ? Math.exp(-(T - g.arrive) * 5) : 0),
    0
  );
  const pulse = 0.5 - 0.5 * Math.cos(TAU * p * 2);
  return { T, p, bloom, glyphs, flash: Math.min(1, flash), pulse };
}

/* ================= Organic ================= */
const PETALS_BACK =
  "M276.275 232.435C265.405 273.005 431.015 280.855 432.755 274.365C434.495 267.865 287.145 191.865 276.275 232.435ZM260.225 260.225C230.525 289.925 370.025 379.525 374.775 374.775C379.525 370.025 289.925 230.525 260.225 260.225ZM232.435 276.275C191.865 287.145 267.865 434.495 274.365 432.755C280.855 431.015 273.005 265.405 232.435 276.275ZM200.335 276.275C159.765 265.405 151.915 431.015 158.405 432.755C164.905 434.495 240.905 287.145 200.335 276.275ZM172.545 260.225C142.845 230.525 53.2453 370.025 57.9953 374.775C62.7453 379.525 202.245 289.925 172.545 260.225ZM156.495 232.435C145.625 191.865 -1.72471 267.865 0.0152876 274.365C1.75529 280.855 167.365 273.005 156.495 232.435ZM156.495 200.335C167.365 159.765 1.75529 151.915 0.0152876 158.405C-1.72471 164.905 145.625 240.905 156.495 200.335ZM172.545 172.545C202.245 142.845 62.7453 53.2453 57.9953 57.9953C53.2453 62.7453 142.845 202.245 172.545 172.545ZM200.335 156.495C240.905 145.625 164.905 -1.72471 158.405 0.0152876C151.915 1.75529 159.765 167.365 200.335 156.495ZM232.435 156.495C273.005 167.365 280.855 1.75529 274.365 0.0152876C267.865 -1.72471 191.865 145.625 232.435 156.495ZM260.225 172.545C289.925 202.245 379.525 62.7453 374.775 57.9953C370.025 53.2453 230.525 142.845 260.225 172.545ZM276.275 200.335C287.145 240.905 434.495 164.905 432.755 158.405C431.015 151.915 265.405 159.765 276.275 200.335Z";
const PETALS_FRONT =
  "M230 176C230 216 352 182.4 352 176C352 169.6 230 136 230 176ZM222.77 203C202.77 237.64 325.22 269.54 328.42 264C331.62 258.46 242.77 168.36 222.77 203ZM203 222.77C168.36 242.77 258.46 331.62 264 328.42C269.54 325.22 237.64 202.77 203 222.77ZM176 230C136 230 169.6 352 176 352C182.4 352 216 230 176 230ZM149 222.77C114.36 202.77 82.46 325.22 88 328.42C93.54 331.62 183.64 242.77 149 222.77ZM129.23 203C109.23 168.36 20.38 258.46 23.58 264C26.78 269.54 149.23 237.64 129.23 203ZM122 176C122 136 0 169.6 0 176C0 182.4 122 216 122 176ZM129.23 149C149.23 114.36 26.78 82.46 23.58 88C20.38 93.54 109.23 183.64 129.23 149ZM149 129.23C183.64 109.23 93.54 20.38 88 23.58C82.46 26.78 114.36 149.23 149 129.23ZM176 122C216 122 182.4 0 176 0C169.6 0 136 122 176 122ZM203 129.23C237.64 149.23 269.54 26.78 264 23.58C258.46 20.38 168.36 109.23 203 129.23ZM222.77 149C242.77 183.64 331.62 93.54 328.42 88C325.22 82.46 202.77 114.36 222.77 149Z";
const PETALS_INNER =
  "M139.113 110.823C132.903 134.003 199.933 131.103 200.933 127.393C201.923 123.683 145.323 87.6428 139.113 110.823ZM128.753 128.753C111.783 145.723 171.293 176.723 174.013 174.013C176.723 171.293 145.723 111.783 128.753 128.753ZM110.823 139.113C87.6428 145.323 123.683 201.923 127.393 200.933C131.103 199.933 134.003 132.903 110.823 139.113ZM90.1228 139.113C66.9428 132.903 69.8428 199.933 73.5528 200.933C77.2628 201.923 113.303 145.323 90.1228 139.113ZM72.1928 128.753C55.2228 111.783 24.2228 171.293 26.9328 174.013C29.6528 176.723 89.1628 145.723 72.1928 128.753ZM61.8328 110.823C55.6228 87.6428 -0.977167 123.683 0.0128333 127.393C1.01283 131.103 68.0428 134.003 61.8328 110.823ZM61.8328 90.1228C68.0428 66.9428 1.01283 69.8428 0.0128333 73.5528C-0.977167 77.2628 55.6228 113.303 61.8328 90.1228ZM72.1928 72.1928C89.1628 55.2228 29.6528 24.2228 26.9328 26.9328C24.2228 29.6528 55.2228 89.1628 72.1928 72.1928ZM90.1228 61.8328C113.303 55.6228 77.2628 -0.977167 73.5528 0.0128333C69.8428 1.01283 66.9428 68.0428 90.1228 61.8328ZM110.823 61.8328C134.003 68.0428 131.103 1.01283 127.393 0.0128333C123.683 -0.977167 87.6428 55.6228 110.823 61.8328ZM128.753 72.1928C145.723 89.1628 176.723 29.6528 174.013 26.9328C171.293 24.2228 111.783 55.2228 128.753 72.1928ZM139.113 90.1228C145.323 113.303 201.923 77.2628 200.933 73.5528C199.933 69.8428 132.903 66.9428 139.113 90.1228Z";
const layerT = (box: number, scale: number, rot: number) =>
  `translate(${K} ${K}) rotate(${rot}) scale(${scale}) translate(${-box / 2} ${-box / 2})`;
const INNER_DOTS = Array.from({ length: 12 }, (_, k) => k * 30 + 7.5);

function OrganicLotus({ T }: { T: number }) {
  const { p, bloom, glyphs, flash, pulse } = useBeats(T);
  const sunR = 24 * (1 + 0.08 * pulse + 0.35 * flash + 0.25 * bloom);
  return (
    <svg
      viewBox="0 0 560 560"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      <defs>
        <radialGradient id="hs-petal" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={SITE.petal0} />
          <stop offset="0.55" stopColor={SITE.petal1} />
          <stop offset="1" stopColor={SITE.petal2} stopOpacity="0.92" />
        </radialGradient>
        <radialGradient id="hs-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={SITE.sun0} />
          <stop offset="1" stopColor={SITE.sun1} />
        </radialGradient>
        <radialGradient id="hs-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={SITE.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={SITE.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hs-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE3A6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F0A030" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={K} cy={K} r={250 + 30 * bloom} fill="url(#hs-glow)" opacity={0.7 + 0.3 * bloom} />
      <g transform={`rotate(${10 * p} ${K} ${K})`}>
        <circle cx={K} cy={K} r="253" fill="none" stroke={SITE.orbit} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="0.1 10.94" strokeLinecap="round" />
      </g>
      <g transform={layerT(432.771, 0.9 + 0.12 * bloom, 30 * p)}>
        <path d={PETALS_BACK} fill={SITE.back} fillOpacity={0.4 + 0.1 * bloom} />
      </g>
      <g transform={layerT(352, 0.86 + 0.16 * bloom, -15 * bloom + 30 * p)}>
        <path d={PETALS_FRONT} fill="url(#hs-petal)" />
      </g>
      <g transform={layerT(200.946, 0.82 + 0.24 * bloom, -30 * p + 15 * bloom)}>
        <path d={PETALS_INNER} fill={SITE.inner} fillOpacity="0.75" />
      </g>
      <circle cx={K} cy={K} r={74.5 + 8 * bloom} fill="none" stroke={SITE.petal1} strokeOpacity={0.4 + 0.3 * flash} strokeWidth="1" />
      <circle cx={K} cy={K} r="56" fill={SITE.night} />
      <circle cx={K} cy={K} r="55.25" fill="none" stroke={SITE.petal1} strokeOpacity={0.5 + 0.4 * flash} strokeWidth="1.5" />
      <circle cx={K} cy={K} r={sunR * 2.2} fill="url(#hs-core)" opacity={0.35 + 0.65 * flash} />
      <circle cx={K} cy={K} r={sunR} fill="url(#hs-sun)" />
      <circle cx={K} cy={K} r={6 + 3 * flash} fill="#FFFFFF" fillOpacity="0.6" />
      {INNER_DOTS.map((d, k) => {
        const a = ((d + 30 * p) * Math.PI) / 180;
        const r = 150 + 14 * bloom;
        return <circle key={k} cx={K + Math.cos(a) * r} cy={K + Math.sin(a) * r} r="2.5" fill={SITE.dot} fillOpacity="0.9" />;
      })}
      {glyphs.map((g, i) => {
        const s = 1 - 0.65 * g.k;
        const o = 1 - Math.max(0, (g.k - 0.7) / 0.3);
        return (
          <g key={i} opacity={o} transform={`translate(${g.x} ${g.y}) scale(${s})`}>
            <circle r="19" fill="#fcf6ed" stroke={SITE.petal1} strokeOpacity="0.55" strokeWidth="1.5" />
            <text y="1" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="600" fill={SITE.back} style={{ fontFamily: `"${g.f}", system-ui, sans-serif` }}>
              {g.ch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ================= Pixel ================= */
const G = 112;
const CELL = 560 / G;
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const RAMP = {
  back: ["#EDC29E", "#E2AA80", "#D38F63", "#BF6F44"],
  backLine: "#A8431A",
  front: ["#FFE6C2", "#FFCE97", "#F8AE6C", "#EE8C45", "#E4742B", "#C85E22"],
  frontLine: "#9C4416",
  inner: ["#FFF6EA", "#FFEBD3", "#FFE0BE", "#F7CDA2"],
  innerLine: "#EBAE7E",
  glow: ["#F9E3CB", "#F6D3B0", "#F2C196"],
  pod: ["#FFF3D6", "#FFE3A6", "#FBC766", "#F0A030", "#D98A22"],
  podLine: "#B4501A",
  orbit: "#C98A64",
  orbitHi: "#E4742B",
  dot: "#FFF1DD",
  tile: "#fcf6ed",
  tileLine: "#E4742B",
  shadow: "#E6C4A2",
};
const dith = (v: number, n: number, x: number, y: number) =>
  Math.max(0, Math.min(n - 1, Math.floor(v * n + (BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5)));

function petal(th: number, rot: number, base: number, tip: number) {
  const seg = TAU / 12;
  const d = Math.abs(frac((th - rot) / seg + 0.5) - 0.5) * 2;
  const R = base + (tip - base) * Math.pow(Math.max(0, 1 - d * d * 1.15), 0.62);
  return { d, R };
}
function shadePetal(
  ramp: string[],
  line: string,
  isFront: boolean,
  isInner: boolean,
  r: number,
  d: number,
  R: number,
  x: number,
  y: number,
  th: number,
  rot: number
) {
  if (R - r < CELL * 1.05) return line;
  const q = r / R;
  if (!isInner && d < 0.05 && q > 0.3 && q < 0.86) return ramp[Math.min(ramp.length - 1, 2)];
  let v = isFront ? 0.15 + 0.85 * q : q;
  v += 0.28 * d * d;
  v += Math.sin(th - rot) > 0 ? 0 : 0.06;
  if (d < 0.32 && q > 0.5 && q < 0.72) v -= 0.22;
  return ramp[dith(Math.min(0.999, Math.max(0, v)), ramp.length, x, y)];
}

function useGlyphSprites() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const f = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (f)
      Promise.all(GLYPHS.map((g) => f.load('600 16px "' + g.f + '"'))).then(
        () => setTick(1),
        () => {}
      );
  }, []);
  return useMemo(
    () =>
      GLYPHS.map((g) => {
        const w = 16;
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = w;
        const cx = cv.getContext("2d")!;
        cx.font = '600 12px "' + g.f + '", sans-serif';
        cx.textAlign = "center";
        cx.textBaseline = "middle";
        cx.fillStyle = RAMP.backLine;
        cx.fillText(g.ch, w / 2, w / 2 + 1);
        const d = cx.getImageData(0, 0, w, w);
        for (let k = 3; k < d.data.length; k += 4) d.data[k] = d.data[k] > 100 ? 255 : 0;
        cx.putImageData(d, 0, 0);
        return cv.toDataURL();
      }),
    [tick]
  );
}

function stepTile(x: number, y: number, w: number, n: number, u: number) {
  let d = "M" + (x + n * u) + "," + y + "H" + (x + w - n * u);
  for (let k = 0; k < n; k++) d += "V" + (y + (k + 1) * u) + "H" + (x + w - (n - 1 - k) * u);
  d += "V" + (y + w - n * u);
  for (let k = 0; k < n; k++) d += "H" + (x + w - (k + 1) * u) + "V" + (y + w - (n - 1 - k) * u);
  d += "H" + (x + n * u);
  for (let k = 0; k < n; k++) d += "V" + (y + w - (k + 1) * u) + "H" + (x + (n - 1 - k) * u);
  d += "V" + (y + n * u);
  for (let k = 0; k < n; k++) d += "H" + (x + (k + 1) * u) + "V" + (y + (n - 1 - k) * u);
  return d + "Z";
}

function PixelLotus({ T }: { T: number }) {
  const beats = useBeats(T);
  const sprites = useGlyphSprites();
  const { p, bloom, flash, pulse } = beats;
  const rotF = (TAU / 12) * p;
  const rotB = TAU / 24 + rotF;
  const rotI = TAU / 24 - rotF;
  const backT = 196 + 22 * bloom;
  const frontT = 154 + 26 * bloom;
  const innerT = 92 + 22 * bloom;
  const backB = 112 + 8 * bloom;
  const frontB = 74 + 6 * bloom;
  const innerB = 52;
  const podR = 40 + 2 * pulse + 4 * bloom;
  const coreR = 18 + 14 * flash + 4 * bloom;

  const grid: (string | null)[][] = Array.from({ length: G }, () => new Array(G).fill(null));
  for (let y = 0; y < G; y++)
    for (let x = 0; x < G; x++) {
      const px = (x + 0.5) * CELL - K;
      const py = (y + 0.5) * CELL - K;
      const r = Math.hypot(px, py);
      const th = Math.atan2(py, px);
      let c: string | null = null;
      const gl = 1 - r / (262 + 16 * bloom);
      if (gl > 0) {
        const v = gl * (0.75 + 0.35 * bloom + 0.15 * flash);
        const i = Math.floor(v * 4 + (BAYER[y % 4][x % 4] + 0.5) / 16 - 0.5) - 1;
        if (i >= 0) c = RAMP.glow[Math.min(2, i)];
      }
      let P = petal(th, rotB, backB, backT);
      if (r < P.R) c = shadePetal(RAMP.back, RAMP.backLine, false, false, r, P.d, P.R, x, y, th, rotB);
      P = petal(th, rotF, frontB, frontT);
      if (r < P.R) c = shadePetal(RAMP.front, RAMP.frontLine, true, false, r, P.d, P.R, x, y, th, rotF);
      P = petal(th, rotI, innerB, innerT);
      if (r < P.R) c = shadePetal(RAMP.inner, RAMP.innerLine, false, true, r, P.d, P.R, x, y, th, rotI);
      if (r < podR + 16) {
        const v = (r - podR * 0.6) / (podR * 0.4 + 16);
        const i = dith(Math.min(0.999, Math.max(0, v)), 3, x, y);
        if (v < 1) c = [RAMP.pod[1], RAMP.inner[1], c || RAMP.inner[2]][i];
      }
      {
        const bud = petal(th * 1.5, rotI * 1.5 + TAU / 24, podR * 0.55, podR);
        if (r < bud.R) {
          const q = r / bud.R;
          if (bud.R - r < CELL * 1.05 && q > 0.6) c = RAMP.pod[3];
          else
            c =
              RAMP.pod[
                dith(
                  Math.min(0.999, 0.2 + 0.75 * q + 0.25 * bud.d - 0.5 * Math.max(0, 1 - r / coreR)),
                  5,
                  x,
                  y
                )
              ];
        }
      }
      if (r < coreR * 0.55) c = RAMP.pod[0];
      grid[y][x] = c;
    }

  const put = (ux: number, uy: number, col: string, s = 1) => {
    const x0 = Math.floor(ux / CELL);
    const y0 = Math.floor(uy / CELL);
    for (let j = 0; j < s; j++)
      for (let i = 0; i < s; i++) {
        const x = x0 + i;
        const y = y0 + j;
        if (x >= 0 && y >= 0 && x < G && y < G) grid[y][x] = col;
      }
  };
  for (let k = 0; k < 72; k++) {
    const a = (k * TAU) / 72 + (TAU / 36) * p;
    put(K + Math.cos(a) * 253, K + Math.sin(a) * 253, RAMP.orbit);
  }
  for (let k = 0; k < 12; k++) {
    const a = ((k * 30 + 7.5) * Math.PI) / 180 + rotF;
    const r = 150 + 14 * bloom;
    put(K + Math.cos(a) * r - CELL / 2, K + Math.sin(a) * r - CELL / 2, RAMP.dot, 2);
  }
  for (let k = 0; k < 6; k++) {
    const ph = frac(p * 2 + k / 6);
    const a = k * 1.9 + 0.6;
    const r = 214 + 22 * Math.sin(k * 2.3);
    if (ph < 0.22) {
      const cx = K + Math.cos(a) * r;
      const cy = K + Math.sin(a) * r;
      const s = ph < 0.11 ? 1 : 2;
      put(cx, cy, RAMP.dot);
      for (let j = 1; j <= s; j++) {
        put(cx + j * CELL, cy, RAMP.pod[2]);
        put(cx - j * CELL, cy, RAMP.pod[2]);
        put(cx, cy + j * CELL, RAMP.pod[2]);
        put(cx, cy - j * CELL, RAMP.pod[2]);
      }
    }
  }

  // One path per colour (run-length merged) instead of thousands of rects.
  const byColor: Record<string, string> = {};
  for (let y = 0; y < G; y++) {
    let x = 0;
    while (x < G) {
      const c = grid[y][x];
      let e = x + 1;
      while (e < G && grid[y][e] === c) e++;
      if (c) {
        const w = (e - x) * CELL;
        byColor[c] = (byColor[c] || "") + `M${x * CELL},${y * CELL}h${w}v${CELL + 0.05}h${-w}z`;
      }
      x = e;
    }
  }

  const snap = (v: number) => Math.round(v / CELL) * CELL;
  return (
    <svg
      viewBox="0 0 560 560"
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      style={{ position: "absolute", inset: 0, overflow: "visible" }}
    >
      {Object.keys(byColor).map((col) => (
        <path key={col} d={byColor[col]} fill={col} />
      ))}
      {beats.glyphs.map((g, i) => {
        if (g.k > 0.94) return null;
        const sc = Math.max(0.25, Math.round((1 - 0.75 * g.k) * 4) / 4);
        const w = snap(40 * sc);
        const x = snap(g.x - w / 2);
        const y = snap(g.y - w / 2);
        const u = CELL * (sc > 0.5 ? 1 : 0.5);
        const trail: React.ReactNode[] = [];
        if (g.k > 0.04)
          for (let j = 1; j <= 4; j++) {
            const f = 0.07 * j * (1 - g.k);
            trail.push(
              <rect
                key={j}
                x={snap(g.x + (g.x - K) * f - CELL / 2)}
                y={snap(g.y + (g.y - K) * f - CELL / 2)}
                width={CELL}
                height={CELL}
                fill={j < 2 ? RAMP.pod[1] : RAMP.front[3]}
                opacity={1 - j * 0.22}
              />
            );
          }
        const g2 = Math.round((w * 0.7) / 2.5) * 2.5;
        return (
          <g key={i}>
            {trail}
            <path d={stepTile(x + u, y + u, w, 2, u)} fill={RAMP.shadow} />
            <path d={stepTile(x, y, w, 2, u)} fill={RAMP.tileLine} />
            <path d={stepTile(x + u, y + u, w - 2 * u, 1, u)} fill={RAMP.tile} />
            <image
              href={sprites[i]}
              x={x + (w - g2) / 2}
              y={y + (w - g2) / 2}
              width={g2}
              height={g2}
              preserveAspectRatio="none"
              style={{ imageRendering: "pixelated" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Clock + mount ---------- */
const FONT_ID = "hero-sun-fonts";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@600&family=Noto+Sans+Bengali:wght@600&family=Noto+Sans+Tamil:wght@600&family=Noto+Sans+Telugu:wght@600&family=Noto+Sans+Kannada:wght@600&family=Noto+Sans+Gujarati:wght@600&family=Noto+Sans+Malayalam:wght@600&family=Noto+Sans+Gurmukhi:wght@600&display=swap";

function useHeroClock() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [T, setT] = useState(STILL_T);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastSetRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined" && !document.getElementById(FONT_ID)) {
      const link = document.createElement("link");
      link.id = FONT_ID;
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!mounted || reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const loop = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      // ~30fps cap: the pixel grid is heavy and rotates slowly.
      if (ts - lastSetRef.current >= 30) {
        lastSetRef.current = ts;
        setT(((ts - startRef.current) / 1000) % L);
      }
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
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [mounted, reduced]);

  return { mounted, T: reduced ? STILL_T : T, wrapRef };
}

export default function HeroSun({ variant = "Pixel" }: { variant?: "Pixel" | "Organic" }) {
  const { mounted, T, wrapRef } = useHeroClock();
  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      {mounted && (
        <div style={{ position: "absolute", inset: "10%" }}>
          {variant === "Pixel" ? <PixelLotus T={T} /> : <OrganicLotus T={T} />}
        </div>
      )}
    </div>
  );
}
