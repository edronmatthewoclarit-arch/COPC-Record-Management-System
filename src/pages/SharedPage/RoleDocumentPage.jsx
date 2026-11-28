import { useState } from "react";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function RoleDocumentPage({
  roleTitle = "Sent Documents",
  roleSubtitle = "Track and manage sent compliance documents.",
  targetRole = "Faculty",
  documents = [],
  openDocument,
  openSendFile,
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Approved" | "Revision"
  const [sort, setSort] = useState("Latest");

  // Filter documents sent by this role or relevant to this portal
  const roleDocs = documents.filter((d) => {
    if (!targetRole) return true;
    if (targetRole === "Dean") {
      return (
        d.role === "Dean" ||
        d.uploader?.includes("Castillo") ||
        d.requirement?.includes("Curriculum")
      );
    }
    if (targetRole === "Faculty") {
      return (
        d.role === "Faculty" ||
        d.uploader?.includes("Reyes") ||
        d.uploader?.includes("Cruz") ||
        d.requirement?.includes("Syllabi") ||
        d.requirement?.includes("Faculty")
      );
    }
    if (targetRole === "Office Representative") {
      return (
        d.role === "Office Representative" ||
        d.uploader?.includes("Lim") ||
        d.requirement?.includes("Facilities") ||
        d.requirement?.includes("Laboratory")
      );
    }
    return true;
  });

  // Map and normalize status strictly to "Approved" or "Revision" as requested
  const normalizedDocs = roleDocs.map((d) => {
    const rawStatus = (d.status || "").toLowerCase();
    const cleanStatus =
      rawStatus === "approved" ? "Approved" : "Revision"; // Strictly only Approved and Revision

    return {
      ...d,
      displayStatus: cleanStatus,
    };
  });

  // Filter by query and status tab ("All", "Approved", "Revision")
  const filtered = normalizedDocs
    .filter((d) => {
      const matchSearch =
        `${d.name} ${d.record || ""} ${d.uploader} ${d.date}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchStatus =
        statusFilter === "All" || d.displayStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sort === "Name A–Z") return a.name.localeCompare(b.name);
      if (sort === "Name Z–A") return b.name.localeCompare(a.name);
      return 0; // Default latest
    });

  const approvedCount = normalizedDocs.filter(
    (d) => d.displayStatus === "Approved"
  ).length;
  const revisionCount = normalizedDocs.filter(
    (d) => d.displayStatus === "Revision"
  ).length;

  return (
    <div className="role-document-page">
      <PageHead
        title={roleTitle}
        subtitle={roleSubtitle}
        action={
          <button
            type="button"
            className="btn primary send-files-action-btn"
            onClick={openSendFile}
          >
            <UiIcon name="upload" />
            <span>Send files</span>
          </button>
        }
      />

      {/* Role Summary Metrics */}
      <section className="card document-summary role-doc-summary">
        <div>
          <i className="navy">
            <UiIcon name="file" />
          </i>
          <span>
            <strong>{normalizedDocs.length}</strong>
            <small>Sent Documents</small>
          </span>
        </div>
        <div>
          <i className="green">
            <UiIcon name="check" />
          </i>
          <span>
            <strong>{approvedCount}</strong>
            <small>Approved</small>
          </span>
        </div>
        <div>
          <i className="red">
            <UiIcon name="revision" />
          </i>
          <span>
            <strong>{revisionCount}</strong>
            <small>Revision</small>
          </span>
        </div>
      </section>

      {/* Toolbar & Filter Tabs */}
      <section className="card table-card">
        <div className="toolbar stacked">
          <div className="search">
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search sent documents"
              placeholder="Search sent documents..."
            />
          </div>

          <div className="tabs">
            {["All", "Approved", "Revision"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={statusFilter === tab ? "active" : ""}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
                <span className="tab-pill">
                  {tab === "All"
                    ? normalizedDocs.length
                    : tab === "Approved"
                      ? approvedCount
                      : revisionCount}
                </span>
              </button>
            ))}
          </div>

          <div className="sort-wrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort documents"
            >
              <option value="Latest">Latest Uploaded</option>
              <option value="Name A–Z">Document Name A–Z</option>
              <option value="Name Z–A">Document Name Z–A</option>
            </select>
          </div>
        </div>

        {/* Documents Table: Name, Uploader, Date, Status */}
        <table className="role-sent-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Uploader</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((d, index) => {
                const originalIndex = documents.findIndex(
                  (doc) => doc.id === d.id || doc.name === d.name
                );

                return (
                  <tr
                    key={d.id || `${d.name}-${index}`}
                    className="clickable-row"
                    onClick={() =>
                      openDocument(originalIndex !== -1 ? originalIndex : 0, d)
                    }
                  >
                    <td>
                      <div className="document-file">
                        {d.status !== "Requested" && <i>PDF</i>}
                        <div>
                          <b>{d.status === "Requested" ? d.name.replace(/\.pdf$/i, "") : d.name}</b>
                          {d.record && (
                            <span className="role-doc-record">
                              {d.record}{d.status !== "Requested" ? ` • ${d.size || "1.8 MB"}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="role-uploader-cell">
                        <b>{d.uploader}</b>
                        <small>{d.role || targetRole}</small>
                      </div>
                    </td>
                    <td>
                      <div className="role-date-cell">
                        <span>{d.date}</span>
                        {d.time && <small>{d.time}</small>}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${d.displayStatus === "Approved" ? "approved" : "revision"}`}
                      >
                        {d.displayStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary small view-doc-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDocument(
                            originalIndex !== -1 ? originalIndex : 0,
                            d
                          );
                        }}
                      >
                        <UiIcon name="view" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="requirements-empty">
                    <UiIcon name="file" />
                    <b>No sent documents found.</b>
                    <p>
                      Click <b>“Send files”</b> to submit a document to the COPC
                      Coordinator.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default RoleDocumentPage;
