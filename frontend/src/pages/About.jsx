import { useEffect, useState } from "react";
import { get, getContent } from "../api.js";
import S from "../data/static.json";
import { vision, mission, values } from "../content.js";
import { PersonCard } from "./Network.jsx";
import { useToast } from "../ToastContext.jsx";
import Reveal from "./Reveal.jsx";
import "./About.css";

export default function About() {
  const [dirs, setDirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({
    vision: vision,
    mission: mission,
    values: values,
  });
  const { addToast } = useToast();

  const fetchDirectors = () => {
    setLoading(true);
    setError(null);
    get("/people/?kind=director")
      .then(setDirs)
      .catch(err => {
        console.error("Failed to load directors:", err);
        const errorMsg = err.message || err;
        setError(errorMsg);
        addToast(errorMsg, "error");
      })
      .finally(() => setLoading(false));
  };

  const fetchContent = async () => {
    try {
      const [visionData, missionData, valuesData] = await Promise.all([
        getContent("about.vision", vision),
        getContent("about.mission", mission),
        getContent("about.values", values),
      ]);
      setContent({
        vision: visionData,
        mission: missionData,
        values: valuesData,
      });
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  useEffect(() => {
    fetchDirectors();
    fetchContent();
  }, []);

  return (
    <main className="about">
      {/* Hero */}
      <section className="a-hero">
        <div className="wrap a-hero-in">
          <Reveal>
            <span className="eyebrow">About us</span>
          </Reveal>
          <Reveal delay={100}>
            <h1>What we stand for</h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="a-lede">
              These are not decoration. They are the standards our clients are entitled to hold us to, and the terms on which we ask to be judged.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Vision + Mission */}
      <div className="wrap">
        <Reveal>
          <div className="a-vm">
            <div className="a-vm-card">
              <span className="a-vm-label">Our vision</span>
              <p>{content.vision}</p>
            </div>
            <div className="a-vm-card">
              <span className="a-vm-label">Our mission</span>
              <p>{content.mission}</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Values */}
      <section className="a-section a-alt">
        <div className="wrap">
          <Reveal>
            <div className="a-head">
              <h2>Our values</h2>
              <p className="a-sub">
                Five commitments govern how we work. They are worded plainly because they are meant to be enforceable, not admired.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="a-values">
              {content.values.map(([t, d], i) => (
                <article className="a-value" key={t}>
                  <span className="a-value-num">0{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="a-section wrap" id="philosophy">
        <Reveal>
          <div className="a-head">
            <h2>Our philosophy</h2>
            <p className="a-sub">
              Four convictions sit underneath the way this firm operates. The method they produce is set out on the How we work page.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <ol className="a-steps">
            {S.philosophy.map(([t, d], i) => (
              <li className="a-step" key={t}>
                <div className="a-step-dot">{i + 1}</div>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Standards */}
      <section className="a-standards" id="standards">
        <div className="wrap">
          <Reveal>
            <div className="a-head light">
              <h2>Our standards</h2>
              <p className="a-sub">{S.standards_lede}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ul className="a-rules">
              {S.standards.map((s, i) => (
                <li key={i}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* People */}
      <section className="a-section wrap" id="people">
        <Reveal>
          <div className="a-head">
            <h2>Who we are</h2>
            <p className="a-sub">{S.people_lede}</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="a-people">
            {error ? (
              <div className="a-error">
                <p>{error || "Our leadership could not be loaded."}</p>
                <button className="btn-gold" onClick={fetchDirectors}>
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="a-bench" aria-hidden="true">
                {[0, 1, 2].map(i => (
                  <div key={i} className="a-skeleton" />
                ))}
              </div>
            ) : (
              <div className="a-bench">
                {dirs.map(p => (
                  <PersonCard key={p.name} p={p} />
                ))}
              </div>
            )}
            <aside className="a-facts">
              <h3>Registered particulars</h3>
              <ul>
                {Object.entries(S.particulars).map(([k, v]) => (
                  <li key={k}>
                    <b>{k}</b>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
