import { Link } from "react-router-dom";
import { conditions, stages } from "../content.js";
import Reveal from "./Reveal.jsx";
import "./How.css";

const pad = i => String(i + 1).padStart(2, "0");

export default function How() {
  return (
    <main className="how">
      {/* ---------------- HERO + CONDITIONS ---------------- */}
      <section className="w-hero">
        <div className="wrap">
          <div className="w-hero-in">
            <Reveal>
              <span className="eyebrow">Our method</span>
            </Reveal>
            <Reveal delay={100}>
              <h1>How we work</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="w-lede">
                Most brokers work at one point in a transaction. They introduce,
                take a commission and move on, which is why deals collapse in
                diligence and valuations fail to hold. We think brokerage value is
                created along a chain, and the chain breaks wherever a link is
                missing.
              </p>
            </Reveal>
          </div>

          <div className="w-chain">
            {conditions.map(([t, d], i) => (
              <Reveal key={t} delay={i * 90}>
                <article className="w-link">
                  <span className="w-link-tag">Link {pad(i)}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- STAGES ---------------- */}
      <section className="wrap w-stages">
        <Reveal className="w-stages-intro">
          <span className="eyebrow dark">The process</span>
          <h2>What happens after you appoint us</h2>
          <p className="lede">
            Every mandate moves through the same five stages. The depth of each
            varies with the size of the deal. The sequence does not.
          </p>
        </Reveal>

        <ol className="w-steps">
          {stages.map(([t, d, r], i) => (
            <li key={t}>
              <Reveal delay={i * 80}>
                <div className="w-step">
                  <span className="w-step-dot">{i + 1}</span>
                  <div className="w-step-card">
                    <h3>{t}</h3>
                    <p>{d}</p>
                    <div className="w-get">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                      </svg>
                      <p>
                        <b>You receive</b>
                        <span>{r}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- CLOSING CTA (reuses Home's .h-cta) ---------------- */}
      <section className="wrap">
        <Reveal className="h-cta">
          <div>
            <h2>Ready to appoint a lead broker?</h2>
            <p>Tell us what you're working on and we'll start with the right desk.</p>
          </div>
          {/* adjust the route to wherever your contact page lives */}
          <Link className="btn-gold" to="/contact">Get in touch</Link>
        </Reveal>
      </section>
    </main>
  );
}