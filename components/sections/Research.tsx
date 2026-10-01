"use client";

import { useState } from "react";
import { ArrowRight } from "../icons";

type Item = {
  kind: "product" | "note";
  cat: string;
  read: string;
  title: string;
  deck: string;
  chart: string; // preview image (pixel chart, or the product illustration)
  artBg?: boolean; // product preview gets the Manthan gradient behind the art
  headline: string;
  stat: string;
  href: string;
  cta: string;
  external?: boolean;
  features?: string[];
  slug: string;
};

const MANTHAN_URL = "https://manthanai.bhaaratmind.com";

/* The product (Manthan AI) leads; then the real journal entries and two
   domain notes in the same language-intelligence vein. */
const ITEMS: Item[] = [
  {
    kind: "product",
    cat: "Product",
    read: "Live",
    title: "Manthan AI",
    deck: "A bilingual study companion for school students (NCERT / CBSE) — focused quizzes, full-chapter lectures, progress snapshots and catch-up guidance in one calm interface.",
    chart: "/products/manthan-art.svg",
    artBg: true,
    headline: "Manthan AI — a calm study companion",
    stat: "Live",
    href: MANTHAN_URL,
    cta: "Open Manthan AI",
    external: true,
    features: ["Focused quizzes", "Full-chapter lectures", "Progress snapshots", "English + हिंदी"],
    slug: "manthan-ai",
  },
  {
    kind: "note",
    cat: "Language intelligence",
    read: "5 min read",
    title: "Building AI for India's many voices",
    deck: "Why useful intelligence begins with context, culture and the freedom to speak naturally.",
    chart: "/research/bars.svg",
    headline: "Where India's questions come from",
    stat: "22 languages",
    href: "#research",
    cta: "Read note",
    slug: "building-ai-for-indias-many-voices",
  },
  {
    kind: "note",
    cat: "Product notes",
    read: "4 min read",
    title: "Designing calm AI for learning",
    deck: "What changes when a study companion turns progress into the next clear action instead of more noise.",
    chart: "/research/line.svg",
    headline: "From effort to insight, over a term",
    stat: "Calm by design",
    href: "#research",
    cta: "Read note",
    slug: "designing-calm-ai-for-learning",
  },
  {
    kind: "note",
    cat: "Evaluations",
    read: "6 min read",
    title: "Measuring answers in the language asked",
    deck: "Accuracy in English rarely predicts accuracy in Hindi or Tamil — so we score every language on its own terms.",
    chart: "/research/dots.svg",
    headline: "Scored on their own terms",
    stat: "Per-language",
    href: "#research",
    cta: "Read note",
    slug: "measuring-answers-in-the-language-asked",
  },
  {
    kind: "note",
    cat: "Field notes",
    read: "3 min read",
    title: "Built for the everyday phone",
    deck: "Latency, data and small screens shape a useful answer as much as the model does. Notes from building for Bharat.",
    chart: "/research/signal.svg",
    headline: "Reach on low-bandwidth networks",
    stat: "2G-ready",
    href: "#research",
    cta: "Read note",
    slug: "built-for-the-everyday-phone",
  },
];

export default function Research() {
  const [active, setActive] = useState(0);
  const a = ITEMS[active];

  return (
    <section className="research section" id="research">
      <div className="container">
        <div className="research-head reveal">
          <div className="research-intro">
            <span className="eyebrow">
              Product · Research · Notes
              <span className="dev" lang="hi">
                शोध
              </span>
            </span>
            <h2>
              Research that shapes how{" "}
              <span className="accent">India builds AI.</span>
            </h2>
            <p>
              The product, and the thinking behind it — Manthan AI, plus the
              language intelligence, evaluations and field notes from the
              BhaaratMind team, updated as the landscape moves.
            </p>
          </div>
          <a className="learn research-all" href="#research">
            View all notes
            <ArrowRight />
          </a>
        </div>

        <div className="research-grid">
          {/* sticky preview (desktop) — product art or research chart */}
          <div className="research-preview" aria-hidden="true">
            <div
              className={`report-card ${a.kind === "product" ? "report-card--product" : ""}`}
              key={active}
            >
              <div className="report-top">
                <span className="report-kicker">{a.cat}</span>
                {a.kind === "product" ? (
                  <span className="report-live">
                    <i />
                    {a.stat}
                  </span>
                ) : (
                  <span className="report-stat">{a.stat}</span>
                )}
              </div>
              <p className="report-title">{a.headline}</p>
              <div className={`report-chart ${a.artBg ? "report-chart--art" : ""}`}>
                <img src={a.chart} alt="" />
              </div>
              {a.kind === "product" && a.features ? (
                <ul className="report-features">
                  {a.features.map((f) => (
                    <li key={f} lang={f.includes("हिंदी") ? "hi" : undefined}>
                      {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="report-foot">
                  <span>Source · BhaaratMind research</span>
                  <span className="report-mark">BM</span>
                </div>
              )}
            </div>
          </div>

          {/* list */}
          <div className="research-list">
            {ITEMS.map((n, i) => (
              <article
                key={n.slug}
                className={`research-item ${n.kind} ${i === active ? "active" : ""}`}
                onMouseEnter={() => setActive(i)}
              >
                <p className="ri-meta">
                  <span>{n.cat}</span>
                  <span className="ri-dot" aria-hidden="true" />
                  <span>{n.read}</span>
                </p>
                <h3>{n.title}</h3>
                <img
                  className={`ri-chart ${n.artBg ? "ri-chart--art" : ""}`}
                  src={n.chart}
                  alt=""
                  aria-hidden="true"
                />
                <p className="ri-deck">{n.deck}</p>
                <a
                  className="learn"
                  href={n.href}
                  onFocus={() => setActive(i)}
                  aria-label={`${n.cta}: ${n.title}`}
                  {...(n.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {n.cta}
                  <ArrowRight />
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
