import { useEffect, useState } from "react";
import { get, post } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import Reveal from "./Reveal.jsx";
import "./Contact.css";

const PIN = "M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z";
const PHONE = "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z";
const CHECK = "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z";

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function Contact() {
  const [desks, setDesks] = useState([]);
  const [f, setF] = useState({ name: "", contact: "", desk: "", message: "", website: "" });
  const [state, setState] = useState("idle");
  const [errs, setErrs] = useState({});
  const [siteInfo, setSiteInfo] = useState({
    address: "Near Liberation Christian Centre, Bomso, Kumasi, Ashanti Region, Ghana",
    phones: ["+233 (0) 243 555 882", "+233 (0) 243 257 214"],
  });
  const { addToast } = useToast();

  useEffect(() => {
    get("/desks/")
      .then(setDesks)
      .catch(err => {
        console.error("Failed to load desks:", err);
        addToast(err.message || "Could not load desks", "error");
      });

    get("/site/")
      .then(data => setSiteInfo(data))
      .catch(err => {
        console.error("Failed to load site info:", err);
        // Keep default values on error
      });
  }, []);

  const on = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setState("sending");
    setErrs({});
    try {
      await post("/enquiries/", { ...f, desk: f.desk || null });
      setState("done");
      addToast("Enquiry sent successfully! We'll be in touch soon.", "success");
    } catch (x) {
      setErrs(x.data || {});
      setState(x.status === 429 ? "throttled" : "error");
      console.error("Form submission error:", x);
      if (x.status === 429) {
        addToast("Too many enquiries. Please call us instead.", "error");
      } else if (!Object.keys(x.data || {}).length) {
        addToast(x.message || "Could not send enquiry. Please try again.", "error");
      }
    }
  };

  const Err = ({ k }) =>
    errs[k] ? (
      <p className="c-err" id={`err-${k}`} role="alert">
        {errs[k]}
      </p>
    ) : null;

  return (
    <main className="contact-page">
      <section className="c-hero">
        <div className="wrap c-grid">
          {/* ---------------- LEFT: intro + details ---------------- */}
          <div className="c-intro">
            <Reveal>
              <span className="eyebrow">Contact</span>
            </Reveal>
            <Reveal delay={100}>
              <h1>Tell us what you are moving</h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="c-lede">
                A first conversation costs nothing and usually settles whether we
                are the right firm for the job. If we are not, we will say so.
              </p>
            </Reveal>

            <div className="c-details">
              <Reveal delay={300}>
                <div className="c-detail">
                  <span className="c-detail-ico"><Icon d={PIN} /></span>
                  <address>
                    <b>Kumasi office</b>
                    <span style={{ whiteSpace: "pre-line" }}>
                      {siteInfo.address || "Near Liberation Christian Centre\nBomso, Kumasi\nAshanti Region, Ghana"}
                    </span>
                  </address>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <div className="c-detail">
                  <span className="c-detail-ico"><Icon d={PHONE} /></span>
                  <p>
                    <b>Call us</b>
                    {siteInfo.phones && siteInfo.phones.length > 0 ? (
                      siteInfo.phones.map((phone, i) => (
                        <a key={i} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>
                          {phone}
                        </a>
                      ))
                    ) : (
                      <>
                        <a href="tel:+233243555882">+233 (0) 243 555 882</a>
                        <a href="tel:+233243257214">+233 (0) 243 257 214</a>
                      </>
                    )}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ---------------- RIGHT: form card ---------------- */}
          <Reveal delay={200} className="c-card-wrap">
            <div className="c-card">
              {state === "done" ? (
                <div className="c-ok" role="status">
                  <span className="c-ok-ico"><Icon d={CHECK} /></span>
                  <h2>Enquiry received</h2>
                  <p>We will reply to the contact detail you gave us.</p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h2 className="c-form-title">Send an enquiry</h2>

                  <label className="c-field">
                    <span>Your name</span>
                    <input
                      value={f.name}
                      onChange={on("name")}
                      required
                      autoComplete="name"
                      aria-invalid={!!errs.name}
                      aria-describedby={errs.name ? "err-name" : undefined}
                    />
                  </label>
                  <Err k="name" />

                  <label className="c-field">
                    <span>Email or phone</span>
                    <input
                      value={f.contact}
                      onChange={on("contact")}
                      required
                      aria-invalid={!!errs.contact}
                      aria-describedby={errs.contact ? "err-contact" : undefined}
                    />
                  </label>
                  <Err k="contact" />

                  <label className="c-field">
                    <span>Which desk</span>
                    <select value={f.desk} onChange={on("desk")}>
                      <option value="">Not sure yet</option>
                      {desks.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="c-field">
                    <span>What are you buying, selling, raising or placing?</span>
                    <textarea
                      rows="5"
                      value={f.message}
                      onChange={on("message")}
                      required
                      aria-invalid={!!errs.message}
                      aria-describedby={errs.message ? "err-message" : undefined}
                    />
                  </label>
                  <Err k="message" />

                  <input
                    className="c-hp"
                    tabIndex="-1"
                    autoComplete="off"
                    aria-hidden="true"
                    value={f.website}
                    onChange={on("website")}
                  />

                  {state === "throttled" && (
                    <p className="c-err c-err-box" role="alert">
                      Too many enquiries from this connection. Please call us instead.
                    </p>
                  )}
                  {state === "error" && !Object.keys(errs).length && (
                    <p className="c-err c-err-box" role="alert">
                      We could not send that. Please call +233 (0) 243 555 882.
                    </p>
                  )}

                  <button className="btn-gold c-submit" disabled={state === "sending"}>
                    {state === "sending" ? "Sending" : "Send enquiry"}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}