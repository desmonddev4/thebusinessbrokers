import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { get } from "../api.js";
import { hero, vision } from "../content.js";
import { useToast } from "../ToastContext.jsx";
import Reveal from "./Reveal.jsx";
import "./Home.css";

const SUGGESTIONS = ["Land", "Cocoa", "Insurance", "Hotel", "Carbon"];

// size (px), left (%), fall duration (s), delay (s, negative = already mid-fall), sway (px)
const BUBBLES = [
  [64, 4, 22, -3, 26],   [28, 11, 16, -11, 14],  [96, 19, 30, -18, 34],
  [40, 27, 19, -7, 18],  [22, 34, 14, -2, 12],   [72, 43, 26, -22, 30],
  [34, 51, 18, -13, 16], [110, 58, 34, -9, 38],  [26, 66, 15, -5, 14],
  [56, 73, 24, -16, 24], [38, 81, 20, -1, 18],   [84, 88, 28, -24, 32],
  [24, 94, 13, -8, 12],  [48, 47, 21, -19, 20],
];

export default function Home() {
  const [q, setQ] = useState("");
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const go = useNavigate();
  const videoRef = useRef(null);
  const { addToast } = useToast();

  const fetchClusters = () => {
    setLoading(true);
    setError(null);
    get("/clusters/")
      .then(setClusters)
      .catch(err => {
        console.error("Failed to load clusters:", err);
        const errorMsg = err.message || err;
        setError(errorMsg);
        addToast(errorMsg, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  // autoplay fix: React doesn't reliably set the `muted` attribute, so browsers
  // block autoplay on client-side navigation. Force muted, then call play().
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    const tryPlay = () => v.play()?.catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay, { once: true });
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  const totalDesks = clusters.reduce((sum, c) => sum + (c.desk_count || 0), 0);

  const search = term =>
    go(`/what-we-broker?q=${encodeURIComponent(term)}`);

  return (
    <main className="home">
      {/* ---------------- HERO ---------------- */}
      <section className="h-hero">
        {/* floating glass bubbles (decorative) */}
        <div className="h-bubbles" aria-hidden="true">
          {BUBBLES.map(([size, left, dur, delay, sway], i) => (
            <span
              key={i}
              className="bubble"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
                "--sway": `${sway}px`,
                "--sway-dur": `${6 + (i % 4) * 1.5}s`,
              }}
            >
              <i />
            </span>
          ))}
        </div>

        <div className="wrap h-hero-grid">
          <div className="h-copy">
            <span className="eyebrow">Top Business Brokers</span>
            <h1>{hero.h}</h1>
            <p className="h-sub">{hero.sub}</p>

            <form
              role="search"
              className="h-search"
              onSubmit={e => {
                e.preventDefault();
                search(q);
              }}
            >
              <label htmlFor="s" className="sr-only">
                Search the desks. Try land, cocoa, insurance, hotel, carbon.
              </label>
              <div className="h-search-row">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
                </svg>
                <input
                  id="s"
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="What are you buying, selling or placing?"
                />
                <button className="btn-gold">Search</button>
              </div>
            </form>

            <div className="h-chips">
              <span>Popular:</span>
              {SUGGESTIONS.map(s => (
                <button key={s} type="button" onClick={() => search(s)}>
                  {s}
                </button>
              ))}
            </div>

            <ul className="h-trust">
              <li>One lead broker on every mandate</li>
              <li>Specialist desks across five clusters</li>
              <li>Buying, selling and placing</li>
            </ul>
          </div>

          <div className="h-media">
            <div className="h-stage">
            <div className="h-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/hero-banner-poster.jpg"
                aria-label="A broker holding a glass crystal showing property, finance and growth icons"
              >
                <source src="/hero-banner.mp4" type="video/mp4" />
              </video>
            </div>

            <span className="h-badge h-badge-a">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
              Single lead broker
            </span>
            {totalDesks > 0 && (
              <span className="h-badge h-badge-b">
                <strong>{totalDesks}</strong> specialist desks
              </span>
            )}
            </div>

              <div className="h-actions">
                <Link className="btn-gold" to="/contact">
                  Talk to a broker
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z" />
                  </svg>
                </Link>
                <Link className="btn-ghost" to="/what-we-broker">
                  Explore our desks
                </Link>
              </div>
          </div>
        </div>

        <div className="wrap">
            <aside className="h-panel" aria-label="Practice clusters">
              <h2>Five practice clusters</h2>
              {error ? (
                <div className="h-panel-error">
                  <p>{error || "Practice clusters could not be loaded."}</p>
                  <button className="btn-gold" onClick={fetchClusters}>
                    Try again
                  </button>
                </div>
              ) : (
                <ul>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="skeleton" />
                      ))
                    : clusters.map((c, i) => (
                        <li key={c.slug} style={{ "--i": i }}>
                          <Link to={`/what-we-broker?cluster=${c.slug}`}>
                            <span className="h-num">0{i + 1}</span>
                            <span className="h-name">{c.name}</span>
                            <span className="h-count">{c.desk_count}</span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                </ul>
              )}
            </aside>
        </div>
      </section>

      {/* ---------------- STATS STRIP ---------------- */}
      {clusters.length > 0 && (
        <div className="wrap">
          <Reveal className="h-stats">
            <div>
              <strong>{clusters.length}</strong>
              <span>Practice clusters</span>
            </div>
            <div>
              <strong>{totalDesks}</strong>
              <span>Specialist desks</span>
            </div>
          </Reveal>
        </div>
      )}

      {/* ---------------- VISION ---------------- */}
      <section className="h-vision wrap">
        <Reveal>
          <span className="eyebrow dark">Our purpose</span>
          <h2>What we stand for</h2>
        </Reveal>
        <Reveal delay={150} className="h-vision-body">
          <p className="lede">{vision}</p>
          <Link className="btn-outline" to="/about">
            Read our values and standards
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4l-1.4 1.4L16.2 11H4v2h12.2l-5.6 5.6L12 20l8-8z" />
            </svg>
          </Link>
        </Reveal>
      </section>

      {/* ---------------- CLOSING CTA ---------------- */}
      <section className="wrap">
        <Reveal className="h-cta">
          <div>
            <h2>Ready to buy, sell or place something?</h2>
            <p>Tell us what you're working on and we'll point you to the right desk.</p>
          </div>
          {/* adjust the route to wherever your contact page lives */}
          <Link className="btn-gold" to="/contact">Get in touch</Link>
        </Reveal>
      </section>
    </main>
  );
}