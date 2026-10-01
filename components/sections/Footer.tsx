const COLS = [
  {
    h: "Company",
    links: ["About", "Why BhaaratMind", "Careers", "Contact"],
  },
  {
    h: "Products",
    links: ["Manthan AI", "What’s next", "Early access"],
  },
  {
    h: "Research",
    links: ["Language intelligence", "Product notes", "Blog"],
  },
  {
    h: "Legal",
    links: ["Privacy Policy", "Terms of Use"],
  },
  {
    h: "Social",
    links: ["LinkedIn", "X (Twitter)", "YouTube", "Instagram"],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top reveal">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <img
                className="brand-mark"
                src="/brand/lettermark-28.svg"
                alt=""
                width={28}
                height={28}
              />
              BhaaratMind AI
            </a>
            <p>AI products made for India, in every language, for every citizen.</p>
            <a className="email" href="mailto:tech@bhaaratmind.com">
              tech@bhaaratmind.com
            </a>
          </div>

          {COLS.map((col) => (
            <div className="footer-col" key={col.h}>
              <h3>{col.h}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#top">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bar">
          <span>© 2026 BhaaratMind AI. All rights reserved.</span>
          <span className="hi" lang="hi">
            हर भाषा में, हर नागरिक के लिए।
          </span>
        </div>
      </div>

      <div className="footer-word" aria-hidden="true">
        BhaaratMind
      </div>
    </footer>
  );
}
