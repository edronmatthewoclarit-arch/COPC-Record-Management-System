import PageHead from "../components/ui/PageHead";
import Stat from "../components/ui/Stat";

export function UserDashboard({ role, setPage }) {
  return (
    <>
      <PageHead title="Dashboard" subtitle={role} />

      <div className="stats">
        <Stat n="0" label="Pending Requests" tone="amber" />
        <Stat n="0" label="Submitted" tone="blue" />
        <Stat n="0" label="For Revision" tone="red" />
        <Stat n="0" label="Approved" tone="green" />
      </div>

      <section className="card table-card user-action-card">
        <div className="section-head">
          <h2>Requests Requiring Action</h2>
          <button className="link" onClick={() => setPage("requests")}>
            View All
          </button>
        </div>
        <p className="empty-state">No requests yet.</p>
      </section>

      <section className="card user-activity-card">
        <h2>Recent Submission Activity</h2>
        <p className="empty-state">No submission activity yet.</p>
      </section>
    </>
  );
}

export default UserDashboard;
