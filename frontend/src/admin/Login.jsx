import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Login.css";

/* ---------- Validation rules (adjust to match your backend) ---------- */
const validators = {
  username: v => {
    const t = v.trim();
    if (!t) return "Please enter your username.";
    if (t.length < 3) return "Username must be at least 3 characters.";
    if (/\s/.test(t)) return "Username cannot contain spaces.";
    return "";
  },
  password: v => {
    if (!v) return "Please enter your password.";
    if (v.length < 6) return "Password must be at least 6 characters.";
    return "";
  },
};

/* ---------- Icons ---------- */
const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICONS = {
  user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z",
  eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  eyeOff:
    "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
};

export default function Login() {
  const [values, setValues] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const refs = { username: useRef(null), password: useRef(null) };

  const errors = {
    username: validators.username(values.username),
    password: validators.password(values.password),
  };
  const shown = f => (touched[f] ? errors[f] : "");

  const onChange = f => e => {
    setValues(v => ({ ...v, [f]: e.target.value }));
    if (error) setError("");
  };
  const onBlur = f => () => setTouched(t => ({ ...t, [f]: true }));
  const checkCaps = e => setCapsOn(!!e.getModifierState?.("CapsLock"));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setTouched({ username: true, password: true });

    const firstBad = ["username", "password"].find(f => errors[f]);
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }

    setLoading(true);
    try {
      await login(values.username.trim(), values.password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      {/* ---------------- Brand panel (desktop) ---------------- */}
      <aside className="lg-brand" aria-hidden="true">
        <div className="lg-brand-in">
          <div className="lg-logo-ring">
            <img src="/logo2.jpeg" alt="" className="lg-logo" />
          </div>
          <h2>TBB Admin</h2>
          <span className="lg-rule" />
          <p>Manage your website content, desks and people from one secure place.</p>
        </div>
      </aside>

      {/* ---------------- Form panel ---------------- */}
      <main className="lg-side">
        <div className="lg-card">
          <header className="lg-header">
            <div className="lg-logo-ring lg-logo-ring-sm">
              <img src="/logo2.jpeg" alt="TBB logo" className="lg-logo" />
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to manage your content</p>
          </header>

          <form onSubmit={handleSubmit} className="lg-form" noValidate>
            {error && (
              <div className="lg-alert" role="alert">
                <Icon d={ICONS.warn} />
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className={`lg-field${shown("username") ? " has-error" : ""}`}>
              <label htmlFor="username">Username</label>
              <div className="lg-input">
                <span className="lg-lead"><Icon d={ICONS.user} /></span>
                <input
                  ref={refs.username}
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={values.username}
                  onChange={onChange("username")}
                  onBlur={onBlur("username")}
                  placeholder="Enter your username"
                  aria-invalid={!!shown("username")}
                  aria-describedby={shown("username") ? "username-err" : undefined}
                />
              </div>
              {shown("username") && (
                <p className="lg-err" id="username-err">{shown("username")}</p>
              )}
            </div>

            {/* Password */}
            <div className={`lg-field${shown("password") ? " has-error" : ""}`}>
              <label htmlFor="password">Password</label>
              <div className="lg-input">
                <span className="lg-lead"><Icon d={ICONS.lock} /></span>
                <input
                  ref={refs.password}
                  type={showPw ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={onChange("password")}
                  onBlur={e => { onBlur("password")(); setCapsOn(false); }}
                  onKeyUp={checkCaps}
                  onKeyDown={checkCaps}
                  placeholder="Enter your password"
                  aria-invalid={!!shown("password")}
                  aria-describedby={shown("password") ? "password-err" : undefined}
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPw(s => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  title={showPw ? "Hide password" : "Show password"}
                >
                  <Icon d={showPw ? ICONS.eyeOff : ICONS.eye} />
                </button>
              </div>
              {shown("password") && (
                <p className="lg-err" id="password-err">{shown("password")}</p>
              )}
              {capsOn && !shown("password") && (
                <p className="lg-hint">Caps Lock is on.</p>
              )}
            </div>

            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="lg-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <footer className="lg-footer">
            <a href="/">
              <Icon d={ICONS.back} />
              Back to website
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}