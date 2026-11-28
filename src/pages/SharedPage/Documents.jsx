import { useState } from "react";
import { createPortal } from "react-dom";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
import Modal from "../../components/ui/Modal";

export function Documents({
  documents = initialDocuments,
  openDocument,
  userRole = "Program Head",
  userProgram = "Information Technology",
  onRequest,
}) {
  const isCoordinator = userRole === "COPC Coordinator";
  const isProgramHead = userRole === "Program Head";
  const isDean = userRole === "Dean";
  const isSubmitterRole =
    userRole === "Dean" ||
    userRole === "Faculty" ||
    userRole === "Office Representative";

  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [draftStatus, setDraftStatus] = useState("All");
  const [draftRole, setDraftRole] = useState("All");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestDocName, setRequestDocName] = useState("");
  const [requestUploader, setRequestUploader] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [requestError, setRequestError] = useState("");

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

  const pageTitle = isProgramHead || isDean ? "Program Documents" : "Documents";
  const pageSubtitle = isCoordinator
    ? "Centralized submissions from Deans, Faculty Members, and Office Representatives."
    : isProgramHead
      ? `Centralized documents submitted by Deans, Faculty, and Office Representatives for ${userProgram}.`
      : "";

  const activeFilterCount =
    (status !== "All" ? 1 : 0) + (roleFilter !== "All" ? 1 : 0);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!requestDocName.trim()) {
      setRequestError("Document name is required.");
      return;
    }
    if (!requestUploader.trim()) {
      setRequestError("Uploader is required.");
      return;
    }
    if (!requestDate.trim()) {
      setRequestError("Date is required.");
      return;
    }
    setRequestError("");
    if (onRequest) {
      onRequest({
        documentName: requestDocName.trim(),
        uploader: requestUploader.trim(),
        date: requestDate.trim(),
      });
    }
    setRequestDocName("");
    setRequestUploader("");
    setRequestDate("");
    setRequestModalOpen(false);
  };

  return (
    <>
      <PageHead title={pageTitle} subtitle={pageSubtitle} />

      {!isProgramHead && !isDean && userRole !== "Faculty" && userRole !== "Office Representative" && (
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
      )}

      <section className="card table-card documents-workspace">
        <div className="document-toolbar">
          <div className="search representative-search">
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documents"
              placeholder={isCoordinator ? "Search Documents" : isProgramHead ? "Search program documents..." : "Search documents..."}
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

          {isProgramHead && (
            <button
              type="button"
              className="btn primary"
              onClick={() => setRequestModalOpen(true)}
              style={{ marginLeft: "8px" }}
            >
              Request
            </button>
          )}
        </div>

        <table>
          <thead>
            <tr>
              {isCoordinator ? (
                <>
                  <th>Document</th>
                  <th>Record</th>
                  <th>Uploaded By</th>
                  <th>Date Uploaded</th>
                  <th>Status</th>
                </>
              ) : isProgramHead ? (
                <>
                  <th>Document Name</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Status</th>
                </>
              ) : isDean ? (
                <>
                  <th>Document Name</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Status</th>
                </>
              ) : (
                <>
                  <th>Document</th>
                  <th>Date</th>
                  <th>Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr
                key={`${d.id || d.name}-${d.index}`}
                className="clickable-row document-row"
                onClick={() => openDocument(d.index !== -1 ? d.index : 0, d)}
              >
                {isCoordinator ? (
                  <>
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
                      <b>{d.requirement || "—"}</b>
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
                      <Badge status={d.status} />
                    </td>
                  </>
                ) : isProgramHead ? (
                  <>
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
                      <b>{d.uploader}</b>
                      <small>{d.role || userRole}</small>
                    </td>
                    <td>
                      {d.date}
                      {d.time && <small>{d.time}</small>}
                    </td>
                    <td>
                      <Badge status={d.status} />
                    </td>
                  </>
                ) : isDean ? (
                  <>
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
                      <b>{d.uploader}</b>
                      <small>{d.role || userRole}</small>
                    </td>
                    <td>
                      {d.date}
                      {d.time && <small>{d.time}</small>}
                    </td>
                    <td>
                      <Badge status={d.status} />
                    </td>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </tr>
            ))}

            {docs.length === 0 && (
              <tr>
                <td colSpan={isCoordinator ? 5 : isProgramHead || isDean ? 4 : 3}>
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

      {requestModalOpen &&
        createPortal(
          <Modal
            title="New Document Request"
            subtitle="Enter the document details to create a new request."
            onClose={() => setRequestModalOpen(false)}
            action={handleRequestSubmit}
            actionLabel="Send"
          >
            <form onSubmit={handleRequestSubmit}>
              {requestError && (
                <div className="ph-modal-error" style={{ marginBottom: "12px" }}>
                  {requestError}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <label>
                  Document Name *
                  <input
                    type="text"
                    value={requestDocName}
                    onChange={(e) => {
                      setRequestDocName(e.target.value);
                      if (requestError) setRequestError("");
                    }}
                    placeholder="Enter document name"
                    autoFocus
                  />
                </label>
                <label>
                  Uploader *
                  <input
                    type="text"
                    value={requestUploader}
                    onChange={(e) => {
                      setRequestUploader(e.target.value);
                      if (requestError) setRequestError("");
                    }}
                    placeholder="Enter uploader name"
                  />
                </label>
                <label>
                  Date *
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => {
                      setRequestDate(e.target.value);
                      if (requestError) setRequestError("");
                    }}
                  />
                </label>
              </div>
            </form>
          </Modal>,
          document.body
        )}
    </>
  );
}

export default Documents;
