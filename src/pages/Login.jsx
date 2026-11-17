import { useState } from "react";
import { ROLES, loginUser } from "../api/UserAuthentication/auth.api";

export function Login({ onLogin }) {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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
    <main className="compact-login">
      <div className="compact-login-overlay" />
      <section className="compact-login-card" aria-label="COPC Records Portal">
        <form onSubmit={submit}>
          <label htmlFor="login-role">Sign in as</label>
          <div className="compact-field">
            <i aria-hidden="true">♙</i>
            <select
              id="login-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="" disabled hidden>
                Users
              </option>
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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

      <div className="login-brand-copy">
        <span>MSU Naawan</span>
        <h2>Certificate of Program Compliance</h2>
        <p>
          A centralized workspace for program requirements, document
          submissions, reviews, and records.
        </p>
      </div>
    </main>
  );
}

export default Login;
