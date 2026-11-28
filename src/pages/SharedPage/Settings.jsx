import { useState } from "react";
import PageHead from "../../components/ui/PageHead";

const defaultProfiles = {
  "COPC Coordinator": {
    name: "Cathlyn Agua",
    initials: "CA",
    roleLabel: "COPC coordinator",
    email: "cathlyn.agua@msunaawan.edu.ph",
    contact: "cathlyn.agua@msunaawan.edu.ph",
  },
  "Program Head": {
    name: "Prof. Danilo Gomez",
    initials: "DG",
    roleLabel: "Program Head",
    email: "danilo.gomez@msunaawan.edu.ph",
    contact: "danilo.gomez@msunaawan.edu.ph",
  },
  Dean: {
    name: "Dr. Ramon Castillo",
    initials: "RC",
    roleLabel: "Dean",
    email: "ramon.castillo@msunaawan.edu.ph",
    contact: "ramon.castillo@msunaawan.edu.ph",
  },
  Faculty: {
    name: "Maria Santos",
    initials: "MS",
    roleLabel: "Faculty",
    email: "maria.santos@msunaawan.edu.ph",
    contact: "maria.santos@msunaawan.edu.ph",
  },
  "Office Representative": {
    name: "Rizal Lim",
    initials: "RL",
    roleLabel: "Office Representative",
    email: "rizal.lim@msunaawan.edu.ph",
    contact: "rizal.lim@msunaawan.edu.ph",
  },
};

export function Settings({
  role = "COPC Coordinator",
  user = { name: "Account", initials: "U", email: "" },
  onSaveToast,
}) {
  const profile = defaultProfiles[role] || {
    name: user?.name && user.name !== "Account" ? user.name : "Cathlyn Agua",
    initials: user?.initials && user.initials !== "U" ? user.initials : "CA",
    roleLabel: role,
    email: user?.email || "cathlyn.agua@msunaawan.edu.ph",
    contact: "cathlyn.agua@msunaawan.edu.ph",
  };

  const [fullName] = useState(
    user?.name && user.name !== "Account" ? user.name : profile.name
  );
  const [assignedProgram] = useState(
    "Bachelor of Science in Information Technology"
  );
  const [emails, setEmails] = useState([
    user?.email || profile.email
  ]);
  const [contacts, setContacts] = useState([
    profile.contact
  ]);

  const [currentPassword, setCurrentPassword] = useState("**********");
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
    setCurrentPassword("**********");
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
        <section className="card form-card account-profile-card">
          <h2>Profile Information</h2>

          <div className="profile-row">
            <div className="avatar large">{profile.initials}</div>
            <div>
              <b>{fullName}</b>
              <span>{profile.roleLabel}</span>
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
                    type="text"
                    value={val}
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