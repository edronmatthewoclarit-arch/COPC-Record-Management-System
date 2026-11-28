import { useState } from "react";
import { initialProgramHeadRequests } from "../../api/ProgramHeadViewAPI/request.api";
import { initialFacultyRecords } from "../../api/ProgramHeadViewAPI/faculty.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
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
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [draftStatus, setDraftStatus] = useState("All");
    const [internalModalOpen, setInternalModalOpen] = useState(false);

    const getDocName = (r) => (Array.isArray(r) ? r[0] : r.title || r.documentName || r.name);
    const getUploader = (r) => (Array.isArray(r) ? r[1] : r.requestedBy || r.uploader);
    const getDate = (r) => (Array.isArray(r) ? r[3] : r.dateRequested || r.date);
    const getStatus = (r) => (Array.isArray(r) ? r[4] : r.status);

    const filteredRequests = requests.filter((r) => {
      const docName = getDocName(r) || "";
      const uploader = getUploader(r) || "";
      const status = getStatus(r) || "";

      const matchesSearch = `${docName} ${uploader}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesFilter = statusFilter === "All" || status === statusFilter;
      return matchesSearch && matchesFilter;
    });

    const activeFilterCount = statusFilter !== "All" ? 1 : 0;

    return (
    <>
        <PageHead
          title="Document Request"
          subtitle="Document requests assigned to your academic program by the COPC Coordinator."
        />

        <section className="card table-card">
          <div className="document-toolbar">
            <div className="search representative-search">
              <UiIcon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search request"
                aria-label="Search requests"
              />
            </div>

            <div className="filter-wrap">
              <button
                type="button"
                className={`btn filter-button ${activeFilterCount > 0 ? "has-filters" : ""}`}
                onClick={() => {
                  setDraftStatus(statusFilter);
                  setFilterOpen(!filterOpen);
                }}
              >
                <UiIcon name="filter" />
                Filter
                {activeFilterCount > 0 && <em>{activeFilterCount}</em>}
              </button>

              {filterOpen && (
                <div className="filter-popover document-filter">
                  <div className="filter-popover-head">
                    <b>Filter Requests</b>
                    <button type="button" onClick={() => setFilterOpen(false)}>
                      ×
                    </button>
                  </div>

                  <div className="filter-section">
                    <span>REQUEST STATUS</span>
                    {[
                      "All",
                      "Pending",
                      "Submitted",
                      "For Revision",
                      "Approved",
                    ].map((x) => (
                      <label key={x}>
                        <input
                          type="radio"
                          name="req-status"
                          checked={draftStatus === x}
                          onChange={() => setDraftStatus(x)}
                        />
                        {x}
                      </label>
                    ))}
                  </div>

                  <div className="filter-actions">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setDraftStatus("All")}
                    >
                      Clear Filters
                    </button>
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => {
                        setStatusFilter(draftStatus);
                        setFilterOpen(false);
                      }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Uploader</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((r, index) => {
                        const doc = getDocName(r);
                        const upl = getUploader(r);
                        const dt = getDate(r);
                        const st = getStatus(r);

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
                            <td>{doc}</td>
                            <td>{upl}</td>
                            <td>{dt}</td>
                            <td>
                              <Badge status={st} />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="empty-state">
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
