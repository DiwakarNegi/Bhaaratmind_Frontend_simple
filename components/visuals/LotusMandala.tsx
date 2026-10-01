/**
 * Lotus mandala — the hero centrepiece, rebuilt from the Figma vectors
 * (node 161:188): a 560×560 box centred on (280,280). Bottom → top: blurred
 * glow, dotted orbit with 8 dots, three 12-petal layers (back / front / inner),
 * a hairline ring, the night disc with its glowing sun, and 12 cream inner
 * dots. The petal paths are the exported Figma vectors verbatim, each
 * translated so its own box centres on (280,280). Layer spins are CSS-driven
 * (hero.css) and stop under prefers-reduced-motion.
 */

const C = 280;

/** 161:199 — Petals Back, 432.771 box */
const PETALS_BACK =
  "M276.275 232.435C265.405 273.005 431.015 280.855 432.755 274.365C434.495 267.865 287.145 191.865 276.275 232.435ZM260.225 260.225C230.525 289.925 370.025 379.525 374.775 374.775C379.525 370.025 289.925 230.525 260.225 260.225ZM232.435 276.275C191.865 287.145 267.865 434.495 274.365 432.755C280.855 431.015 273.005 265.405 232.435 276.275ZM200.335 276.275C159.765 265.405 151.915 431.015 158.405 432.755C164.905 434.495 240.905 287.145 200.335 276.275ZM172.545 260.225C142.845 230.525 53.2453 370.025 57.9953 374.775C62.7453 379.525 202.245 289.925 172.545 260.225ZM156.495 232.435C145.625 191.865 -1.72471 267.865 0.0152876 274.365C1.75529 280.855 167.365 273.005 156.495 232.435ZM156.495 200.335C167.365 159.765 1.75529 151.915 0.0152876 158.405C-1.72471 164.905 145.625 240.905 156.495 200.335ZM172.545 172.545C202.245 142.845 62.7453 53.2453 57.9953 57.9953C53.2453 62.7453 142.845 202.245 172.545 172.545ZM200.335 156.495C240.905 145.625 164.905 -1.72471 158.405 0.0152876C151.915 1.75529 159.765 167.365 200.335 156.495ZM232.435 156.495C273.005 167.365 280.855 1.75529 274.365 0.0152876C267.865 -1.72471 191.865 145.625 232.435 156.495ZM260.225 172.545C289.925 202.245 379.525 62.7453 374.775 57.9953C370.025 53.2453 230.525 142.845 260.225 172.545ZM276.275 200.335C287.145 240.905 434.495 164.905 432.755 158.405C431.015 151.915 265.405 159.765 276.275 200.335Z";

/** 161:200 — Petals Front, 352 box */
const PETALS_FRONT =
  "M230 176C230 216 352 182.4 352 176C352 169.6 230 136 230 176ZM222.77 203C202.77 237.64 325.22 269.54 328.42 264C331.62 258.46 242.77 168.36 222.77 203ZM203 222.77C168.36 242.77 258.46 331.62 264 328.42C269.54 325.22 237.64 202.77 203 222.77ZM176 230C136 230 169.6 352 176 352C182.4 352 216 230 176 230ZM149 222.77C114.36 202.77 82.46 325.22 88 328.42C93.54 331.62 183.64 242.77 149 222.77ZM129.23 203C109.23 168.36 20.38 258.46 23.58 264C26.78 269.54 149.23 237.64 129.23 203ZM122 176C122 136 0 169.6 0 176C0 182.4 122 216 122 176ZM129.23 149C149.23 114.36 26.78 82.46 23.58 88C20.38 93.54 109.23 183.64 129.23 149ZM149 129.23C183.64 109.23 93.54 20.38 88 23.58C82.46 26.78 114.36 149.23 149 129.23ZM176 122C216 122 182.4 0 176 0C169.6 0 136 122 176 122ZM203 129.23C237.64 149.23 269.54 26.78 264 23.58C258.46 20.38 168.36 109.23 203 129.23ZM222.77 149C242.77 183.64 331.62 93.54 328.42 88C325.22 82.46 202.77 114.36 222.77 149Z";

/** 161:201 — Petals Inner, 200.946 box */
const PETALS_INNER =
  "M139.113 110.823C132.903 134.003 199.933 131.103 200.933 127.393C201.923 123.683 145.323 87.6428 139.113 110.823ZM128.753 128.753C111.783 145.723 171.293 176.723 174.013 174.013C176.723 171.293 145.723 111.783 128.753 128.753ZM110.823 139.113C87.6428 145.323 123.683 201.923 127.393 200.933C131.103 199.933 134.003 132.903 110.823 139.113ZM90.1228 139.113C66.9428 132.903 69.8428 199.933 73.5528 200.933C77.2628 201.923 113.303 145.323 90.1228 139.113ZM72.1928 128.753C55.2228 111.783 24.2228 171.293 26.9328 174.013C29.6528 176.723 89.1628 145.723 72.1928 128.753ZM61.8328 110.823C55.6228 87.6428 -0.977167 123.683 0.0128333 127.393C1.01283 131.103 68.0428 134.003 61.8328 110.823ZM61.8328 90.1228C68.0428 66.9428 1.01283 69.8428 0.0128333 73.5528C-0.977167 77.2628 55.6228 113.303 61.8328 90.1228ZM72.1928 72.1928C89.1628 55.2228 29.6528 24.2228 26.9328 26.9328C24.2228 29.6528 55.2228 89.1628 72.1928 72.1928ZM90.1228 61.8328C113.303 55.6228 77.2628 -0.977167 73.5528 0.0128333C69.8428 1.01283 66.9428 68.0428 90.1228 61.8328ZM110.823 61.8328C134.003 68.0428 131.103 1.01283 127.393 0.0128333C123.683 -0.977167 87.6428 55.6228 110.823 61.8328ZM128.753 72.1928C145.723 89.1628 176.723 29.6528 174.013 26.9328C171.293 24.2228 111.783 55.2228 128.753 72.1928ZM139.113 90.1228C145.323 113.303 201.923 77.2628 200.933 73.5528C199.933 69.8428 132.903 66.9428 139.113 90.1228Z";

