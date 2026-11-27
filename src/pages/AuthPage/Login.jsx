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
      <div className="login-brand">
        <span className="login-brand-eyebrow">MSU NAAWAN • COPC</span>
        <img
          src="/assets/branding/msu-naawan-seal.png"
          alt="Mindanao State University at Naawan Seal"
          className="login-seal-img"
        />
        <div className="login-brand-bottom">
          <h2 className="login-brand-title">COPC Record Management System</h2>
          <p className="login-brand-desc">
            Workspace for COPC requirements, faculty information, and program progress.
          </p>
        </div>
      </div>

      <section className="login-form-panel" aria-label="COPC Records Portal">
        <div className="login-form-head">
          <h2>Welcome back</h2>
          <p>Sign in with your university account to continue.</p>
        </div>

        <form onSubmit={submit}>
          <label htmlFor="login-role">Users</label>
          <div className="role-dropdown" ref={dropdownRef}>
            <button
              id="login-role"
              type="button"
              className={`login-field role-dropdown-trigger ${roleOpen ? "open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={roleOpen}
              onClick={() => setRoleOpen((prev) => !prev)}
            >
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

          <label htmlFor="login-email">
            Username <span className="req">*</span>
          </label>
          <div className="login-field">
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="Enter your username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <label htmlFor="login-password">
            Password <span className="req">*</span>
          </label>
          <div className="login-field">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="login-toggle"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-submit" type="submit">
            Sign in <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="login-divider" />
      </section>
    </div>
  );
}

export default Login;
