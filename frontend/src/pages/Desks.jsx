import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { get } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import Reveal from "./Reveal.jsx";
import "./Desks.css";

export default function Desks() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const cl = sp.get("cluster") || "";
  const [desks, setDesks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const { addToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    setErr(null);
    Promise.all([get("/desks/"), get("/clusters/")])
      .then(([d, c]) => { setDesks(d); setClusters(c); })
      .catch(err => {
        console.error("Failed to load desks:", err);
        const errorMsg = err.message || err;
        setErr(errorMsg);
        addToast(errorMsg, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // respect reduced-motion: show the poster frame instead of playing
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
    }
  }, []);

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n, { replace: true });
  };
  const clearAll = () => setSp({}, { replace: true });

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return desks.filter(
      d =>
        (!cl || d.cluster === cl) &&
        (!t ||
          [d.name, d.code, d.strapline, d.description, ...(d.focus_areas || [])]
            .join(" ")
            .toLowerCase()
            .includes(t))
    );
  }, [desks, q, cl]);

  const message = loading
    ? "Loading desks…"
    : err
    ? err
    : shown.length === 1
    ? "One desk matches."
    : q || cl
    ? `${shown.length} desks match.`
    : `Showing all ${shown.length} desks.`;

  return (
    <main className="desks">
      {/* ---------------- HERO ---------------- */}
      <section className="d-hero">
        <div className="wrap d-hero-in">
          <div className="d-copy">
            <span className="eyebrow">Our desks</span>
            <h1>What we broker</h1>
            <p className="d-lede">
              Every desk carries its own market knowledge, and most substantial
              mandates draw on more than one. When they do, you still deal with a
              single lead broker rather than five departments.
            </p>
          </div>

          <div className="d-media">
            <div className="d-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/desks-banner-poster.jpg"
                aria-label="A team animating a holographic site"
              >
                <source src="/desks-banner.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap d-body">
        {/* ---------------- FILTER BAR (sticky) ---------------- */}
        <div className="d-bar">
          <div className="d-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
            </svg>
            <input
              type="search"
              aria-label="Search desks"
              value={q}
              onChange={e => set("q", e.target.value)}
              placeholder="What are you buying, selling or placing?"
            />
            {q && (
              <button type="button" className="d-clear" aria-label="Clear search" onClick={() => set("q", "")}>
                ×
              </button>
            )}
          </div>

          <div className="d-chips">
            <button aria-pressed={!cl} onClick={() => set("cluster", "")}>
              All {desks.length || 25} desks
            </button>
            {clusters.map(c => (
              <button key={c.slug} aria-pressed={cl === c.slug} onClick={() => set("cluster", c.slug)}>
                {c.short_name}
              </button>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="d-count">{message}</p>

        {/* ---------------- RESULTS ---------------- */}
        {loading && !err ? (
          <div className="d-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="d-skel" />
            ))}
          </div>
        ) : err ? (
          <div className="d-empty">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p>{err || "The desks could not be loaded. Please try again or call us."}</p>
            <button className="btn-gold" onClick={fetchData}>Try again</button>
          </div>
        ) : shown.length === 0 ? (
          <div className="d-empty">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />
            </svg>
            <p>
              No desk matches that word. Try a plainer term such as land, hotel,
              cocoa, insurance, freight or carbon, or clear the search to see
              all twenty five.
            </p>
            <button className="btn-gold" onClick={clearAll}>Clear search</button>
          </div>
        ) : (
          !err && (
            <div className="d-grid">
              {shown.map((d, i) => (
                <Reveal key={d.code} delay={(i % 3) * 80}>
                  <article className="d-card">
                    <div className="d-top">
                      <span className="d-code">{d.code}</span>
                      {d.cluster_name && <span className="d-cluster">{d.cluster_name}</span>}
                    </div>

                    <h3>{d.name}</h3>
                    {d.strapline && <p className="d-strap">{d.strapline}</p>}
                    {d.description && <p className="d-desc">{d.description}</p>}

                    {d.focus_areas?.length > 0 && (
                      <details className="d-more">
                        <summary>
                          What this desk handles
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M7.4 8.6L12 13.2l4.6-4.6L18 10l-6 6-6-6z" />
                          </svg>
                        </summary>
                        <ul>
                          {d.focus_areas.map(f => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}