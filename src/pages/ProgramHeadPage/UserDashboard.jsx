import { initialProgramHeadDashboard } from "../../api/ProgramHeadViewAPI/dashboard.api";
import PageHead from "../../components/ui/PageHead";
import Stat from "../../components/ui/Stat";

export function UserDashboard({ role, setPage }) {
  const { stats, requestsRequiringAction, recentSubmissionActivity } =
    initialProgramHeadDashboard;

  return (
    <>
      <PageHead title="Dashboard" subtitle={role} />

      <div className="stats">
        <Stat
          n={String(stats.pendingRequests)}
          label="Pending Requests"
          tone="amber"
        />
        <Stat n={String(stats.submitted)} label="Submitted" tone="blue" />
        <Stat n={String(stats.forRevision)} label="For Revision" tone="red" />
        <Stat n={String(stats.approved)} label="Approved" tone="green" />
      </div>

      <section className="card table-card user-action-card">
        <div className="section-head">
          <h2>Requests Requiring Action</h2>
          <button className="link" onClick={() => setPage("requests")}>
            View All
          </button>
        </div>
        {requestsRequiringAction.length === 0 && (
          <p className="empty-state">No requests yet.</p>
        )}
      </section>

      <section className="card user-activity-card">
        <h2>Recent Submission Activity</h2>
        {recentSubmissionActivity.length === 0 && (
          <p className="empty-state">No submission activity yet.</p>
        )}
      </section>
    </>
  );
}

export default UserDashboard;
