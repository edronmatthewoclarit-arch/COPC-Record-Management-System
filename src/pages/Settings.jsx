import PageHead from "../components/ui/PageHead";

export function Settings() {
  return (
    <>
      <PageHead
        title="Account Settings"
        subtitle="Manage your profile, security, and notification preferences."
      />

      <div className="settings-grid">
        <section className="card form-card">
          <h2>Profile information</h2>
          <p>
            Your role and assigned program are managed by the university.
          </p>
          <div className="profile-row">
            <div className="avatar large">U</div>
            <div>
              <b>Account</b>
              <span></span>
            </div>
            <button className="btn secondary">Change photo</button>
          </div>

          <div className="form-grid">
            <label>
              Full name
              <input defaultValue="" />
            </label>
            <label>
              Email address
              <input defaultValue="" />
            </label>
            <label>
              Role
              <input value="" disabled />
            </label>
            <label>
              Assigned program
              <input value="" disabled />
            </label>
          </div>

          <button className="btn primary">Save changes</button>
        </section>

        <section className="card form-card">
          <h2>Security</h2>
          {["Current password", "New password", "Confirm new password"].map(
            (x) => (
              <label key={x}>
                {x}
                <input type="password" aria-label="Password" />
              </label>
            )
          )}
          <button className="btn secondary">Change password</button>
        </section>

        <section className="card form-card notifications-settings">
          <h2>Notification preferences</h2>
          {[
            "Document requests",
            "Revision requests",
            "New submissions",
            "Document approvals",
          ].map((x) => (
            <label key={x}>
              <span>
                <b>{x}</b>
                <small>Receive in-app notifications</small>
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
        </section>
      </div>
    </>
  );
}

export default Settings;
