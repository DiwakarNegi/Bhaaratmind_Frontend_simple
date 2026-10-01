"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "../icons";

type Chapter = {
  n: string;
  label: string;
  hi: string;
  title: string;
  body: string;
  caption: string;
  art: string;
};

/* The three principles of the intelligence (Context · Voice · Action). */
const CHAPTERS: Chapter[] = [
  {
    n: "01",
    label: "Context",
    hi: "संदर्भ",
    title: "Reason with local context",
    body: "The right answer depends on where you are, what season it is, which board you study under or which scheme you qualify for. BhaaratMind reads that context, culture and intent into every response.",
    caption: "A question, grounded in local context",
    art: "/why/context.svg",
  },
  {
    n: "02",
    label: "Voice",
    hi: "स्वर",
    title: "Ask naturally, in every voice",
    body: "Speak or type, switch languages mid-sentence, and keep your own words. BhaaratMind follows meaning across 22+ Indian languages and code-mixed speech, instead of translating how you think.",
    caption: "Code-mixed speech, heard as it is spoken",
    art: "/why/voice.svg",
  },
  {
    n: "03",
    label: "Action",
    hi: "क्रिया",
    title: "Turn answers into a clear next step",
    body: "Understanding is only useful if it helps someone decide and move. Every answer ends in a next step you can take — a focused quiz, a full-chapter lecture, or a clear plan inside Manthan AI.",
    caption: "An answer that ends in a next step",
    art: "/why/action.svg",
  },
];

export default function WhySticky() {
  const [active, setActive] = useState(0);
  const figRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const figs = figRefs.current.filter(Boolean) as HTMLElement[];
    if (!figs.length || !("IntersectionObserver" in window)) return;

    // A figure becomes "active" as it crosses the middle of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    figs.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, []);

  const goTo = (i: number) => {
    const el = figRefs.current[i];
    if (!el) return;
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: Element, o?: object) => void } })
      .lenis;
    if (lenis) lenis.scrollTo(el, { offset: -130 });
    else el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="why section" id="why">
      {/* ---- sticky story ---- */}
      <div className="container">
        <div className="why-story">
          <aside className="why-rail">
            <p className="rail-kicker">How BhaaratMind thinks</p>
            <ol className="rail-list">
              {CHAPTERS.map((c, i) => (
                <li key={c.n}>
                  <button
                    type="button"
                    className={`rail-item ${i === active ? "active" : ""}`}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => goTo(i)}
                  >
                    <span className="rail-n">
                      {c.n} / {c.label.toUpperCase()}
                    </span>
                    <span className="rail-t">{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div className="why-figs">
            {CHAPTERS.map((c, i) => (
              <article
                className="why-fig reveal"
                key={c.n}
                data-i={i}
                ref={(el) => {
                  figRefs.current[i] = el;
                }}
              >
                <div className="fig-media">
                  <img src={c.art} alt="" aria-hidden="true" loading="lazy" />
                </div>
                <span className="fig-tag">Fig. {c.n}</span>
                <div className="fig-panel">
                  <span className="eyebrow">
                    {c.n} · {c.label}
                    <span className="dev" lang="hi">
                      {c.hi}
                    </span>
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <div className="fig-foot">
                    <a className="learn" href="#early">
                      Learn more
                      <ArrowRight />
                    </a>
                    <span className="fig-cap">{c.caption}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
