"use client";

import { useEffect, useLayoutEffect } from "react";
import Lenis from "lenis";

// useLayoutEffect on the client (before paint → no reveal flash), useEffect on
// the server to avoid React's SSR warning.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** `?static` disables smooth scroll + reveals (visual QA / screenshot mode). */
const isStatic = () =>
  new URLSearchParams(window.location.search).has("static");

/**
 * Global motion controller.
 *  - Reveals use inline CSS transitions applied straight to the DOM. Inline
 *    styles survive React reconciliation (these nodes carry no `style` prop) and
 *    depend on no animation-library ticker, so they are robust.
 *  - An immediate pass shows above-the-fold content; an IntersectionObserver
 *    reveals the rest as they scroll in.
 *  - Lenis smooth scroll runs on its own rAF loop (self-contained, no external
 *    ticker to go stale).
 *  All effects respect `prefers-reduced-motion`.
 */
export default function SmoothScroll() {
  useIso(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || isStatic()) return; // leave everything visible & static

    const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const singles = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal, .reveal-scale")
    );
    const staggers = Array.from(
      document.querySelectorAll<HTMLElement>(".stagger")
    );

    singles.forEach((el) => {
      const scale = el.classList.contains("reveal-scale");
      el.style.opacity = "0";
      el.style.transform = scale
        ? "translateY(16px) scale(0.97)"
        : "translateY(20px)";
      el.style.transition = `opacity 0.6s ${ease}, transform 0.6s ${ease}`;
      el.style.willChange = "opacity, transform";
    });
    staggers.forEach((el) => {
      Array.from(el.children).forEach((c, i) => {
        const child = c as HTMLElement;
        child.style.opacity = "0";
        child.style.transform = "translateY(14px)";
        child.style.transition = `opacity 0.5s ${ease} ${i * 0.06}s, transform 0.5s ${ease} ${i * 0.06}s`;
      });
    });

    const reveal = (el: HTMLElement) => {
      if (el.classList.contains("stagger")) {
        Array.from(el.children).forEach((c) => {
          const child = c as HTMLElement;
          child.style.opacity = "1";
          child.style.transform = "none";
        });
      } else {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    };

    const all = [...singles, ...staggers];

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    all.forEach((el) => io.observe(el));

    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        all.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) {
            reveal(el);
            io.unobserve(el);
          }
        });
      })
    );

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  // Lenis smooth scroll — self-contained rAF loop
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || isStatic()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let id = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);

    // Smooth in-page anchor navigation (nav links, CTAs)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // nav island bottom edge is 84px; 96 leaves breathing room below it
      lenis.scrollTo(target as HTMLElement, { offset: -96 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(id);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return null;
}
