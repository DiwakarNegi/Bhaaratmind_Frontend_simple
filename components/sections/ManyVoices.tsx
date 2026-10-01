import VoicesPixel from "./VoicesPixel2";

/* Principle-card icons, 40x40 (Figma card-icon-01/02/03) */
function ChatIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
      <path
        d="M6 10C6 8.4087 6.63214 6.88258 7.75736 5.75736C8.88258 4.63214 10.4087 4 12 4H24C25.5913 4 27.1174 4.63214 28.2426 5.75736C29.3679 6.88258 30 8.4087 30 10V16C30 17.5913 29.3679 19.1174 28.2426 20.2426C27.1174 21.3679 25.5913 22 24 22H16L10 27V22C8.77305 21.5686 7.71951 20.7501 6.99807 19.668C6.27663 18.5858 5.92635 17.2985 6 16V10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M34 18V22C34.0736 23.2985 33.7234 24.5858 33.0019 25.668C32.2805 26.7501 31.2269 27.5686 30 28V33L24 28H18"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Seven 2.5px bars on a 5px pitch from x=4: [y, height, opacity] */
const WAVE_ICON_BARS: [number, number, number][] = [
  [18, 4, 0.45],
  [14, 12, 0.7],
  [10, 20, 0.95],
  [15.5, 9, 0.45],
  [12, 16, 0.7],
  [17, 6, 0.95],
  [13.5, 13, 0.45],
];

function WaveIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
      {WAVE_ICON_BARS.map(([y, h, o], i) => (
        <rect
          key={i}
          x={4 + i * 5}
          y={y}
          width="2.5"
          height={h}
          rx="1.25"
          fill="currentColor"
          fillOpacity={o}
        />
      ))}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
      <path
        d="M20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M13 20H26M21 14L27 20L21 26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CARDS = [
  {
    n: "01",
    icon: <ChatIcon />,
    title: "Meaning lives beyond words",
    body: "Language is not a simple exchange of one word for another. Meaning also comes from region, rhythm, shared references and the situation around a conversation.",
  },
  {
    n: "02",
    icon: <WaveIcon />,
    title: "Natural expression matters",
    body: "People should be able to ask naturally, move between languages mid-sentence and still receive an answer that respects the original intent.",
  },
  {
    n: "03",
    icon: <ArrowIcon />,
    title: "Understanding should lead to action",
    body: "The goal is not only to recognise language, but to help a person learn, decide and move forward with confidence.",
  },
];

export default function ManyVoices() {
  return (
    <section className="voices section" id="voices">
      <div className="container">
        <div className="voices-head reveal">
          <h2>
            Building AI for India&apos;s
            <br />
            <span className="accent">many voices.</span>
          </h2>
          <p>
            Why useful intelligence begins with context, culture and the freedom
            to speak naturally.
          </p>
        </div>

        {/* Signal animation: voices converge into one intelligence, looping */}
        <div className="voices-panel reveal-scale">
          <VoicesPixel />
        </div>

        {/* three principles */}
        <div className="voices-cards reveal">
          {CARDS.map((c) => (
            <div className="vcard" key={c.n}>
              <div className="top">
                {c.icon}
                <span className="n">{c.n}</span>
              </div>
              <div className="vcard-text">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="voices-foot reveal">
          <a className="btn btn-dark btn-square" href="#voices">
            Read the note
          </a>
        </div>
      </div>
    </section>
  );
}
