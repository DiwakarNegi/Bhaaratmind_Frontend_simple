"use client";

/* ============================================================
   VOICES — PIXEL v2 ("dusk scene")
   Ported from the Omelette export's voices-pixel2.jsx: a full
   pixel-art dusk scene in the site's illustration language —
   banded dithered sky, drifting clouds, birds, stars, far hills,
   sage fields and grass — with a CPU-style "one intelligence"
   core (pins, traces, a 4x4 die, scanline, status readout) and
   pixel type throughout. Shared math/clock live in ./voices/shared.
   ============================================================ */

import { useMemo, useContext, createContext } from "react";
import type { ReactNode } from "react";
import {
  C,
  VOICES,
  ANSWER,
  NATIVE_FONT,
  LAYOUT,
  MOTION,
  tw,
  lin,
  B,
  PULSE_DUR,
  voiceAct,
  lineDraw,
  fadeOut,
  arrived,
  waveH,
  bez,
  hash3,
  CORE_PATTERN,
  typed,
  TOTAL,
  useFontsTick,
  useVoicesClock,
  type Voice,
  type Beats,
  type Cell,
} from "./voices/shared";

/* ---------- v2 geometry ---------- */
const PX = 6;
const snap = (v: number) => Math.round(v / PX) * PX;
const SUN = { x: 798, y: 336 };
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const SKY = ["#1c140e", "#22180f", "#291c12", "#312015", "#3a2517", "#452b1a", "#52321d"];
const HORIZON = 588;
const ROWY = (i: number) => 102 + i * 80;
const CPU = { x: 690, y: 228, s: 216, pin: 18 };
const pinY = (i: number) => CPU.y + 30 + i * 30;
const inPt = (i: number): Cell => [CPU.x - CPU.pin - PX, pinY(i) + PX / 2];

const cells = (list: Cell[], s = PX) =>
  list.map(([x, y]) => `M${x},${y}h${s}v${s}h-${s}z`).join("");

