import { useState } from "react";
import { initialProgramHeadRequests } from "../../api/ProgramHeadViewAPI/request.api";
import { initialFacultyRecords } from "../../api/ProgramHeadViewAPI/faculty.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import NewRequestModal from "./NewRequestModal";

  export function Requests({
    setPage,
    requests = initialProgramHeadRequests,
    onSelectRequest,
    openNewRequest,
    facultyRecords = initialFacultyRecords,
    onAddFaculty,
    onAddRequest,
  }) {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");
    const [internalModalOpen, setInternalModalOpen] = useState(false);

    const handleOpenModal = () => {
      if (openNewRequest) {
        openNewRequest();
      } else {
        setInternalModalOpen(true);
      }
    };

    const getDocName = (r) => (Array.isArray(r) ? r[0] : r.documentName || r.name);
    const getUploader = (r) => (Array.isArray(r) ? r[1] : r.uploader);
    const getRole = (r) => (Array.isArray(r) ? r[2] : r.role || r.position);
    const getDate = (r) => (Array.isArray(r) ? r[3] : r.dateRequested || r.date);
    const getStatus = (r) => (Array.isArray(r) ? r[4] : r.status);
    const getActivity = (r) => (Array.isArray(r) ? r[5] : r.lastActivity);

    const filteredRequests = requests.filter((r) => {
      const docName = getDocName(r) || "";
      const uploader = getUploader(r) || "";
      const role = getRole(r) || "";
      const status = getStatus(r) || "";

      const matchesSearch = `${docName} ${uploader} ${role}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab = activeTab === "All" || status === activeTab;
      return matchesSearch && matchesTab;
    });

    return (
    <>
        <PageHead
          title="Document Requests"
          subtitle="Track requests for Bachelor of Science in Information Technology."
          action={
            <button
              type="button"
              className="btn primary"
              onClick={handleOpenModal}
            >
              ＋ New request
            </button>
          }
        />

        <section className="card table-card">
          <div className="toolbar stacked">
            <div className="search">
              ⌕{" "}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search requests"
              />
            </div>
            <div className="tabs">
              {[
                "All",
                "Requested",
                "Submitted",
                "For Revision",
                "Resubmitted",
                "Approved",
              ].map((x) => (
                <button
                  key={x}
                  className={activeTab === x ? "active" : ""}
                  onClick={() => setActiveTab(x)}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Requirement / Document</th>
                <th>Requested from</th>
                <th>Role</th>
                <th>Date requested</th>
                <th>Status</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((r, index) => {
                        const doc = getDocName(r);
                        const upl = getUploader(r);
                        const rol = getRole(r);
                        const dt = getDate(r);
                        const st = getStatus(r);
                        const act = getActivity(r);

                        return (
                          <tr
                            key={`${doc}-${index}`}
                            className="clickable-row"
                            onClick={() => {
                              if (onSelectRequest) {
                                onSelectRequest(r);
                              }
                              setPage(st === "Submitted" ? "review" : "requestDetail");
                            }}
                          >
                            <td>
                              <b>{doc}</b>
                            </td>
                            <td>{upl}</td>
                            <td>{rol}</td>
                            <td>{dt}</td>
                            <td>
                              <Badge status={st} />
                            </td>
                            <td>{act}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          No document requests found.
                        </td>
                      </tr>
            )}
                  </tbody>
                </table>
      </section>

            {/* Internal modal fallback when not handled by parent App */}
            {internalModalOpen && (
              <NewRequestModal
                onClose={() => setInternalModalOpen(false)}
                facultyRecords={facultyRecords}
                onAddFaculty={(newFac) => {
                  if (onAddFaculty) {
                    onAddFaculty(newFac);
                  }
                }}
                onSubmit={(data) => {
                  if (onAddRequest) {
                    onAddRequest(data);
                  }
                  setInternalModalOpen(false);
                }}
              />
            )}
          </>
          );
}

export function RequestDetail({setPage, request}) {
  const docName =
          (Array.isArray(request) ? request[0] : request?.documentName || request?.name) ||
          "Laboratory Information";
          const uploader =
          (Array.isArray(request) ? request[1] : request?.uploader) || "Rizal Lim";
          const role =
          (Array.isArray(request) ? request[2] : request?.role || request?.position) ||
          "Office Representative";
          const dateRequested =
          (Array.isArray(request) ? request[3] : request?.dateRequested || request?.date) ||
          "Oct 25, 2026";
          const status =
          (Array.isArray(request) ? request[4] : request?.status) || "Requested";
          const lastActivity =
          (Array.isArray(request) ? request[5] : request?.lastActivity) ||
          "Oct 25 · 10:30 AM";
          const details =
          (Array.isArray(request) ? request[6] : request?.details) ||
          "Please submit the updated laboratory equipment inventory and maintenance log.";

          return (
          <>
            <button className="back" onClick={() => setPage("requests")}>
              ← Back to requests
            </button>
            <PageHead
              title="Request Details"
              subtitle={`${docName} · Request Details`}
            />
            <div className="details-grid">
              <section className="card detail-main">
                <div className="section-head">
                  <h2>Request Information</h2>
                  <Badge status={status} />
                </div>

                <div className="info-grid">
                  <div>
                    <span>Document / Requirement</span>
                    <b>{docName}</b>
                  </div>
                  <div>
                    <span>Program</span>
                    <b>Bachelor of Science in Information Technology</b>
                  </div>
                  <div>
                    <span>Requested From (Uploader)</span>
                    <b>{uploader}</b>
                  </div>
                  <div>
                    <span>Role / Position</span>
                    <b>{role}</b>
                  </div>
                  <div>
                    <span>Date Requested</span>
                    <b>{dateRequested}</b>
                  </div>
                  <div>
                    <span>Last Activity</span>
                    <b>{lastActivity}</b>
                  </div>
                </div>

                <div className="remarks">
                  <h3>Instructions &amp; Details</h3>
                  <p>{details}</p>
                </div>
              </section>
            </div>
          </>
          );
}

          export default Requests;