const onCircle = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return {
    cx: +(C + r * Math.cos(a)).toFixed(2),
    cy: +(C + r * Math.sin(a)).toFixed(2),
  };
};

/** 161:191–198 — 8 orbit dots on r=253, every 45° */
const ORBIT_DOTS = Array.from({ length: 8 }, (_, k) => onCircle(253, k * 45));

/** 161:206–217 — 12 inner dots on r=150 at 7.5° + k·30° */
const INNER_DOTS = Array.from({ length: 12 }, (_, k) =>
  onCircle(150, 7.5 + k * 30)
);

export default function LotusMandala() {
  return (
    <svg viewBox="0 0 560 560" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="mandala-petal" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFCE97" />
          <stop offset="0.55" stopColor="#E4742B" />
          <stop offset="1" stopColor="#B4501A" stopOpacity="0.92" />
        </radialGradient>
        <radialGradient id="mandala-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE3A6" />
          <stop offset="1" stopColor="#F0A030" />
        </radialGradient>
        <filter id="mandala-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="45" />
        </filter>
        <filter
          id="mandala-disc-shadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="12"
            floodColor="#663311"
            floodOpacity="0.3"
          />
        </filter>
        <filter
          id="mandala-sun-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="8"
            floodColor="#F0A83A"
            floodOpacity="0.6"
          />
        </filter>
      </defs>

      {/* 1 · glow disc (161:189) */}
      <circle
        cx={C}
        cy={C}
        r="190"
        fill="#F6B27A"
        fillOpacity="0.28"
        filter="url(#mandala-blur)"
      />

      {/* 2 + 3 · dotted orbit ring (144 dots at 2.5°) and 8 orbit dots */}
      <g className="mandala-orbit">
        <circle
          cx={C}
          cy={C}
          r="253"
          fill="none"
          stroke="#A9421A"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="0.1 10.94"
          strokeLinecap="round"
        />
        {ORBIT_DOTS.map((p) => (
          <circle
            key={`${p.cx},${p.cy}`}
            cx={p.cx}
            cy={p.cy}
            r="3.5"
            fill="#E4742B"
            fillOpacity="0.8"
          />
        ))}
      </g>

      {/* 4 · petals back */}
      <g className="mandala-petals-outer">
        <g transform="translate(63.615 63.615)">
          <path d={PETALS_BACK} fill="#A8431A" fillOpacity="0.45" />
        </g>
      </g>

      {/* 5 · petals front */}
      <g className="mandala-petals-front">
        <g transform="translate(104 104)">
          <path d={PETALS_FRONT} fill="url(#mandala-petal)" />
        </g>
      </g>

      {/* 6 · petals inner */}
      <g className="mandala-petals-inner">
        <g transform="translate(179.527 179.527)">
          <path d={PETALS_INNER} fill="#FFE0BE" fillOpacity="0.75" />
        </g>
      </g>

      {/* 7 · hairline ring (161:202) */}
      <circle
        cx={C}
        cy={C}
        r="74.5"
        fill="none"
        stroke="#E4742B"
        strokeOpacity="0.4"
        strokeWidth="1"
      />

      {/* 8 · night disc (161:203) */}
      <g filter="url(#mandala-disc-shadow)">
        <circle cx={C} cy={C} r="56" fill="#241B14" />
        <circle
          cx={C}
          cy={C}
          r="55.25"
          fill="none"
          stroke="#E4742B"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
      </g>

      {/* 9 + 10 · sun and highlight (161:204/205) */}
      <g className="mandala-core-glow">
        <circle
          cx={C}
          cy={C}
          r="24"
          fill="url(#mandala-sun)"
          filter="url(#mandala-sun-glow)"
        />
        <circle cx={C} cy={C} r="6" fill="#FFFFFF" fillOpacity="0.6" />
      </g>

      {/* 11 · inner dots */}
      {INNER_DOTS.map((p) => (
        <circle
          key={`${p.cx},${p.cy}`}
          cx={p.cx}
          cy={p.cy}
          r="2.5"
          fill="#FFF1DD"
          fillOpacity="0.9"
        />
      ))}
    </svg>
  );
}
