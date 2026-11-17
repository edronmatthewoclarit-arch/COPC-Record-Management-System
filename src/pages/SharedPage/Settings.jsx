import { useState } from "react";
import PageHead from "../../components/ui/PageHead";

export function Settings({
  role = "COPC Coordinator",
  user = { name: "Account", initials: "U", email: "" },
  theme = "light",
  setTheme,
  onSaveToast,
}) {
  const [fullName] = useState(user.name || "Account");
  const [assignedProgram] = useState(
    "Bachelor of Science in Information Technology"
  );
  const [emails, setEmails] = useState([user.email || ""]);
  const [contacts, setContacts] = useState([""]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleSaveProfile(e) {
    e.preventDefault();
    if (onSaveToast) {
      onSaveToast("Profile changes saved.");
    }
  }

  function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setPasswordError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    if (onSaveToast) {
      onSaveToast("Password updated successfully.");
    }
  }

  return (
    <>
      <PageHead title="Account Settings" />

      <div className="account-settings-grid">
        <div className="account-settings-left">
          <section className="card form-card account-profile-card">
            <h2>Profile Information</h2>

            <div className="profile-row">
              <div className="avatar large">{user.initials || "U"}</div>
              <div>
                <b>{fullName}</b>
                <span>{role}</span>
              </div>
              <button type="button" className="btn secondary">
                Change Photo
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    className="readonly-tinted"
                    value={fullName}
                    readOnly
                  />
                </label>

                <label>
                  Assigned Program
                  <input
                    className="readonly-tinted"
                    value={assignedProgram}
                    readOnly
                  />
                </label>

                <div className="multi-field-group">
                  <div className="label-with-add">
                    <span>Email Address</span>
                    <button
                      type="button"
                      className="add-field-pill"
                      aria-label="Add email address"
                      onClick={() => setEmails((prev) => [...prev, ""])}
                    >
                      +
                    </button>
                  </div>
                  {emails.map((val, idx) => (
                    <input
                      key={`email-${idx}`}
                      type="email"
                      value={val}
                      placeholder="name@msunaawan.edu.ph"
                      onChange={(e) => {
                        const next = [...emails];
                        next[idx] = e.target.value;
                        setEmails(next);
                      }}
                    />
                  ))}
                </div>

                <div className="multi-field-group">
                  <div className="label-with-add">
                    <span>Contact number</span>
                    <button
                      type="button"
                      className="add-field-pill"
                      aria-label="Add contact number"
                      onClick={() => setContacts((prev) => [...prev, ""])}
                    >
                      +
                    </button>
                  </div>
                  {contacts.map((val, idx) => (
                    <input
                      key={`contact-${idx}`}
                      type="tel"
                      value={val}
                      placeholder="09XXXXXXXXX"
                      onChange={(e) => {
                        const next = [...contacts];
                        next[idx] = e.target.value;
                        setContacts(next);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="save-changes-row">
                <button type="submit" className="btn primary">
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          <section className="card form-card appearance-card">
            <div className="appearance-row">
              <div>
                <h2>Appearance</h2>
                <p>Switch between Light and Dark mode for the workspace.</p>
              </div>

              <div
                className="theme-toggle-group"
                role="group"
                aria-label="Theme mode"
              >
                <button
                  type="button"
                  className={`theme-option ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme && setTheme("light")}
                >
                  ☀ Light
                </button>
                <button
                  type="button"
                  className={`theme-option ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme && setTheme("dark")}
                >
                  ☾ Dark
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="card form-card account-password-card">
          <h2>Password</h2>
          <form onSubmit={handleChangePassword}>
            <label>
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                aria-label="Current Password"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-label="New Password"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-label="Confirm New Password"
              />
            </label>

            {passwordError && (
              <p className="login-error" role="alert">
                {passwordError}
              </p>
            )}

            <button type="submit" className="btn primary change-password-btn">
              Change Password
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

export default Settings;
