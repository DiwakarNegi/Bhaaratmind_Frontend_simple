"use client";

/* ============================================================
   VOICES — 3D
   Ported from the Omelette export's voices-3d.jsx: a tiny
   software perspective camera projects the whole section to SVG;
   box "solids" (chips, waveforms, the core, output bars and a
   swinging answer card) are face-lit and depth-sorted, with a
   slow camera orbit + push-in. Shared math/clock live in
   ./voices/shared. Orbit mode (the variant the HTML mounts).
   ============================================================ */

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
  CUES,
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
  CORE_COLORS,
  typed,
  clamp,
  TOTAL,
  useVoicesClock,
  type Voice,
  type Beats,
} from "./voices/shared";

/* ---------- Linear algebra + camera ---------- */
type Vec = number[];
type Face = { name: string; vis: boolean; z: number; lit: number; pts: number[][] };
type Solid = { faces: Face[]; z: number; scr: number[][] };
type View = {
  tf: (p: Vec) => Vec;
  proj: (c: Vec) => Vec;
  P: (p: Vec) => Vec;
  dist: number;
};
type Item = { z: number; el: ReactNode };
type PolyOpts = {
  back?: boolean;
  alpha?: number;
  round?: number;
  stroke?: string;
  sw?: number;
  faceColor?: Record<string, string>;
};

const LIGHT = (() => {
  const v = [-0.35, 0.8, 0.55];
  const m = Math.hypot(...v);
  return v.map((k) => k / m);
})();

function hexRgb(h: string): number[] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(h: string, k: number) {
  const [r, g, b] = hexRgb(h);
  const f = (c: number) => Math.round(clamp(c * k, 0, 255));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const W = (x: number, y: number, z = 0): Vec => [x - 800, 330 - y, z];

function makeView(yaw: number, pitch: number, tx: number, dist: number, f: number): View {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const rot = (x: number, y: number, z: number): Vec => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
  };
  const tf = (p: Vec) => rot(p[0] - tx, p[1], p[2]);
  const proj = (c: Vec): Vec => {
    const s = f / (dist - c[2]);
    return [800 + c[0] * s, 330 - c[1] * s, c[2], s];
  };
  return { tf, proj, P: (p: Vec) => proj(tf(p)), dist };
}

const FACES: Record<string, number[]> = {
  front: [4, 5, 7, 6],
  back: [0, 2, 3, 1],
  right: [1, 3, 7, 5],
  left: [0, 4, 6, 2],
  top: [2, 6, 7, 3],
  bottom: [0, 1, 5, 4],
};

function solid(view: View, corners: Vec[]): Solid {
  const cam = corners.map(view.tf);
  const scr = cam.map(view.proj);
  const faces: Face[] = Object.entries(FACES).map(([name, idx]) => {
    const p = idx.map((k) => cam[k]);
    const n = cross(sub(p[1], p[0]), sub(p[3], p[0]));
    const c = p.reduce((a, q) => [a[0] + q[0] / 4, a[1] + q[1] / 4, a[2] + q[2] / 4], [0, 0, 0]);
    const vis = dot(n, sub([0, 0, view.dist], c)) > 0;
    const wn = cross(sub(corners[idx[1]], corners[idx[0]]), sub(corners[idx[3]], corners[idx[0]]));
    const m = Math.hypot(...wn) || 1;
    const lit = 0.5 + 0.55 * Math.max(0, dot(wn.map((k) => k / m), LIGHT));
    return { name, vis, z: c[2], lit, pts: idx.map((k) => scr[k]) };
  });
  const z = cam.reduce((a, q) => a + q[2] / 8, 0);
  return { faces, z, scr };
}

const boxCorners = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Vec[] =>
  [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [
    i & 1 ? x1 : x0,
    (i >> 1) & 1 ? y1 : y0,
    (i >> 2) & 1 ? z1 : z0,
  ]);

const ptsStr = (pts: number[][]) =>
  pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

