import { useState } from "react";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function Documents({
  documents = initialDocuments,
  openDocument,
  userRole = "Program Head",
}) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState("All");
  const [draftStatus, setDraftStatus] = useState("All");
  const [sort, setSort] = useState("Latest Uploaded");

  const allCount = documents.length;
  const reviewCount = documents.filter((d) =>
    (d.status || "").toLowerCase().includes("review")
  ).length;
  const approvedCount = documents.filter(
    (d) => (d.status || "").toLowerCase() === "approved"
  ).length;
  const revisionCount = documents.filter((d) =>
    (d.status || "").toLowerCase().includes("revision")
  ).length;

  const docs = documents
    .map((d, i) => ({ ...d, index: i }))
    .filter(
      (d) =>
        `${d.name} ${d.requirement || ""} ${d.record || ""} ${d.uploader}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All" || d.status === status)
    );

  if (sort === "Document Name A–Z") {
    docs.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "Document Name Z–A") {
    docs.sort((a, b) => b.name.localeCompare(a.name));
  }
  if (sort === "Oldest Uploaded") {
    docs.reverse();
  }

  return (
    <>
      <PageHead
        title="Documents"
        subtitle="Manage, review, and track submitted COPC documents."
        action={
          <button
            type="button"
            className="btn secondary icon-button"
            onClick={() => alert("Exporting all submitted documents...")}
          >
            <UiIcon name="download" />
            Export Document List
          </button>
        }
      />

      <section className="card document-summary">
        {[
          [String(allCount), "All Documents", "file", "navy"],
          [String(reviewCount), "For Review", "clock", "amber"],
          [String(approvedCount), "Approved", "check", "green"],
          [String(revisionCount), "For Revision", "revision", "red"],
        ].map((x) => (
          <div key={x[1]}>
            <i className={x[3]}>
              <UiIcon name={x[2]} />
            </i>
            <span>
              <strong>{x[0]}</strong>
              <small>{x[1]}</small>
            </span>
          </div>
        ))}
      </section>

      <section className="card table-card documents-workspace">
        <div className="document-toolbar">
          <div className="search">
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documents"
            />
          </div>

          <div className="filter-wrap">
            <button
              type="button"
              className={`btn filter-button ${status !== "All" ? "has-filters" : ""}`}
              onClick={() => {
                setDraftStatus(status);
                setFilterOpen(!filterOpen);
              }}
            >
              <UiIcon name="filter" />
              Filter
              {status !== "All" && <em>1</em>}
            </button>

            {filterOpen && (
              <div className="filter-popover document-filter">
                <div className="filter-popover-head">
                  <b>Filter Documents</b>
                  <button type="button" onClick={() => setFilterOpen(false)}>
                    ×
                  </button>
                </div>

                <div className="filter-section">
                  <span>DOCUMENT STATUS</span>
                  {[
                    "All",
                    "Requested",
                    "For Review",
                    "Approved",
                    "For Revision",
                  ].map((x) => (
                    <label key={x}>
                      <input
                        type="radio"
                        name="doc-status"
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
                      setStatus(draftStatus);
                      setFilterOpen(false);
                    }}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort documents"
          >
            <option>Latest Uploaded</option>
            <option>Oldest Uploaded</option>
            <option>Recently Updated</option>
            <option>Document Name A–Z</option>
            <option>Document Name Z–A</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Related Record</th>
              <th>Uploaded By</th>
              <th>Date Uploaded</th>
              <th>Version</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr
                key={`${d.name}-${d.index}`}
                className="clickable-row document-row"
                onClick={() => openDocument(d.index, d)}
              >
                <td>
                  <div className="document-file">
                    <i>PDF</i>
                    <span>
                      <b>{d.name}</b>
                      <small>PDF • {d.size || "1.8 MB"}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <b>{d.requirement}</b>
                  <small>{d.record || d.name}</small>
                </td>
                <td>
                  <b>{d.uploader}</b>
                  <small>{d.role || userRole}</small>
                </td>
                <td>
                  {d.date}
                  {d.time && <small>{d.time}</small>}
                </td>
                <td>
                  <b>{d.version || "v1"}</b>
                </td>
                <td>
                  <Badge status={d.status} />
                </td>
              </tr>
            ))}

            {docs.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="requirements-empty">
                    <UiIcon name="file" />
                    <b>No documents found.</b>
                    <p>Try changing your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default Documents;
