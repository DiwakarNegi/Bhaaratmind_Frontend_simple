"use client";

import { useState } from "react";

export default function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /.+@.+\..+/.test(email);
    setMsg(
      ok
        ? "Thank you — we’ll reach out when early access opens."
        : "Please enter a valid email address."
    );
    if (ok) setEmail("");
  };

  return (
    <section className="early section" id="early">
      <div className="container">
        <div className="early-panel reveal-scale">
          <img
            className="lotus-l"
            src="/early/lotus-left.svg"
            alt=""
            aria-hidden="true"
            width={300}
            height={260}
          />
          <img
            className="lotus-r"
            src="/early/lotus-right.svg"
            alt=""
            aria-hidden="true"
            width={380}
            height={320}
          />

          <div className="early-inner">
            <img
              className="early-mark"
              src="/early/lotus-seal.png"
              alt=""
              aria-hidden="true"
              width={96}
              height={96}
            />
            <span className="eyebrow">
              Schedule of enrolment ·{" "}
              <span className="hi" lang="hi">
                प्रवेश
              </span>
            </span>
            <h2>
              Early access, <span className="accent">by invitation.</span>
            </h2>
            <p>
              BhaaratMind builds AI products for India — in every language, for
              every citizen. Leave an address and we’ll reach out when early
              access opens.
            </p>
            <form className="early-form" onSubmit={onSubmit} noValidate>
              <input
                type="email"
                placeholder="name@domain.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-light btn-square" type="submit">
                Get early access
              </button>
            </form>
            <p className="early-msg" role="status">
              {msg}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
