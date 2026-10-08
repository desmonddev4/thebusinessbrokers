import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api.js";
import S from "../data/static.json";
import Reveal from "./Reveal.jsx";
import "./Initiatives.css";

const Table = ({ head, rows }) => (
  <div className="i-scroll" tabIndex={0} role="region" aria-label="Scrollable table">
    <table className="i-table">
      <thead>
        <tr>
          {head.map(h => (
            <th key={h} scope="col">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) =>
              j === 0 ? (
                <th scope="row" key={j}>{c}</th>
              ) : (
                <td key={j}>{c}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function Initiatives() {
  const [content, setContent] = useState({
    initiatives_lede: S.initiatives_lede,
    institute: S.institute,
    summit: S.summit,
  });

  useEffect(() => {
    get("/content/")
      .then(data => {
        setContent({
          initiatives_lede: data["initiatives.lede"]?.value || S.initiatives_lede,
          institute: {
            name: data["initiatives.institute.name"]?.value || S.institute.name,
            strap: data["initiatives.institute.strap"]?.value || S.institute.strap,
            paras: data["initiatives.institute.paras"]?.value ? JSON.parse(data["initiatives.institute.paras"].value) : S.institute.paras,
            offers: data["initiatives.institute.offers"]?.value ? JSON.parse(data["initiatives.institute.offers"].value) : S.institute.offers,
            grades: data["initiatives.institute.grades"]?.value ? JSON.parse(data["initiatives.institute.grades"].value) : S.institute.grades,
            faculties: data["initiatives.institute.faculties"]?.value ? JSON.parse(data["initiatives.institute.faculties"].value) : S.institute.faculties,
            status: data["initiatives.institute.status"]?.value || S.institute.status,
            faculties_intro: data["initiatives.institute.faculties_intro"]?.value || S.institute.faculties_intro,
          },
          summit: {
            name: data["initiatives.summit.name"]?.value || S.summit.name,
            strap: data["initiatives.summit.strap"]?.value || S.summit.strap,
            intro: data["initiatives.summit.intro"]?.value || S.summit.intro,
            body: data["initiatives.summit.body"]?.value || S.summit.body,
            who: data["initiatives.summit.who"]?.value || S.summit.who,
            themes: data["initiatives.summit.themes"]?.value ? JSON.parse(data["initiatives.summit.themes"].value) : S.summit.themes,
            facts: data["initiatives.summit.facts"]?.value ? JSON.parse(data["initiatives.summit.facts"].value) : S.summit.facts,
          },
        });
      })
      .catch(err => {
        console.error("Failed to load content:", err);
        // Fall back to static content
      });
  }, []);

  const I = content.institute;
  const M = content.summit;

  return (
    <main className="initiatives">
      {/* ---------------- HERO ---------------- */}
      <section className="i-hero">
        <div className="wrap">
          <div className="i-hero-in">
            <Reveal>
              <span className="eyebrow">Beyond the mandate</span>
            </Reveal>
            <Reveal delay={100}>
              <h1>Our initiatives</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="i-lede">{content.initiatives_lede}</p>
            </Reveal>
            <Reveal delay={300}>
              <nav className="i-jump" aria-label="On this page">
                <a href="#institute">
                  <span className="i-jump-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
                  </span>
                  Africa Brokerage Institute
                </a>
                <a href="#summit">
                  <span className="i-jump-ico" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
                  </span>
                  Africa Brokerage Summit
                </a>
              </nav>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- INSTITUTE ---------------- */}
      <section className="wrap i-institute" id="institute">
        <Reveal className="i-head">
          <span className="eyebrow dark">Institute</span>
          <h2>{I.name}</h2>
          <p className="i-strap">{I.strap}</p>
          {I.paras.map(p => (
            <p className="i-body" key={p}>{p}</p>
          ))}
        </Reveal>

        <div className="i-offers">
          {I.offers.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 90}>
              <article className="i-offer">
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="i-block">
          <h3 className="i-sub">Membership grades</h3>
          <p className="i-body">
            A graded credential gives a member something to earn and a client
            something to check.
          </p>
          <Table head={["Grade", "Letters", "Basis of admission"]} rows={I.grades} />
        </Reveal>

        <Reveal className="i-block">
          <h3 className="i-sub">Discipline faculties</h3>
          <p className="i-body">{I.faculties_intro}</p>
          <Table
            head={["Faculty", "Status", "Scope and technical standards"]}
            rows={I.faculties}
          />
          <p className="i-status">{I.status}</p>
        </Reveal>
      </section>

      {/* ---------------- SUMMIT ---------------- */}
      <section className="i-summit" id="summit">
        <div className="wrap">
          <Reveal className="i-head i-head-light">
            <span className="eyebrow">Summit</span>
            <h2>{M.name}</h2>
            <p className="i-strap">{M.strap}</p>
            <p className="i-lede">{M.intro}</p>
          </Reveal>

          <div className="i-summit-grid">
            <Reveal className="i-summit-main">
              <p>{M.body}</p>
              <h3 className="i-sub i-sub-light">Who should attend</h3>
              <p>{M.who}</p>
              <h3 className="i-sub i-sub-light">Working themes</h3>
              <ul className="i-themes">
                {M.themes.map(t => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <dl className="i-facts">
                {M.facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd className={v === "To be announced" ? "pending" : ""}>{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- CLOSING CTA (reuses Home's .h-cta) ---------------- */}
      <section className="wrap i-cta-wrap">
        <Reveal className="h-cta">
          <div>
            <h2>Want to take part?</h2>
            <p>Tell us which initiative interests you and we'll send the details.</p>
          </div>
          <Link className="btn-gold" to="/contact">Get in touch</Link>
        </Reveal>
      </section>
    </main>
  );
}