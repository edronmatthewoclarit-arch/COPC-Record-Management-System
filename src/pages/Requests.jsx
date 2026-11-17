import { initialRequests } from "../api/CopcViewAPI/document.api";
import Badge from "../components/ui/Badge";
import PageHead from "../components/ui/PageHead";

export function Requests({ setPage }) {
  return (
    <>
      <PageHead
        title="Document Requests"
        subtitle="Track requests for Bachelor of Science in Information Technology."
        action={<button className="btn primary">＋ New request</button>}
      />

      <section className="card table-card">
        <div className="toolbar stacked">
          <div className="search">
            ⌕ <input aria-label="Search requests" />
          </div>
          <div className="tabs">
            {[
              "All",
              "Requested",
              "Submitted",
              "For Revision",
              "Resubmitted",
              "Approved",
            ].map((x, i) => (
              <button key={x} className={i === 0 ? "active" : ""}>
                {x}
              </button>
            ))}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Requested from</th>
              <th>Role</th>
              <th>Date requested</th>
              <th>Status</th>
              <th>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {initialRequests.map((r) => (
              <tr
                key={r[0]}
                className="clickable-row"
                onClick={() =>
                  setPage(r[4] === "Submitted" ? "review" : "requestDetail")
                }
              >
                <td>
                  <b>{r[0]}</b>
                </td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td>{r[3]}</td>
                <td>
                  <Badge status={r[4]} />
                </td>
                <td>{r[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function RequestDetail({ setPage }) {
  return (
    <>
      <button className="back" onClick={() => setPage("requests")}>
        ← Back to requests
      </button>
      <PageHead
        title="Request Details"
        subtitle="Request information will appear here when a request is selected."
      />
      <section className="card">
        <p className="empty-state">No request selected.</p>
      </section>
    </>
  );
}

export default Requests;