function polys(sol: Solid, base: string, opts: PolyOpts = {}) {
  return sol.faces
    .filter((f) => (opts.back ? !f.vis : f.vis))
    .sort((a, b) => a.z - b.z)
    .map((f) => {
      const fill = shade((opts.faceColor && opts.faceColor[f.name]) || base, f.lit);
      return (
        <polygon
          key={f.name}
          points={ptsStr(f.pts)}
          fill={fill}
          fillOpacity={opts.alpha ?? 1}
          stroke={opts.stroke || (opts.round ? fill : "none")}
          strokeWidth={opts.round ? opts.round * (f.pts[0][3] || 1) : opts.sw || 0}
          strokeOpacity={opts.alpha ?? 1}
          strokeLinejoin="round"
        />
      );
    });
}

function faceMatrix(sol: Solid, w: number, h: number) {
  const P0 = sol.scr[6];
  const P1 = sol.scr[7];
  const P2 = sol.scr[4];
  return `matrix(${(P1[0] - P0[0]) / w},${(P1[1] - P0[1]) / w},${(P2[0] - P0[0]) / h},${
    (P2[1] - P0[1]) / h
  },${P0[0]},${P0[1]})`;
}

const LABEL = { fontFamily: "Figtree, sans-serif", fontWeight: 600 };

/* ---------- Scene items ---------- */
function chipItem(view: View, i: number, v: Voice, T: number, B: Beats, ask: number): Item {
  const L = LAYOUT;
  const cy = L.rowY(i);
  const act = voiceAct(T, B, i);
  const pop = 1 + 0.06 * Math.sin(Math.PI * lin(T, B.on(i), B.on(i) + 0.4));
  const z1 = 10 + (pop - 1) * 120;
  const [ax, ay] = W(L.chipX, cy - 24);
  const [bx, by] = W(L.chipX + L.chipW, cy + 24);
  const sol = solid(view, boxCorners(ax, by, -10, bx, ay, z1));
  const icon = [0, 1, 2, 3, 4].map((b) => {
    const h = 4 + 12 * (waveH(T, i, b + 4, act) - 0.1);
    return (
      <rect
        key={b}
        x={16 + b * 5}
        y={24 - h / 2}
        width={2.5}
        height={h}
        rx={1.2}
        fill={v.tone}
        opacity={0.5 + 0.5 * act}
      />
    );
  });
  return {
    z: sol.z,
    el: (
      <g key={"chip" + i}>
        {polys(sol, ask > 0.5 ? "#4a3020" : C.chip, { round: 10 })}
        <g transform={faceMatrix(sol, L.chipW, L.chipH)}>
          <rect
            x={-3}
            y={-3}
            width={L.chipW + 6}
            height={L.chipH + 6}
            rx={14}
            fill="none"
            stroke={ask > 0.5 ? C.a500 : C.chipEdge}
            strokeWidth={1.5}
            opacity={0.5 + 0.5 * Math.max(act, ask)}
          />
          {icon}
          <g opacity={0.55 + 0.45 * act}>
            <text x={50} y={31} fontSize={21} fill={C.n100} style={{ fontFamily: NATIVE_FONT, fontWeight: 700 }}>
              {v.native}
            </text>
            <text x={136} y={29} fontSize={11.5} fill={C.n300} letterSpacing={2} style={LABEL}>
              {v.name}
            </text>
          </g>
        </g>
      </g>
    ),
  };
}

function waveItems(view: View, i: number, v: Voice, T: number, B: Beats): Item[] {
  const L = LAYOUT;
  const cy = L.rowY(i);
  const act = voiceAct(T, B, i);
  const out: Item[] = [];
  for (let b = 0; b < L.bars; b++) {
    const h = Math.max(2, waveH(T, i, b, act) * 26);
    const x = L.waveX + b * 11;
    const [x0, y0] = W(x, cy - h);
    const [x1, y1] = W(x + 5, cy + h);
    const sol = solid(view, boxCorners(x0, y1, -3, x1, y0, 3));
    out.push({
      z: sol.z,
      el: (
        <g key={"w" + i + "-" + b} opacity={0.45 + 0.55 * act}>
          {polys(sol, b === 6 && act > 0.4 ? C.n100 : v.tone)}
        </g>
      ),
    });
  }
  return out;
}

