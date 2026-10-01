"use client";

import { useEffect, useRef, useState } from "react";
import type Lenis from "lenis";

const LINKS = [
  { label: "Why BhaaratMind", href: "#why" },
  { label: "Products", href: "#research" },
  { label: "Research", href: "#research" },
  { label: "About", href: "#early" },
];

/** Breakpoint at which nav.css turns the island into the drawer. */
const DRAWER_MQ = "(max-width: 860px)";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drawer dismissal: Escape (focus returns to the toggle), a press outside the
  // island, or leaving the drawer breakpoint.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const mq = window.matchMedia(DRAWER_MQ);
    const onMedia = (e: MediaQueryListEvent) => {
      if (!e.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    mq.addEventListener("change", onMedia);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      mq.removeEventListener("change", onMedia);
    };
  }, [open]);

  // Scroll lock while open: `html.nav-open` (nav.css) stops native scrolling and
  // Lenis (exposed on window by SmoothScroll.tsx) is paused for wheel input.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const lenis = (window as unknown as { lenis?: Lenis }).lenis;
    root.classList.add("nav-open");
    lenis?.stop();
    return () => {
      root.classList.remove("nav-open");
      lenis?.start();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      ref={headerRef}
      className={"nav" + (scrolled ? " scrolled" : "") + (open ? " open" : "")}
    >
      <div className="container">
        <div className="nav-inner">
          <a className="brand" href="#top" aria-label="BhaaratMind home" onClick={close}>
            <img
              className="brand-mark"
              src="/brand/logo.svg"
              alt=""
              width={28}
              height={28}
            />
            BhaaratMind AI
          </a>

          <nav id="primary-nav" className="nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.label} className="nav-link" href={l.href} onClick={close}>
                {l.label}
              </a>
            ))}
            <a className="nav-link nav-link-signin" href="#early" onClick={close}>
              Sign in
            </a>
          </nav>

          <div className="nav-right">
            <a className="nav-signin" href="#early">
              Sign in
            </a>
            <a className="btn btn-primary btn-sm" href="#early" onClick={close}>
              <span className="cta-long">Get early access</span>
              <span className="cta-short">Early access</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="primary-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
