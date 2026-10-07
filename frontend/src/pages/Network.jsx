import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api.js";
import S from "../data/static.json";
import { useToast } from "../ToastContext.jsx";
import Reveal from "./Reveal.jsx";
import "./Network.css";

const initials = name =>
  (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

export const PersonCard = ({ p }) => (
  <article className="n-person">
    {p.photo ? (
      <img
        className="n-person-photo"
        src={p.photo}
        alt=""
        width="96"
        height="96"
        loading="lazy"
      />
    ) : (
      <span className="n-person-photo n-person-initials" aria-hidden="true">
        {initials(p.name)}
      </span>
    )}
    <div className="n-person-body">
      <h3>{p.name}</h3>
      {p.qualifications && <p className="n-person-quals">{p.qualifications}</p>}
      <p className="n-person-port">{p.portfolio || p.role}</p>
      {p.profile && <p className="n-person-profile">{p.profile}</p>}
    </div>
  </article>
);

export default function Network() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const { addToast } = useToast();

  const fetchAdvisers = () => {
    setLoading(true);
    setErr(null);
    get("/people/?kind=adviser")
      .then(setPeople)
      .catch(err => {
        console.error("Failed to load advisers:", err);
        const errorMsg = err.message || err;
        setErr(errorMsg);
        addToast(errorMsg, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdvisers();
  }, []);

  return (
    <main className="network">
      {/* ---------------- HERO ---------------- */}
      <section className="n-hero">
        <div className="wrap">
          <div className="n-hero-in">
            <Reveal>
              <span className="eyebrow">Our network</span>
            </Reveal>
            <Reveal delay={100}>
              <h1>Our professional network</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="n-lede">{S.network_lede}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- ADVISERS ---------------- */}
      <section className="wrap n-advisers">
        {err && (
          <div className="n-empty" role="alert">
            <p>{err || "The advisers could not be loaded. Please try again."}</p>
            <button className="btn-gold" onClick={fetchAdvisers}>Try again</button>
          </div>
        )}
        {loading && !err && (
          <div className="n-bench" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <div key={i} className="n-skeleton" />
            ))}
          </div>
        )}
        {!loading && !err && (
          <div className="n-bench">
            {people.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 90}>
                <PersonCard p={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- ASSOCIATES ---------------- */}
      <section className="n-assoc">
        <div className="wrap n-assoc-in">
          <Reveal className="n-assoc-intro">
            <span className="eyebrow">Specialists</span>
            <h2 id="associates">Associates we call on</h2>
            <p className="n-lede">{S.associates_lede}</p>
          </Reveal>

          <Reveal delay={120}>
            <ul className="n-tags">
              {S.associates.map(a => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CLOSING CTA (reuses Home's .h-cta) ---------------- */}
      <section className="wrap n-cta-wrap">
        <Reveal className="h-cta">
          <div>
            <h2>Need a specialist for your deal?</h2>
            <p>{S.associates_cta}</p>
          </div>
          <Link className="btn-gold" to="/contact">Get in touch</Link>
        </Reveal>
      </section>
    </main>
  );
}