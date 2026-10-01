type Script = { t: string; l: string; rtl?: boolean };

/* Figma 126:301-313 order and copy. */
const SCRIPTS: Script[] = [
  { t: "हिन्दी", l: "hi" },
  { t: "বাংলা", l: "bn" },
  { t: "தமிழ்", l: "ta" },
  { t: "తెలుగు", l: "te" },
  { t: "मराठी", l: "mr" },
  { t: "ಕನ್ನಡ", l: "kn" },
  { t: "ગુજરાતી", l: "gu" },
  { t: "മലയാളം", l: "ml" },
  { t: "اردو", l: "ur", rtl: true },
  { t: "অসমীয়া", l: "as" },
  { t: "संस्कृतम्", l: "sa" },
  { t: "कोंकणी", l: "kok" },
];

function item(s: Script) {
  return (
    <li className="marquee-item" lang={s.l} dir={s.rtl ? "rtl" : undefined} key={s.l}>
      {s.t}
    </li>
  );
}

export default function LanguageMarquee() {
  return (
    <section className="marquee-section section">
      <div className="container">
        <p className="eyebrow eyebrow-muted marquee-eyebrow reveal">
          Built for 22+ Indian languages · One intelligence
        </p>
        <div className="marquee">
          <div className="marquee-track">
            <ul className="marquee-list" aria-label="Languages">
              {SCRIPTS.map(item)}
            </ul>
            <ul className="marquee-list" aria-hidden="true">
              {SCRIPTS.map(item)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
