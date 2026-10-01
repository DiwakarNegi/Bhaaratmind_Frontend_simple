import VoicesPixel from "./VoicesPixel2";
import { ArrowRight } from "../icons";

/* The three principles, styled like the Why figure panels. */
const CARDS = [
  {
    n: "01",
    label: "Meaning",
    hi: "अर्थ",
    title: "Meaning lives beyond words",
    body: "Language is not a simple exchange of one word for another. Meaning also comes from region, rhythm, shared references and the situation around a conversation.",
    cap: "Meaning beyond the literal words",
  },
  {
    n: "02",
    label: "Expression",
    hi: "अभिव्यक्ति",
    title: "Natural expression matters",
    body: "People should be able to ask naturally, move between languages mid-sentence and still receive an answer that respects the original intent.",
    cap: "Freedom to speak naturally",
  },
  {
    n: "03",
    label: "Action",
    hi: "क्रिया",
    title: "Understanding should lead to action",
    body: "The goal is not only to recognise language, but to help a person learn, decide and move forward with confidence.",
    cap: "Understanding that moves you forward",
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

        {/* three principles — styled like the Why figure panels */}
        <div className="voices-cards reveal">
          {CARDS.map((c) => (
            <div className="vcard" key={c.n}>
              <span className="eyebrow">
                {c.n} · {c.label}
                <span className="dev" lang="hi">
                  {c.hi}
                </span>
              </span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <div className="vcard-foot">
                <a className="learn" href="#early">
                  Learn more
                  <ArrowRight />
                </a>
                <span className="vcard-cap">{c.cap}</span>
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