function linePts(i: number): Vec[] {
  const L = LAYOUT;
  const pts: Vec[] = [];
  for (let s = 0; s <= 48; s++) {
    const t = s / 48;
    const [x, y] = bez(L.lineX0, L.rowY(i), L.coreX, L.inY(i), t);
    const zb = Math.sin(Math.PI * t) * (40 + 70 * (i - 2.5) / 2.5);
    pts.push(W(x, y, zb));
  }
  return pts;
}

function lineItems(view: View, i: number, v: Voice, T: number, B: Beats): Item[] {
  const pts = linePts(i).map(view.P);
  const out: Item[] = [];
  const draw = lineDraw(T, B, i) * fadeOut(T, B);
  const n = Math.max(0, Math.floor(pts.length * draw));
  if (n > 1) {
    const zc = pts[Math.floor(n / 2)][2];
    out.push({
      z: zc - 40,
      el: (
        <polyline
          key={"l" + i}
          points={ptsStr(pts.slice(0, n))}
          fill="none"
          stroke={v.tone}
          strokeOpacity={0.75}
          strokeWidth={2.4 * pts[0][3]}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    });
  }
  const p = lin(T, B.pulse(i), B.pulse(i) + PULSE_DUR);
  if (p > 0 && p < 1) {
    const q = pts[Math.round(MOTION.draw(p) * (pts.length - 1))];
    out.push({
      z: q[2] + 1,
      el: (
        <g key={"p" + i}>
          <circle cx={q[0]} cy={q[1]} r={20 * q[3]} fill={v.tone} opacity={0.25} />
          <circle cx={q[0]} cy={q[1]} r={7 * q[3]} fill={C.n100} />
        </g>
      ),
    });
  }
  return out;
}

function coreItem(view: View, T: number, B: Beats): Item {
  const L = LAYOUT;
  const [x0, y1] = W(L.coreX, L.coreY);
  const [x1, y0] = W(L.coreX + L.coreW, L.coreY + L.coreH);
  const bob = 6 * Math.sin(T * 1.6);
  const sol = solid(view, boxCorners(x0, y0 + bob, -70, x1, y1 + bob, 70));
  const thinking = T >= B.think && T < B.think + 1.5;
  const lit = tw(T, B.think + 1.3, B.think + 1.6) * (1 - tw(T, B.reset, B.reset + 0.6));
  const dashes: Item[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 3; c++) {
      const dx = L.coreX + 22 + c * 38;
      const cy = L.inY(r);
      const [a, b] = W(dx, cy - 5);
      const [d, e] = W(dx + 30, cy + 5);
      const ds = solid(view, boxCorners(a, e + bob, -40, d, b + bob, 40));
      let col: string = C.n800;
      if (thinking && hash3(r, c, Math.floor(T * 14)) > 0.55 - 0.3 * lin(T, B.think, B.think + 1.5)) {
        col = c === 2 ? C.a400 : C.n100;
      } else if (CORE_PATTERN[r][c] && lit > 0.5) {
        col = CORE_COLORS[c];
      }
      dashes.push({ z: ds.z, el: <g key={r + "-" + c}>{polys(ds, col, { round: 4 })}</g> });
    }
  dashes.sort((a, b) => a.z - b.z);
  return {
    z: sol.z,
    el: (
      <g key="core">
        {polys(sol, C.a800, { back: true, alpha: 0.55, round: 14 })}
        {dashes.map((d) => d.el)}
        {polys(sol, C.a700, { alpha: 0.32, stroke: C.a500, sw: 1.5 })}
      </g>
    ),
  };
}

function nodeItems(view: View, T: number, B: Beats): Item[] {
  return VOICES.map((v, i) => {
    const a = arrived(T, B, i);
    const q = view.P(W(LAYOUT.coreX, LAYOUT.inY(i), 0));
    return {
      z: q[2] + 60,
      el: (
        <g key={"n" + i}>
          {a > 0.01 && <circle cx={q[0]} cy={q[1]} r={18 * q[3] * a} fill={v.tone} opacity={0.3} />}
          <circle cx={q[0]} cy={q[1]} r={(4 + 3 * a) * q[3]} fill={a > 0.5 ? C.n100 : C.n500} />
        </g>
      ),
    };
  });
}

function outputItems(view: View, T: number, B: Beats): Item[] {
  const L = LAYOUT;
  const fo = fadeOut(T, B);
  const out: Item[] = [];
  const lead = tw(T, B.answer - 0.1, B.answer + 0.2);
  if (lead > 0) {
    const p0 = view.P(W(L.coreX + L.coreW, L.outY));
    const p1 = view.P(W(L.coreX + L.coreW + (1080 - L.coreX - L.coreW) * lead, L.outY));
    out.push({
      z: p0[2] - 30,
      el: (
        <line
          key="lead"
          x1={p0[0]}
          y1={p0[1]}
          x2={p1[0]}
          y2={p1[1]}
          stroke={C.a500}
          strokeWidth={2 * p0[3]}
          opacity={0.7 * fo}
        />
      ),
    });
  }
  for (let b = 0; b < 15; b++) {
    const on = tw(T, B.answer + b * 0.04, B.answer + b * 0.04 + 0.25, MOTION.pop);
    if (on <= 0) continue;
    const env = Math.exp(-Math.pow((b - 7) / 4.5, 2));
    const osc = 0.6 + 0.4 * Math.sin(T * 9 + b * 1.3);
    const h = Math.max(2, on * env * osc * 32);
    const x = L.outX + b * 12;
    const [x0, y0] = W(x, L.outY - h);
    const [x1, y1] = W(x + 6, L.outY + h);
    const sol = solid(view, boxCorners(x0, y1, -3, x1, y0, 3));
    out.push({ z: sol.z, el: <g key={"o" + b} opacity={fo}>{polys(sol, b === 7 ? C.a300 : C.a500)}</g> });
  }
  const arr = tw(T, B.answer + 0.55, B.answer + 0.8, MOTION.pop);
  if (arr > 0) {
    const ax = 1074;
    const pts = [
      W(ax, L.outY - 11 * arr),
      W(ax + 18 * arr, L.outY),
      W(ax, L.outY + 11 * arr),
    ].map(view.P);
    out.push({ z: pts[1][2], el: <polygon key="arrow" points={ptsStr(pts)} fill={C.a500} opacity={fo} /> });
  }
  return out;
}

function cardItem(view: View, T: number, B: Beats): Item | null {
  const L = LAYOUT;
  const w = L.cardW;
  const h = L.cardH;
  const inP = tw(T, B.answer + 0.45, B.answer + 1.2, MOTION.pop);
  const outP = tw(T, B.reset, B.reset + 0.7, MOTION.draw);
  if (inP <= 0 || outP >= 1) return null;
  const ang = 0.16 + (1 - inP) * 1.35 - outP * 1.5;
  const tilt = 0.04 * Math.sin(T * 1.3);
  const lift = (1 - inP) * -60 + 6 * Math.sin(T * 1.6 + 1) + outP * 40;
  const [cx, cy] = W(L.cardX + w / 2, L.cardY + h / 2);
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const map = (u: number, vv: number, d: number): Vec => {
    const x = u - w / 2;
    const y = -(vv - h / 2);
    const z = d;
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    const y2 = y * ct - z1 * st;
    const z2 = y * st + z1 * ct;
    return [cx + x1, cy + y2 + lift, z2 + 30];
  };
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
    map(i & 1 ? w : 0, (i >> 1) & 1 ? 0 : h, (i >> 2) & 1 ? 14 : 0)
  );
  const sol = solid(view, corners);
  const total = ANSWER.lines.join("").length;
  const typeP = lin(T, B.answer + 1.4, B.answer + 3.2);
  const lines = typed(ANSWER.lines, total * typeP);
  const qA = tw(T, B.answer + 0.95, B.answer + 1.35);
  const foot = tw(T, B.answer + 3.2, B.answer + 3.6);
  const front = sol.faces.find((f) => f.name === "front")?.vis ?? false;
  return {
    z: sol.z,
    el: (
      <g key="card" opacity={Math.min(1, inP * 3) * (1 - outP)}>
        {polys(sol, C.n100, {
          round: 16,
          faceColor: { right: C.n300, left: C.n300, top: C.n200, bottom: C.n400 },
        })}
        {front && (
          <g transform={faceMatrix(sol, w, h)}>
            <rect x={0} y={0} width={w} height={h} rx={16} fill={C.n100} stroke={C.a300} strokeWidth={1.5} />
            <circle cx={34} cy={42} r={5} fill={C.a500} />
            <text x={48} y={47} fontSize={13} fill={C.a700} letterSpacing={2.4} style={LABEL}>
              {ANSWER.kicker}
            </text>
            <g opacity={qA}>
              <rect x={26} y={68} width={w - 52} height={74} rx={16} fill={C.a200} />
              <text x={44} y={92} fontSize={10.5} fill={C.n700} letterSpacing={2} style={LABEL}>
                {ANSWER.asked}
              </text>
              <text x={44} y={124} fontSize={19} fill={C.ink} style={{ fontFamily: NATIVE_FONT, fontWeight: 500 }}>
                {ANSWER.q}
              </text>
            </g>
            {lines.map((l, k) => (
              <text key={k} x={28} y={186 + k * 27} fontSize={17.5} fill={C.ink} style={{ fontFamily: "Figtree, sans-serif" }}>
                {l}
              </text>
            ))}
            <g opacity={foot}>
              <text x={28} y={290} fontSize={10.5} fill={C.n600} letterSpacing={2} style={LABEL}>
                {ANSWER.meta}
              </text>
              <text x={w - 28} y={291} fontSize={15} fill={C.a700} textAnchor="end" style={{ fontFamily: "Caprasimo, serif" }}>
                {ANSWER.cta}
              </text>
            </g>
          </g>
        )}
      </g>
    ),
  };
}