function stepRect(x: number, y: number, w: number, h: number, n: number) {
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

const CLOUD = ["..XXXX......", ".XXXXXXX.XX.", "XXXXXXXXXXXX", ".XXXXXXXXXX."];
const BIRD = [
  ["X...X", ".X.X.", "..X.."],
  [".....", "XX.XX", "..X.."],
];
const sprite = (rows: string[], x: number, y: number, s: number): Cell[] => {
  const out: Cell[] = [];
  rows.forEach((r, j) =>
    [...r].forEach((ch, k) => {
      if (ch === "X") out.push([x + k * s, y + j * s]);
    })
  );
  return out;
};

/* ---------- Text ---------- */
const Tick = createContext(0);

function PixText({
  x,
  y,
  size,
  fill,
  children,
  anchor,
  scale = 1,
  weight = 600,
}: {
  x: number;
  y: number;
  size: number;
  fill: string;
  children: string;
  anchor?: "start" | "middle" | "end";
  scale?: number;
  weight?: number;
}) {
  const tick = useContext(Tick);
  const img = useMemo(() => {
    const fs = Math.round(size / scale);
    const font = `${weight} ${fs}px ${NATIVE_FONT}`;
    const cv = document.createElement("canvas");
    const cx = cv.getContext("2d")!;
    cx.font = font;
    const w = Math.ceil(cx.measureText(children).width) + 2;
    const h = Math.ceil(fs * 1.6);
    cv.width = w;
    cv.height = h;
    cx.font = font;
    cx.fillStyle = fill;
    cx.fillText(children, 1, Math.round(fs * 1.15));
    const d = cx.getImageData(0, 0, w, h);
    for (let k = 3; k < d.data.length; k += 4) d.data[k] = d.data[k] > 70 ? 255 : 0;
    cx.putImageData(d, 0, 0);
    return {
      src: cv.toDataURL(),
      w: w * scale,
      h: h * scale,
      base: Math.round(fs * 1.15) * scale,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, size, fill, scale, weight, tick]);
  const ox = anchor === "middle" ? -img.w / 2 : anchor === "end" ? -img.w : 0;
  return (
    <image
      href={img.src}
      x={snap(x + ox)}
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
  size = 12,
  fill,
  children,
  anchor,
  ls = 1.5,
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

function VT({
  x,
  y,
  size = 26,
  fill,
  children,
  anchor,
}: {
  x: number;
  y: number;
  size?: number;
  fill: string;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      textAnchor={anchor || "start"}
      style={{ fontFamily: "VT323, monospace" }}
    >
      {children}
    </text>
  );
}

/* ---------- Static scene ---------- */
type Scene = {
  bands: string[];
  glow1: string;
  glow2: string;
  glow3: string;
  hill: string;
  field: string[];
  grass: string;
  stars: [number, number, number][];
  lines: Cell[][];
};

function useScene(): Scene {
  return useMemo(() => {
    const L = LAYOUT;
    const G = 12;
    // banded sky with Bayer-dithered seams
    const bands: Cell[][] = SKY.map(() => []);
    const bandH = HORIZON / (SKY.length - 0.5);
    for (let y = 0; y < HORIZON; y += G)
      for (let x = 0; x < L.W; x += G) {
        const f = y / bandH;
        const b = Math.floor(f);
        const frac = f - b;
        const th = (BAYER[(y / G) % 4][(x / G) % 4] + 0.5) / 16;
        bands[Math.min(SKY.length - 1, frac > th ? b + 1 : b)].push([x, y]);
      }
    const glow1: Cell[] = [];
    const glow2: Cell[] = [];
    const glow3: Cell[] = [];
    for (let x = 0; x < L.W; x += G)
      for (let y = 0; y < HORIZON; y += G) {
        const d = Math.hypot((x - SUN.x) / 560, (y - SUN.y) / 340);
        if (d >= 1) continue;
        const it = Math.pow(1 - d, 1.3);
        const th = (BAYER[(y / G) % 4][(x / G) % 4] + 0.5) / 16;
        if (it > th) glow1.push([x, y]);
        if (it * 1.6 - 0.6 > th) glow2.push([x, y]);
        if (it * 2.2 - 1.4 > th) glow3.push([x, y]);
      }
    // horizon: far hills + sage field rows + near grass
    const hill: Cell[] = [];
    const field: Cell[][] = [[], [], []];
    const grass: Cell[] = [];
    for (let x = 0; x < L.W; x += PX) {
      const hTop = snap(HORIZON - 18 - 14 * Math.sin(x / 210) - 10 * Math.sin(x / 73 + 1));
      for (let y = hTop; y < HORIZON + 6; y += PX) hill.push([x, y]);
    }
    for (let y = HORIZON; y < L.H; y += PX) {
      const row = Math.floor((y - HORIZON) / PX);
      for (let x = 0; x < L.W; x += PX) {
        const stripe = (((x + row * 9) / (18 + row * 3)) | 0) % 2;
        field[row < 3 ? 0 : stripe ? 1 : 2].push([x, y]);
      }
    }
    for (let k = 0; k < 90; k++) {
      const x = snap(hash3(k, 7, 1) * 1590);
      const h = 1 + Math.floor(hash3(k, 2, 5) * 3);
      for (let j = 0; j < h; j++)
        grass.push([x, HORIZON + 12 + snap(hash3(k, 4, 4) * 30) - j * PX]);
    }
    const stars: [number, number, number][] = [];
    for (let k = 0; k < 60; k++) {
      const x = snap(hash3(k, 1, 2) * 1580);
      const y = snap(hash3(k, 3, 4) * 300);
      if (
        (x < 480 && y > 60) ||
        Math.hypot(x - SUN.x, y - SUN.y) < 230 ||
        (x > 1090 && y > 160)
      )
        continue;
      stars.push([x, y, k]);
    }
    const lines = VOICES.map((v, i) => {
      const [x1, y1] = inPt(i);
      const out: Cell[] = [];
      let prev: Cell | null = null;
      for (let s = 0; s <= 500; s++) {
        const [bx, by] = bez(L.lineX0, ROWY(i), x1, y1, s / 500);
        const c: Cell = [snap(bx), snap(by) - PX / 2];
        if (prev && c[0] === prev[0] && c[1] === prev[1]) continue;
        if (prev && c[0] !== prev[0] && c[1] !== prev[1]) out.push([c[0], prev[1]]);
        out.push(c);
        prev = c;
      }
      return out;
    });
    return {
      bands: bands.map((b) => cells(b, G)),
      glow1: cells(glow1, G),
      glow2: cells(glow2, G),
      glow3: cells(glow3, G),
      hill: cells(hill),
      field: field.map((f) => cells(f)),
      grass: cells(grass),
      stars,
      lines,
    };
  }, []);
}

/* ---------- Scene pieces ---------- */
function Chip({ i, v, T, B, ask }: { i: number; v: Voice; T: number; B: Beats; ask: number }) {
  const L = LAYOUT;
  const cy = ROWY(i);
  const x = L.chipX;
  const y = cy - 24;
  const act = voiceAct(T, B, i);
  const icon: Cell[] = [];
  for (let b = 0; b < 5; b++) {
    const h = Math.max(1, Math.round(waveH(T, i, b + 4, act) * 3));
    for (let k = -(h - 1); k <= h - 1; k++) icon.push([x + 18 + b * 6, cy - 1.5 + k * 3]);
  }
  const lit = ask > 0.5;
  return (
    <g>
      <path d={stepRect(x + PX, y + PX, L.chipW, L.chipH, 2)} fill="#100b07" opacity={0.7} />
      <path
        d={stepRect(x, y, L.chipW, L.chipH, 2)}
        fill={lit ? C.a500 : act > 0.5 ? "#6a4c36" : "#3e2e23"}
      />
      <path
        d={stepRect(x + PX / 2, y + PX / 2, L.chipW - PX, L.chipH - PX, 2)}
        fill={lit ? "#4a2c1a" : C.chip}
      />
      <rect x={x + 9} y={y + 6} width={L.chipW - 18} height={3} fill={lit ? C.a400 : "#4a382b"} opacity={0.7} />
      <path d={icon.map(([a, b]) => `M${a},${b}h3v3h-3z`).join("")} fill={v.tone} opacity={0.45 + 0.55 * act} />
      <g opacity={0.5 + 0.5 * act}>
        <PixText x={x + 54} y={cy + 8} size={21} fill={C.n100}>
          {v.native}
        </PixText>
        <Silk x={x + 138} y={cy + 5} size={10} fill={C.n300} ls={1}>
          {v.name}
        </Silk>
      </g>
    </g>
  );
}

function Wave({ i, v, T, B }: { i: number; v: Voice; T: number; B: Beats }) {
  const L = LAYOUT;
  const cy = ROWY(i) - PX / 2;
  const act = voiceAct(T, B, i);
  const c: Cell[] = [];
  const hot: Cell[] = [];
  for (let b = 0; b < L.bars; b++) {
    const h = Math.max(1, Math.round(waveH(T, i, b, act) * 4));
    for (let k = -(h - 1); k <= h - 1; k++)
      (b === 6 && act > 0.4 ? hot : c).push([L.waveX + b * L.barGap, cy + k * PX]);
  }
  return (
    <g>
      <path d={cells(c)} fill={v.tone} opacity={0.4 + 0.6 * act} />
      <path d={cells(hot)} fill={C.n100} />
    </g>
  );
}

function Line({ i, v, list, T, B }: { i: number; v: Voice; list: Cell[]; T: number; B: Beats }) {
  const n = Math.floor(list.length * lineDraw(T, B, i) * fadeOut(T, B));
  const p = lin(T, B.pulse(i), B.pulse(i) + PULSE_DUR);
  const head = Math.floor(MOTION.draw(p) * (list.length - 1));
  const trail: [Cell, number, number][] = [];
  if (p > 0 && p < 1)
    for (let k = 0; k < 10; k++) if (head - k >= 0) trail.push([list[head - k], 1 - k / 10, k]);
  const dash = list.slice(0, n).filter((c, k) => (k + Math.floor(T * 10)) % 6 === 0);
  return (
    <g>
      <path d={cells(list.slice(0, n))} fill={v.tone} opacity={0.45} />
      <path d={cells(dash)} fill={v.tone} opacity={0.9 * voiceAct(T, B, i)} />
      {trail.map(([c, o, k]) => (
        <rect
          key={k}
          x={c[0] - (k ? 0 : 3)}
          y={c[1] - (k ? 0 : 3)}
          width={k ? PX : PX * 2}
          height={k ? PX : PX * 2}
          fill={k < 2 ? C.n100 : v.tone}
          opacity={o}
        />
      ))}
    </g>
  );
}

function Cpu({ T, B }: { T: number; B: Beats }) {
  const { x, y, s, pin } = CPU;
  const fo = fadeOut(T, B);
  const thinking = T >= B.think && T < B.think + 1.5;
  const lit = tw(T, B.think + 1.3, B.think + 1.6) * (1 - tw(T, B.reset, B.reset + 0.6));
  const arr = VOICES.map((v, i) => arrived(T, B, i));
  const pins: { dim: Cell[]; hot: Cell[] } = { dim: [], hot: [] };
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < pin; k += PX) (arr[i] > 0.5 ? pins.hot : pins.dim).push([x - pin + k, pinY(i)]);
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < pin; k += PX) {
      const p = CPU.x + 30 + i * 30;
      pins.dim.push([p, y - pin + k], [p, y + s + k]);
      if (i === 2 && T >= B.answer - 0.1 && fo > 0.5) pins.hot.push([x + s + k, pinY(i)]);
      else pins.dim.push([x + s + k, pinY(i)]);
    }
  const dx = x + 42;
  const dy = y + 42;
  const ds = s - 84;
  const traces: { dim: Cell[]; hot: Cell[] } = { dim: [], hot: [] };
  for (let i = 0; i < 6; i++) {
    const py = pinY(i);
    const ty = dy + 12 + Math.min(5, i) * 24;
    const list = arr[i] > 0.5 ? traces.hot : traces.dim;
    for (let k = x + 6; k < x + 24; k += PX) list.push([k, py]);
    const y0 = Math.min(py, ty);
    const y1 = Math.max(py, ty);
    for (let k = y0; k <= y1; k += PX) list.push([x + 24, k]);
    for (let k = x + 24; k < dx; k += PX) list.push([k, ty]);
  }
  for (let i = 0; i < 6; i++) {
    const p = x + 36 + i * 30;
    traces.dim.push([p, y + 12], [p, y + 18], [p, y + s - 24], [p, y + s - 18]);
  }
  const cores: ReactNode[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      const cx = dx + 12 + c * 30;
      const cy = dy + 12 + r * 30;
      const on = CORE_PATTERN[(r + c) % 6][c % 3];
      let fill = "#3a2214";
      let hi: string | null = null;
      if (thinking && hash3(r, c, Math.floor(T * 14)) > 0.6 - 0.3 * lin(T, B.think, B.think + 1.5)) {
        fill = c % 2 ? C.a400 : C.a300;
        hi = C.n100;
      } else if (on && lit > 0.5) {
        fill = [C.a500, C.a400, C.a300, C.s400][(r * 4 + c) % 4];
        hi = C.n100;
      } else if (arr[Math.min(5, r + c)] > 0.5 && (r + c) % 2 === 0) {
        fill = C.a700;
      }
      cores.push(
        <g key={r + "-" + c}>
          <rect x={cx} y={cy} width={24} height={24} fill={fill} />
          <rect x={cx} y={cy} width={24} height={3} fill={hi || "#4a2c1a"} opacity={hi ? 0.6 : 1} />
          <rect x={cx + 9} y={cy + 9} width={PX} height={PX} fill={hi || "#2a180e"} opacity={hi ? 0.9 : 1} />
        </g>
      );
    }
  const scanY = thinking ? snap(dy + (ds - PX) * (((T - B.think) * 2.2) % 1)) : null;
  const leds = [0, 1, 2, 3].map((k) => {
    const on = thinking ? hash3(k, 9, Math.floor(T * 10)) > 0.5 : lit > 0.5 || arr[k] > 0.5;
    return (
      <rect
        key={k}
        x={x + s - 48 + k * 9}
        y={y + 21}
        width={PX}
        height={PX}
        fill={on ? [C.a400, C.s400, C.a300, C.n100][k] : "#3a2214"}
      />
    );
  });
  return (
    <g>
      <path
        d={stepRect(x - 18, y - 18, s + 36, s + 36, 5)}
        fill="none"
        stroke={C.a700}
        strokeWidth={2}
        strokeDasharray="3 9"
        opacity={0.5 + 0.5 * lit}
      />
      <path d={cells(pins.dim)} fill={C.n500} />
      <path d={cells(pins.hot)} fill={C.a300} />
      <path d={stepRect(x + PX, y + PX, s, s, 3)} fill="#0f0a06" opacity={0.6} />
      <path d={stepRect(x, y, s, s, 3)} fill={C.a600} />
      <path d={stepRect(x + 3, y + 3, s - 6, s - 6, 3)} fill="#3a2415" />
      <rect x={x + 9} y={y + 9} width={s - 18} height={3} fill={C.a700} />
      <path d={cells(traces.dim)} fill={C.a800} />
      <path d={cells(traces.hot)} fill={C.a400} />
      <path
        d={stepRect(dx - 6, dy - 6, ds + 12, ds + 12, 2)}
        fill={C.a500}
        opacity={0.5 + 0.5 * Math.max(lit, thinking ? 1 : 0)}
      />
      <path d={stepRect(dx, dy, ds, ds, 1)} fill="#24150c" />
      {cores}
      {scanY !== null && <rect x={dx} y={scanY} width={ds} height={PX} fill={C.a300} opacity={0.5} />}
      <rect x={x + 18} y={y + 21} width={PX} height={PX} fill={C.n300} />
      <Silk x={x + 30} y={y + 29} size={9} fill={C.a300} ls={1.5}>
        BM-1
      </Silk>
      {leds}
      <Silk x={x + s / 2} y={y + s - 8} size={8} fill={C.a400} anchor="middle" ls={2}>
        {lit > 0.5 ? "READY" : thinking ? "THINKING" : "LISTENING"}
      </Silk>
    </g>
  );
}

function Sky({ T, S, total }: { T: number; S: Scene; total: number }) {
  const ph = T / total;
  const tick = Math.floor(T * 3);
  const out: ReactNode[] = [];
  const clouds: [number, number, number, number][] = [
    [520, 54, 0.0, 2],
    [930, 92, 0.33, 1.5],
    [1240, 40, 0.66, 2],
    [210, 30, 0.5, 1.5],
  ];
  clouds.forEach(([cx, cy, o, sc], n) => {
    const dxc = snap(40 * Math.sin(2 * Math.PI * (ph + o)));
    const size = (PX * sc) / 1.5;
    out.push(
      <path key={"c" + n} d={cells(sprite(CLOUD, cx + dxc, cy, size), size)} fill={C.n700} opacity={0.35} />
    );
  });
  for (let n = 0; n < 3; n++) {
    const f = (ph + n * 0.07) % 1;
    const bx = snap(1640 - f * 1900);
    const by = snap(70 + n * 22 + 10 * Math.sin(f * 12));
    out.push(
      <path key={"b" + n} d={cells(sprite(BIRD[(Math.floor(T * 6) + n) % 2], bx, by, 3), 3)} fill={C.n800} />
    );
  }
  return (
    <g>
      {S.stars.map(([sx, sy, k]) => (
        <rect
          key={k}
          x={sx}
          y={sy}
          width={3}
          height={3}
          fill={C.a300}
          opacity={hash3(k, tick, 9) > 0.8 ? 0.6 : 0.18}
        />
      ))}
      {out}
    </g>
  );
}

function Output({ T, B }: { T: number; B: Beats }) {
  const cy = pinY(2);
  const fo = fadeOut(T, B);
  const c: Cell[] = [];
  const hot: Cell[] = [];
  const x0 = CPU.x + CPU.s + CPU.pin + PX;
  const lead = tw(T, B.answer - 0.1, B.answer + 0.25);
  for (let x = x0; x < x0 + (1084 - x0) * lead; x += PX * 2) c.push([snap(x), cy]);
  for (let b = 0; b < 11; b++) {
    const on = tw(T, B.answer + b * 0.045, B.answer + b * 0.045 + 0.2);
    if (on <= 0) continue;
    const env = Math.exp(-Math.pow((b - 5) / 3.4, 2));
    const osc = 0.6 + 0.4 * Math.sin(T * 9 + b * 1.3);
    const h = Math.max(1, Math.round(on * env * osc * 5));
    const x = snap(x0 + 12 + b * 12);
    for (let j = -(h - 1); j <= h - 1; j++) (b === 5 ? hot : c).push([x, cy + j * PX]);
  }
  if (tw(T, B.answer + 0.5, B.answer + 0.7) > 0)
    for (let j = 0; j < 4; j++)
      for (let q = -(3 - j); q <= 3 - j; q++) c.push([1086 + j * PX, cy + q * PX]);
  return (
    <g opacity={fo}>
      <path d={cells(c)} fill={C.a500} />
      <path d={cells(hot)} fill={C.a300} />
    </g>
  );
}

function Card({ T, B }: { T: number; B: Beats }) {
  const x = 1110;
  const y = 162;
  const w = 438;
  const h = 348;
  const rev =
    tw(T, B.answer + 0.5, B.answer + 1.1, MOTION.draw) *
    (1 - tw(T, B.reset, B.reset + 0.6, MOTION.draw));
  const hr = Math.round(((h + 12) * rev) / 12) * 12;
  if (hr <= 0) return null;
  const qA = tw(T, B.answer + 0.95, B.answer + 1.35);
  const foot = tw(T, B.answer + 3.2, B.answer + 3.6);
  const total = ANSWER.pxLines.join("").length;
  const typeP = lin(T, B.answer + 1.4, B.answer + 3.2);
  const lines = typed(ANSWER.pxLines, total * typeP);
  const cl = Math.max(0, lines.findIndex((l, k) => l.length < ANSWER.pxLines[k].length));
  return (
    <g>
      <clipPath id="px2clip">
        <rect x={x - 6} y={y - 6} width={w + 18} height={hr} />
      </clipPath>
      <g clipPath="url(#px2clip)">
        <path d={stepRect(x + PX, y + PX, w, h, 3)} fill="#100b07" opacity={0.6} />
        <path d={stepRect(x, y, w, h, 3)} fill={C.a400} />
        <path d={stepRect(x + 3, y + 3, w - 6, h - 6, 3)} fill={C.n100} />
        <rect x={x + 3} y={y + 54} width={w - 6} height={3} fill={C.n200} />
        <rect x={x + 26} y={y + 24} width={12} height={12} fill={C.a500} />
        <Silk x={x + 48} y={y + 35} size={12} fill={C.a700} ls={2}>
          {ANSWER.kicker}
        </Silk>
        {[0, 1, 2].map((d) => (
          <rect key={d} x={x + w - 60 + d * 14} y={y + 26} width={PX} height={PX} fill={d === 0 ? C.a500 : C.n300} />
        ))}
        <g opacity={qA}>
          <path d={stepRect(x + 24, y + 72, w - 48, 84, 2)} fill={C.a200} />
          <Silk x={x + 42} y={y + 98} size={10} fill={C.a700} ls={2}>
            {ANSWER.asked}
          </Silk>
          <PixText x={x + 42} y={y + 137} size={22} fill={C.ink} weight={500}>
            {ANSWER.q}
          </PixText>
        </g>
        {lines.map((l, j) => (
          <VT key={j} x={x + 30} y={y + 196 + j * 28} size={27} fill={C.ink}>
            {l}
          </VT>
        ))}
        {typeP > 0 && foot < 1 && Math.floor(T * 3) % 2 === 0 && (
          <rect x={x + 32 + lines[cl].length * 10.8} y={y + 176 + cl * 28} width={10} height={22} fill={C.a500} />
        )}
        <g opacity={foot}>
          <Silk x={x + 30} y={y + 324} size={10} fill={C.n600} ls={2}>
            {ANSWER.meta}
          </Silk>
          <path d={stepRect(x + w - 222, y + 300, 198, 36, 1)} fill={C.a500} />
          <VT x={x + w - 123} y={y + 325} size={24} fill={C.n100} anchor="middle">
            {ANSWER.cta}
          </VT>
        </g>
      </g>
    </g>
  );
}

function Piece({ T }: { T: number }) {
  const S = useScene();
  const L = LAYOUT;
  const think = tw(T, B.think - 0.3, B.think + 0.4) * (1 - tw(T, B.answer + 0.5, B.answer + 2));
  const ask = tw(T, B.answer, B.answer + 0.2) * (1 - tw(T, B.reset, B.reset + 0.4));
  const count = Math.round(22 * lin(T, B.on(0), B.on(5) + 0.8) * fadeOut(T, B));
  const tick = useFontsTick();
  return (
    <Tick.Provider value={tick}>
      <svg
        viewBox={`0 0 ${L.W} ${L.H}`}
        width={L.W}
        height={L.H}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <rect width={L.W} height={L.H} fill={SKY[0]} />
        {S.bands.map((d, n) => (
          <path key={n} d={d} fill={SKY[n]} />
        ))}
        <path d={S.glow1} fill={C.a900} opacity={0.7} />
        <path d={S.glow2} fill={C.a800} opacity={0.45 + 0.35 * think} />
        <path d={S.glow3} fill={C.a700} opacity={0.25 + 0.45 * think} />
        <Sky T={T} S={S} total={TOTAL} />
        <path d={S.hill} fill="#2c1d13" />
        <path d={S.field[0]} fill="#3d472b" />
        <path d={S.field[1]} fill="#3d472b" />
        <path d={S.field[2]} fill="#323a23" />
        <path d={S.grass} fill="#56633f" />
        {VOICES.map((v, i) => (
          <Line key={"l" + i} i={i} v={v} list={S.lines[i]} T={T} B={B} />
        ))}
        {VOICES.map((v, i) => (
          <Wave key={"w" + i} i={i} v={v} T={T} B={B} />
        ))}
        {VOICES.map((v, i) => (
          <Chip key={"c" + i} i={i} v={v} T={T} B={B} ask={i === 0 ? ask : 0} />
        ))}
        <Cpu T={T} B={B} />
        <Output T={T} B={B} />
        <Card T={T} B={B} />
        <Silk x={SUN.x} y={540} size={13} fill={C.n300} anchor="middle" ls={2.5}>
          ONE INTELLIGENCE
        </Silk>
        <PixText x={SUN.x} y={572} size={22} fill={C.a300} anchor="middle">
          एक बुद्धि
        </PixText>
        <rect x={L.chipX} y={30} width={PX} height={PX} fill={C.a500} opacity={Math.floor(T * 2) % 2 ? 1 : 0.4} />
        <Silk x={L.chipX + 16} y={39} size={12} fill={C.n400} ls={2}>
          {`${count}+ VOICES IN`}
        </Silk>
      </svg>
    </Tick.Provider>
  );
}

/* ---------- Clock + mount ---------- */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Silkscreen&family=VT323&family=Noto+Sans+Devanagari:wght@500;600&family=Noto+Sans+Tamil:wght@600&family=Noto+Sans+Bengali:wght@600&family=Noto+Sans+Telugu:wght@600&family=Noto+Sans+Kannada:wght@600&display=swap";
const FAMS = [
  '500 16px "Noto Sans Devanagari"',
  '600 16px "Noto Sans Devanagari"',
  '600 16px "Noto Sans Tamil"',
  '600 16px "Noto Sans Bengali"',
  '600 16px "Noto Sans Telugu"',
  '600 16px "Noto Sans Kannada"',
];

export default function VoicesPixel2() {
  const { mounted, T, wrapRef } = useVoicesClock({
    fontId: "voices-pixel2-fonts",
    fontHref: FONT_HREF,
    fams: FAMS,
  });
  return (
    <div className="voices-anim" ref={wrapRef}>
      {mounted && <Piece T={T} />}
    </div>
  );
}
