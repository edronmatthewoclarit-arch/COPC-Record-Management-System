import { initialCoordinatorDashboard } from "../../api/CopcViewAPI/dashboard.api";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function CoordinatorDashboard({ setPage }) {
  const { progress, recentActivities, documentUpdates } =
    initialCoordinatorDashboard;

  return (
    <>
      <PageHead
        title="Welcome, COPC Coordinator!"
        subtitle="Bachelor of Science in Information Technology"
      />

      <div className="dashboard-grid progress-only">
        <section className="card progress-card">
          <div className="section-head">
            <div>
              <h2>
                <UiIcon name="chart" />
                Program Requirement Progress
              </h2>
            </div>
          </div>

          <div className="progress-content">
            <div className="ring">
              <div>
                <strong>{progress.completionPercentage}%</strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="legend">
              <div>
                <i className="navy" />
                <span>Total Requirements</span>
                <b>{progress.totalRequirements}</b>
              </div>
              <div>
                <i className="green" />
                <span>Approved</span>
                <b>{progress.approved}</b>
              </div>
              <div>
                <i className="amber" />
                <span>Pending</span>
                <b>{progress.pending}</b>
              </div>
              <div>
                <i className="red" />
                <span>For Revision</span>
                <b>{progress.forRevision}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid bottom">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>
                <UiIcon name="clock" />
                Recent Activities
              </h2>
            </div>
            <button className="link" onClick={() => setPage("requests")}>
              View All
            </button>
          </div>

          {recentActivities.map((item) => (
            <div className="activity" key={`${item.name}-${item.time}`}>
              <i className={item.tone}>
                <UiIcon
                  name={
                    item.tone === "upload"
                      ? "upload"
                      : item.tone === "revision"
                        ? "revision"
                        : item.tone === "approval"
                          ? "check"
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
          ))}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>
                <UiIcon name="file" />
                Document Updates
              </h2>
            </div>
            <button className="link" onClick={() => setPage("documents")}>
              View All
            </button>
          </div>

          {documentUpdates.map((item) => (
            <div className="doc-update" key={`${item.name}-${item.time}`}>
              <i className={`update-icon ${item.tone}`}>
                <UiIcon name={item.tone === "approval" ? "check" : "users"} />
              </i>
              <div>
                <p>
                  <b>{item.name}</b> {item.action}
                </p>
                <span>{item.meta}</span>
              </div>
              <time>{item.time}</time>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default CoordinatorDashboard;