function planeText(
  view: View,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  children: ReactNode,
  key: string
): Item {
  const [ax, ay] = W(x, y, z);
  const [bx, by] = W(x + w, y + h, z);
  const sol = solid(view, boxCorners(ax, by, z, bx, ay, z + 0.01));
  return { z: sol.z - 200, el: <g key={key} transform={faceMatrix(sol, w, h)}>{children}</g> };
}

function Piece3D({ T }: { T: number }) {
  const total = TOTAL;
  const ph = (2 * Math.PI * T) / total;
  const yaw = -0.2 + 0.09 * Math.sin(ph);
  const pitch = 0.32 + 0.05 * Math.sin(ph * 2);
  const d = MOTION.draw;
  const tx =
    -110 +
    70 * tw(T, CUES.Converge - 0.5, CUES.Converge + 1, d) +
    40 * tw(T, B.think - 0.3, B.think + 0.5, d) +
    110 * tw(T, B.answer, B.answer + 1.2, d) -
    220 * tw(T, B.reset, total, d);
  const dist =
    2000 - 170 * tw(T, B.think - 0.5, B.think + 0.6, d) + 170 * tw(T, B.answer + 0.4, B.answer + 1.6, d);
  const view = makeView(yaw, pitch, tx, dist, 1780);
  const think = tw(T, B.think - 0.3, B.think + 0.4) * (1 - tw(T, B.answer + 0.5, B.answer + 2));
  const ask = tw(T, B.answer, B.answer + 0.2) * (1 - tw(T, B.reset, B.reset + 0.4));

  const ground: ReactNode[] = [];
  for (let X = -950; X <= 950; X += 50)
    for (let Z = -650; Z <= 350; Z += 50) {
      const q = view.P([X, -250, Z]);
      const o = 0.55 * Math.max(0, 1 - Math.hypot(X / 950, (Z + 150) / 520));
      if (o > 0.02) ground.push(<circle key={X + "_" + Z} cx={q[0]} cy={q[1]} r={1.8 * q[3]} fill={C.n600} opacity={o} />);
    }
  const coreC = view.P(W(795, 348, 0));
  const items: Item[] = [];
  VOICES.forEach((v, i) => {
    items.push(chipItem(view, i, v, T, B, i === 0 ? ask : 0));
    items.push(...waveItems(view, i, v, T, B));
    items.push(...lineItems(view, i, v, T, B));
  });
  items.push(coreItem(view, T, B), ...nodeItems(view, T, B), ...outputItems(view, T, B));
  const card = cardItem(view, T, B);
  if (card) items.push(card);
  items.push(
    planeText(
      view,
      645,
      530,
      300,
      60,
      0,
      <g>
        <text x={150} y={20} fontSize={13} fill={C.n300} letterSpacing={3} textAnchor="middle" style={LABEL}>
          ONE INTELLIGENCE
        </text>
        <text x={150} y={50} fontSize={19} fill={C.n100} textAnchor="middle" style={{ fontFamily: NATIVE_FONT, fontWeight: 700 }}>
          एक बुद्धि
        </text>
      </g>,
      "lbl1"
    )
  );
  items.push(
    planeText(
      view,
      60,
      592,
      240,
      24,
      0,
      <text x={0} y={17} fontSize={12} fill={C.n500} letterSpacing={2.5} style={LABEL}>
        22+ VOICES IN
      </text>,
      "lbl2"
    )
  );
  items.sort((a, b) => a.z - b.z);

  return (
    <svg
      viewBox="0 0 1600 640"
      width={1600}
      height={640}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#1d1611" />
          <stop offset="1" stopColor="#3d2c20" />
        </linearGradient>
        <radialGradient id="glow3">
          <stop offset="0" stopColor={C.a700} stopOpacity="0.75" />
          <stop offset="0.45" stopColor={C.a800} stopOpacity="0.35" />
          <stop offset="1" stopColor={C.a900} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="640" fill="url(#bg3)" />
      {ground}
      <ellipse
        cx={coreC[0]}
        cy={coreC[1]}
        rx={430 * coreC[3]}
        ry={330 * coreC[3]}
        fill="url(#glow3)"
        opacity={0.6 + 0.4 * think}
      />
      {items.map((it) => it.el)}
    </svg>
  );
}

/* ---------- Clock + mount ---------- */
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:wght@400;500;600&family=Noto+Sans+Devanagari:wght@500;700&family=Noto+Sans+Tamil:wght@700&family=Noto+Sans+Bengali:wght@700&family=Noto+Sans+Telugu:wght@700&family=Noto+Sans+Kannada:wght@700&display=swap";
const FAMS = [
  "400 16px Caprasimo",
  "600 16px Figtree",
  '700 16px "Noto Sans Devanagari"',
  '500 16px "Noto Sans Devanagari"',
  '700 16px "Noto Sans Tamil"',
  '700 16px "Noto Sans Bengali"',
  '700 16px "Noto Sans Telugu"',
  '700 16px "Noto Sans Kannada"',
];

export default function Voices3D() {
  const { mounted, T, wrapRef } = useVoicesClock({
    fontId: "voices-3d-fonts",
    fontHref: FONT_HREF,
    fams: FAMS,
  });
  return (
    <div className="voices-anim" ref={wrapRef}>
      {mounted && <Piece3D T={T} />}
    </div>
  );
}
