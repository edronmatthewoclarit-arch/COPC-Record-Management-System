import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

const defaultRecentActivities = [
  {
    name: "Rubie Jane Jabagat",
    action: "sent a document request",
    meta: "COPC Coordinator • Laboratory Information",
    time: "5:32 PM",
    tone: "request",
  },
  {
    name: "Maria Santos",
    action: "uploaded Teaching Loads",
    meta: "Program Head • Teaching Loads",
    time: "2:15 PM",
    tone: "upload",
  },
  {
    name: "Rubie Jane Jabagat",
    action: "requested a revision",
    meta: "COPC Coordinator • Syllabi",
    time: "10:01 AM",
    tone: "revision",
  },
  {
    name: "Rubie Jane Jabagat",
    action: "approved Curriculum Information",
    meta: "COPC Coordinator • Curriculum Information",
    time: "9:45 AM",
    tone: "approval",
  },
  {
    name: "Rubie Jane Jabagat",
    action: "sent a document request",
    meta: "COPC Coordinator • Facility Information",
    time: "8:20 AM",
    tone: "request",
  },
];

const defaultDocumentUpdates = [
  {
    name: "Maria Santos",
    action: "uploaded a document",
    meta: "Program Head • Teaching Loads",
    time: "1:21 PM",
    tone: "upload",
  },
  {
    name: "Rizal Lim",
    action: "uploaded a document",
    meta: "Office Representative • Laboratory Information",
    time: "5:21 PM",
    tone: "upload",
  },
  {
    name: "Ana Reyes",
    action: "uploaded a document",
    meta: "Faculty • Syllabi",
    time: "8:11 AM",
    tone: "upload",
  },
  {
    name: "Ana Reyes",
    action: "uploaded a revised document",
    meta: "Faculty • Syllabi",
    time: "10:41 AM",
    tone: "revision",
  },
  {
    name: "Ramon Castillo",
    action: "approved a document",
    meta: "Dean • Curriculum Information",
    time: "9:30 AM",
    tone: "approval",
  },
];

export function UserDashboard({
  role = "Program Head",
  setPage,
  documents = [],
  activities = [],
  documentUpdates = [],
}) {
  const isProgramHead = role === "Program Head";

  // Derive counts dynamically from active session documents
  const totalCount = documents.length;
  const approvedCount = documents.filter(
    (d) => (d.status || "").toLowerCase() === "approved"
  ).length;
  const pendingCount = documents.filter((d) => {
    const s = (d.status || "").toLowerCase();
    return s.includes("pending") || s.includes("requested");
  }).length;
  const revisionCount = documents.filter((d) =>
    (d.status || "").toLowerCase().includes("revision")
  ).length;

  return (
    <>
      <PageHead
        title={isProgramHead ? "Welcome, Program Head!" : `Welcome, ${role}!`}
      />

      <section className="card ph-dashboard-metrics">
        <div className="ph-metric-item">
          <span className="ph-metric-icon ph-icon-purple">
            <UiIcon name="file" />
          </span>
          <div className="ph-metric-info">
            <span className="ph-metric-number">{totalCount}</span>
            <span className="ph-metric-label">Total Documents</span>
          </div>
        </div>

        <div className="ph-metric-item">
          <span className="ph-metric-icon ph-icon-green">
            <UiIcon name="check-simple" />
          </span>
          <div className="ph-metric-info">
            <span className="ph-metric-number">{approvedCount}</span>
            <span className="ph-metric-label">Approved</span>
          </div>
        </div>

        <div className="ph-metric-item">
          <span className="ph-metric-icon ph-icon-amber">
            <UiIcon name="clock" />
          </span>
          <div className="ph-metric-info">
            <span className="ph-metric-number">{pendingCount}</span>
            <span className="ph-metric-label">Pending Request</span>
          </div>
        </div>

        <div className="ph-metric-item">
          <span className="ph-metric-icon ph-icon-red">
            <UiIcon name="edit" />
          </span>
          <div className="ph-metric-info">
            <span className="ph-metric-number">{revisionCount}</span>
            <span className="ph-metric-label">For Revision</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid bottom">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>
                <UiIcon name="clock" />
                Recent Activities
              </h2>
            </div>
          </div>

          {activities.length > 0 ? (
            activities.map((item) => (
              <div className="activity" key={`${item.name}-${item.time}`}>
                <i className={item.tone}>
                  <UiIcon
                    name={
                      item.tone === "upload"
                        ? "upload"
                        : item.tone === "revision"
                          ? "revision"
                          : item.tone === "approval"
                            ? "check-simple"
                            : "send"
                    }
                  />
                </i>
                <div>
                  <p>
                    <b>{item.name}</b> {item.action}
                  </p>
                  <span>{item.meta}</span>
                </div>
                <time>{item.time}</time>
              </div>
            ))
          ) : (
            <p className="empty-state">No recent activities yet.</p>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>
                <UiIcon name="file" />
                Document Updates
              </h2>
            </div>
          </div>

          {documentUpdates.length > 0 ? (
            documentUpdates.map((item) => (
              <div className="doc-update" key={`${item.name}-${item.time}`}>
                <i className={`update-icon ${item.tone}`}>
                  <UiIcon
                    name={item.tone === "approval" ? "check-simple" : "users"}
                  />
                </i>
                <div>
                  <p>
                    <b>{item.name}</b> {item.action}
                  </p>
                  <span>{item.meta}</span>
                </div>
                <time>{item.time}</time>
              </div>
            ))
          ) : (
            <p className="empty-state">No document updates yet.</p>
          )}
        </section>
      </div>
    </>
  );
}

export default UserDashboard;
