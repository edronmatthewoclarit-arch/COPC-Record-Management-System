import { useState } from "react";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function Documents({
  documents = initialDocuments,
  openDocument,
  userRole = "Program Head",
  userProgram = "Information Technology",
}) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [draftStatus, setDraftStatus] = useState("All");
  const [draftRole, setDraftRole] = useState("All");
  const [sort, setSort] = useState("Latest Uploaded");

  const isCoordinator = userRole === "COPC Coordinator";
  const isProgramHead = userRole === "Program Head";
  const isSubmitterRole =
    userRole === "Dean" ||
    userRole === "Faculty" ||
    userRole === "Office Representative";

  // Scope documents by academic program and user role
  const scopedDocuments = documents.filter((d) => {
    const matchesProgram =
      !d.program ||
      !userProgram ||
      d.program.toLowerCase() === userProgram.toLowerCase();
    if (!matchesProgram) return false;

    if (isCoordinator || isProgramHead) {
      return true;
    }

    if (userRole === "Dean") {
      return !d.role || d.role === "Dean";
    }
    if (userRole === "Faculty") {
      return !d.role || d.role === "Faculty";
    }
    if (userRole === "Office Representative") {
      return !d.role || d.role === "Office Representative";
    }
    return true;
  });

  const allCount = scopedDocuments.length;
  const reviewCount = scopedDocuments.filter((d) =>
    (d.status || "").toLowerCase().includes("review")
  ).length;
  const approvedCount = scopedDocuments.filter(
    (d) => (d.status || "").toLowerCase() === "approved"
  ).length;
  const revisionCount = scopedDocuments.filter((d) =>
    (d.status || "").toLowerCase().includes("revision")
  ).length;

  const docs = scopedDocuments
    .map((d) => ({
      ...d,
      index: documents.findIndex((orig) => orig === d || (orig.id && orig.id === d.id)),
    }))
    .filter(
      (d) =>
        `${d.name} ${d.requirement || ""} ${d.record || ""} ${d.uploader || ""} ${d.role || ""} ${d.program || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "All" || d.status === status) &&
        (roleFilter === "All" || (d.role || "") === roleFilter)
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

  const pageTitle = isProgramHead || isSubmitterRole ? "Program Documents" : "Documents";
  const pageSubtitle = isCoordinator
    ? "Centralized submissions from Deans, Faculty Members, and Office Representatives."
    : isProgramHead
      ? `Centralized documents submitted by Deans, Faculty, and Office Representatives for ${userProgram}.`
      : "View and track your COPC document submissions.";

  const activeFilterCount =
    (status !== "All" ? 1 : 0) + (roleFilter !== "All" ? 1 : 0);

  return (
    <>
      <PageHead title={pageTitle} subtitle={pageSubtitle} />

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
              className={`btn filter-button ${activeFilterCount > 0 ? "has-filters" : ""}`}
              onClick={() => {
                setDraftStatus(status);
                setDraftRole(roleFilter);
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
                    "Revision",
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

                {(isCoordinator || isProgramHead) && (
                  <div className="filter-section">
                    <span>SUBMITTER ROLE</span>
                    {[
                      "All",
                      "Dean",
                      "Faculty",
                      "Office Representative",
                      "Program Head",
                    ].map((r) => (
                      <label key={r}>
                        <input
                          type="radio"
                          name="doc-role"
                          checked={draftRole === r}
                          onChange={() => setDraftRole(r)}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                )}

                <div className="filter-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setDraftStatus("All");
                      setDraftRole("All");
                    }}
                  >
                    Clear Filters
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => {
                      setStatus(draftStatus);
                      setRoleFilter(draftRole);
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
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr
                key={`${d.id || d.name}-${d.index}`}
                className="clickable-row document-row"
                onClick={() => openDocument(d.index !== -1 ? d.index : 0, d)}
              >
                <td>
                  <div className="document-file">
                    <i>PDF</i>
                    <span>
                      <b>{d.name}</b>
                      <small>
                        PDF • {d.size || "1.8 MB"}
                        {d.program ? ` • ${d.program}` : ""}
                      </small>
                    </span>
                  </div>
                </td>
                <td>
                  {d.date}
                  {d.time && <small>{d.time}</small>}
                </td>
                <td>
                  <Badge status={d.status} />
                </td>
              </tr>
            ))}

            {docs.length === 0 && (
              <tr>
                <td colSpan={3}>
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
