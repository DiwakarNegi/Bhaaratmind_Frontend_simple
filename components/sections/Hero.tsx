import LotusMandala from "../visuals/LotusMandala";
import { ArrowRight } from "../icons";

/** Hero chips (Figma 161:169); BCP-47 tags pick the Noto face via --font-indic. */
const LANGS = [
  { text: "हिन्दी", lang: "hi" },
  { text: "বাংলা", lang: "bn" },
  { text: "தமிழ்", lang: "ta" },
  { text: "తెలుగు", lang: "te" },
  { text: "ಕನ್ನಡ", lang: "kn" },
  { text: "ગુજરાતી", lang: "gu" },
  { text: "മലയാളം", lang: "ml" },
  { text: "मराठी", lang: "mr" },
];

export default function Hero() {
  return (
    <section className="hero section" id="top">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <a className="badge reveal" href="#research">
              <span className="badge-tag">NEW</span>
              Manthan AI is now in early access
              <ArrowRight className="badge-arrow" />
            </a>

            <h1 className="reveal">
              AI that thinks in
              <span className="accent">your mother tongue.</span>
            </h1>

            <p className="hero-lead reveal">
              BhaaratMind builds AI that understands meaning, culture and intent
              across 22+ Indian languages — and turns any question into a clear
              next step.
            </p>

            <div className="hero-cta reveal">
              <a className="btn btn-primary btn-lg" href="#research">
                Explore our products
              </a>
              <a className="btn btn-ghost btn-lg" href="#why">
                Read our mission
              </a>
            </div>

            <div className="hero-langs reveal">
              <span className="eyebrow">Fluent in</span>
              <div className="lang-row stagger">
                {LANGS.map((l) => (
                  <span className="pill" lang={l.lang} key={l.lang}>
                    {l.text}
                  </span>
                ))}
                <span className="pill">+15 more</span>
              </div>
            </div>
          </div>

          <div className="hero-visual reveal-scale" aria-hidden="true">
            <div className="mandala-wrap">
              <LotusMandala />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
