import { useEffect, useRef, useState } from "react";
import { ROLES, loginUser } from "../../api/UserAuthentication/auth.api";

export function Login({ onLogin }) {
  const [role, setRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      setError("");
      await loginUser({ email, password, role });
      onLogin(role, email);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page-shell">
      <div className="login-top-bar" />
      <main className="compact-login">
        <div className="login-brand-copy">
          <div className="login-brand-lockup">
            <img
              src="/assets/branding/msu-naawan-seal.png"
              alt="Mindanao State University at Naawan Seal"
              className="login-seal-img"
            />
            <div className="login-brand-text">
              <div className="copc-wordmark-row">
                <svg
                  className="copc-wordmark-svg"
                  viewBox="0 0 360 110"
                  role="img"
                  aria-label="COPC"
                >
                  <defs>
                    <mask id="copc-slice-mask">
                      <rect width="360" height="110" fill="white" />
                      <polygon points="0,38 330,45 0,53" fill="black" />
                    </mask>
                  </defs>
                  <g fill="#011647" mask="url(#copc-slice-mask)">
                    {/* C */}
                    <path d="M52,12 C26,12 8,30 8,54 C8,78 26,96 52,96 C70,96 84,86 90,71 L70,63 C66,72 60,77 52,77 C38,77 29,67 29,54 C29,41 38,31 52,31 C60,31 66,36 70,45 L90,37 C84,22 70,12 52,12 Z" />
                    {/* O */}
                    <path d="M138,12 C112,12 94,30 94,54 C94,78 112,96 138,96 C164,96 182,78 182,54 C182,30 164,12 138,12 Z M138,31 C152,31 161,41 161,54 C161,67 152,77 138,77 C124,77 115,67 115,54 C115,41 124,31 138,31 Z" />
                    {/* P */}
                    <path d="M190,14 L190,108 L211,108 L211,84 C217,91 226,96 238,96 C261,96 277,78 277,54 C277,30 261,12 238,12 C226,12 217,17 211,24 L211,14 Z M234,31 C248,31 256,41 256,54 C256,67 248,77 234,77 C220,77 211,67 211,54 C211,41 220,31 234,31 Z" />
                    {/* C */}
                    <path d="M320,12 C294,12 276,30 276,54 C276,78 294,96 320,96 C338,96 352,86 358,71 L338,63 C334,72 328,77 320,77 C306,77 297,67 297,54 C297,41 306,31 320,31 C328,31 334,36 338,45 L358,37 C352,22 338,12 320,12 Z" />
                  </g>
                </svg>
                <span className="copc-reg">®</span>
              </div>
              <p className="login-brand-subtitle">Record Management System</p>
              <span className="login-brand-campus">MSU - NAAWAN</span>
            </div>
          </div>
        </div>

        <section className="compact-login-card" aria-label="COPC Records Portal">
          <form onSubmit={submit}>
            <label htmlFor="login-role">Sign in as</label>
            <div className="role-dropdown" ref={dropdownRef}>
              <button
                id="login-role"
                type="button"
                className={`compact-field role-dropdown-trigger ${roleOpen ? "open" : ""}`}
                aria-haspopup="listbox"
                aria-expanded={roleOpen}
                onClick={() => setRoleOpen((prev) => !prev)}
              >
                <i aria-hidden="true">♙</i>
                <span className={role ? "selected" : "placeholder"}>
                  {role || "Users"}
                </span>
                <svg
                  className="role-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {roleOpen && (
                <ul className="role-dropdown-menu" role="listbox">
                  {ROLES.map((item) => (
                    <li key={item} role="option" aria-selected={role === item}>
                      <button
                        type="button"
                        className={`role-dropdown-option ${role === item ? "active" : ""}`}
                        onClick={() => {
                          setRole(item);
                          setRoleOpen(false);
                        }}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label htmlFor="login-email">Email address</label>
            <div className="compact-field">
              <i aria-hidden="true">✉</i>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label htmlFor="login-password">Password</label>
            <div className="compact-field">
              <i aria-hidden="true">▣</i>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="compact-login-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <span>Secure sign-in</span>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="compact-signin" type="submit">
              Sign in <span aria-hidden="true">→</span>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Login;
