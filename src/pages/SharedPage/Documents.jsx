import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
import Modal from "../../components/ui/Modal";

export function Documents({
  documents = [],
  openDocument,
  userRole = "Program Head",
  userProgram = "Information Technology",
  onRequest,
  onUpdateDocument,
  openNewRequest,
}) {
  const isCoordinator = userRole === "COPC Coordinator";
  const isProgramHead = userRole === "Program Head";
  const isDean = userRole === "Dean";
  const isFaculty = userRole === "Faculty";
  const isOfficeRep = userRole === "Office Representative";
  const isContributorRole = isFaculty || isOfficeRep;
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
  const [sortOrder, setSortOrder] = useState("Latest Upload");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestDocName, setRequestDocName] = useState("");
  const [requestUploader, setRequestUploader] = useState("Maria Santos - Faculty");
  const [requestDate, setRequestDate] = useState("November 13, 2026");
  const [requestError, setRequestError] = useState("");
  const datePickerRef = useRef(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [activeFacultyDoc, setActiveFacultyDoc] = useState(null);
  const [facultyRemarks, setFacultyRemarks] = useState("");
  const [facultyFile, setFacultyFile] = useState(null);
  const facultyFileInputRef = useRef(null);

  const getIsoDate = (dateStr) => {
    if (!dateStr) return "";
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const handleNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const formatted = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setRequestDate(formatted);
    }
  };

  const openCalendarPicker = () => {
    if (datePickerRef.current) {
      if (typeof datePickerRef.current.showPicker === "function") {
        datePickerRef.current.showPicker();
      } else {
        datePickerRef.current.focus();
        datePickerRef.current.click();
      }
    }
  };

  // Scope documents by academic program and user role
  const scopedDocuments = documents.filter((d) => {
    const matchesProgram =
      !d.program ||
      !userProgram ||
      d.program.toLowerCase() === userProgram.toLowerCase();
    if (!matchesProgram) return false;

    if (isCoordinator || isProgramHead || isDean) {
      return true;
    }

    if (isFaculty) {
      return !d.role || d.role === "Faculty" || (d.uploader && d.uploader.includes("Faculty"));
    }
    if (isOfficeRep) {
      return !d.role || d.role === "Office Representative" || (d.uploader && d.uploader.includes("Office Representative"));
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
  const pendingCount = scopedDocuments.filter((d) => {
    const s = (d.status || "").toLowerCase();
    return (
      s.includes("pending") ||
      s.includes("not") ||
      s.includes("requested")
    );
  }).length;
  const revisionCount = scopedDocuments.filter((d) =>
    (d.status || "").toLowerCase().includes("revision")
  ).length;

  const summaryMetrics = [
    { count: allCount, label: "All Documents", color: "#4f46e5" },
    { count: reviewCount, label: "For Review", color: "#a16207" },
    { count: approvedCount, label: "Approved", color: "#15803d" },
    { count: pendingCount, label: "Pending", color: "#a16207" },
    { count: revisionCount, label: "For Revision", color: "#b91c1c" },
  ];

  const filteredDocs = scopedDocuments
    .map((d) => ({
      ...d,
      index: documents.findIndex((orig) => orig === d || (orig.id && orig.id === d.id)),
    }))
    .filter((d) => {
      const facultyStatus =
        (d.status || "").toLowerCase() === "submitted" ||
        (d.status || "").toLowerCase() === "approved" ||
        d.submitted
          ? "Submitted"
          : "Not Submitted";

      const matchesQuery = `${d.name} ${d.requirement || ""} ${d.record || ""} ${d.uploader || ""} ${d.role || ""} ${d.program || ""}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus =
        status === "All" ||
        (isContributorRole ? facultyStatus === status : d.status === status);

      const matchesRole =
        roleFilter === "All" || (d.role || "") === roleFilter;

      return matchesQuery && matchesStatus && matchesRole;
    });

  const docs = sortOrder === "Oldest Upload" ? [...filteredDocs].reverse() : filteredDocs;

  const activeFilterCount =
    (status !== "All" ? 1 : 0) + (roleFilter !== "All" ? 1 : 0);

  const handleFacultySubmit = () => {
    if (!activeFacultyDoc) return;
    const updatedDoc = {
      ...activeFacultyDoc,
      status: "Submitted",
      submitted: true,
      remarks: facultyRemarks,
      attachment: facultyFile ? facultyFile.name : activeFacultyDoc.attachment,
      date: activeFacultyDoc.date || new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    if (onUpdateDocument) {
      onUpdateDocument(updatedDoc);
    }
    setFacultyModalOpen(false);
    setFacultyRemarks("");
    setFacultyFile(null);
    setActiveFacultyDoc(null);
  };

  const handleRequestSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const finalDocName =
      requestDocName.trim().replace(/\.pdf$/i, "") || "Requested Document";
    const finalUploader = requestUploader || "Maria Santos - Faculty";
    const finalDate = requestDate || "November 13, 2026";

    if (onRequest) {
      onRequest({
        documentName: finalDocName,
        uploader: finalUploader.split(" - ")[0],
        date: finalDate,
      });
    }
    setRequestDocName("");
    setRequestUploader("Maria Santos - Faculty");
    setRequestDate("November 13, 2026");
    setRequestModalOpen(false);
  };

  return (
    <>
      <PageHead
        title={isProgramHead || isDean ? "Program Documents" : "Documents"}
      />

      {!isProgramHead && !isDean && !isContributorRole && (
        <section className="card document-summary-card">
          {summaryMetrics.map((m) => (
            <div key={m.label} className="doc-metric-item">
              <span
                className="doc-metric-swatch"
                style={{ backgroundColor: m.color }}
              />
              <div className="doc-metric-data">
                <strong className="doc-metric-count">{m.count}</strong>
                <span className="doc-metric-label">{m.label}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      <section
        className={`card table-card documents-workspace ${isProgramHead || isDean ? "ph-documents-workspace" : isContributorRole ? "faculty-documents-workspace" : ""}`}
      >
        <div className="document-toolbar">
          <div className="doc-search-wrapper">
            <UiIcon name="search" />
            <input
              className="doc-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documents"
              placeholder={
                isProgramHead || isDean
                  ? "Search Documents..."
                  : "Search document name, requirement, or uploader..."
              }
            />
          </div>

          <div className="doc-toolbar-actions">
            <div className="filter-wrap">
              <button
                type="button"
                className={`doc-outlined-btn ${activeFilterCount > 0 ? "has-filters" : ""}`}
                onClick={() => {
                  setDraftStatus(status);
                  setDraftRole(roleFilter);
                  setFilterOpen(!filterOpen);
                }}
              >
                Filter
                {activeFilterCount > 0 && (
                  <em className="doc-filter-badge">{activeFilterCount}</em>
                )}
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
                    {(isContributorRole
                      ? ["All", "Submitted", "Not Submitted"]
                      : [
                          "All",
                          "Requested",
                          "For Review",
                          "Approved",
                          "For Revision",
                          "Revision",
                        ]
                    ).map((x) => (
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

                  {(isCoordinator || isProgramHead || isDean) && (
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

            {isProgramHead ? (
              <button
                type="button"
                className="ph-doc-request-btn"
                onClick={() => setRequestModalOpen(true)}
              >
                Request
              </button>
            ) : isDean || isContributorRole ? null : (
              <button
                type="button"
                className="doc-outlined-btn"
                onClick={() =>
                  setSortOrder((prev) =>
                    prev === "Latest Upload" ? "Oldest Upload" : "Latest Upload"
                  )
                }
              >
                {sortOrder}
              </button>
            )}
          </div>
        </div>

        <table>
          <thead>
            {isContributorRole ? (
              <tr>
                <th>Document Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            ) : isProgramHead || isDean ? (
              <tr>
                <th>Document Name</th>
                <th>Uploaded by</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            ) : (
              <tr>
                <th>Document</th>
                <th>Record</th>
                <th>Uploaded by</th>
                <th>Date Uploaded</th>
                <th>Status</th>
              </tr>
            )}
          </thead>
          <tbody>
            {docs.map((d) => {
              const isRequested = (d.status || "").toLowerCase().includes("request");
              const displayName = d.name ? d.name.replace(/\.pdf$/i, "") : "Document";
              const facultyStatus =
                (d.status || "").toLowerCase() === "submitted" ||
                (d.status || "").toLowerCase() === "approved" ||
                d.submitted
                  ? "Submitted"
                  : "Not Submitted";
              const isClickable = isContributorRole || !isRequested;

              return (
                <tr
                  key={`${d.id || d.name}-${d.index}`}
                  className={`document-row ${isClickable ? "clickable-row" : "not-clickable"}`}
                  onClick={() => {
                    if (isContributorRole) {
                      if (facultyStatus === "Not Submitted" || isRequested) {
                        setActiveFacultyDoc(d);
                        setFacultyRemarks(d.remarks || "");
                        setFacultyFile(null);
                        setFacultyModalOpen(true);
                      } else {
                        openDocument(d.index !== -1 ? d.index : 0, d);
                      }
                    } else if (isClickable) {
                      openDocument(d.index !== -1 ? d.index : 0, d);
                    }
                  }}
                >
                  <td>
                    {isProgramHead || isDean || isContributorRole ? (
                      <b>{displayName}</b>
                    ) : (
                      <div className="document-file">
                        {!isRequested && <i>PDF</i>}
                        <span>
                          <b>{displayName}</b>
                          {isRequested ? (
                            d.program ? <small>{d.program}</small> : null
                          ) : (
                            <small>
                              PDF • {d.size || "1.8 MB"}
                              {d.program ? ` • ${d.program}` : ""}
                            </small>
                          )}
                        </span>
                      </div>
                    )}
                  </td>
                  {!isProgramHead && !isDean && !isContributorRole && (
                    <td>
                      <b>{d.record || d.requirement || "—"}</b>
                      {d.requirement && d.record && d.requirement !== d.record && (
                        <small>{d.requirement}</small>
                      )}
                    </td>
                  )}
                  {!isContributorRole && (
                    <td>
                      <b>{d.uploader || "Ana Reyes"}</b>
                      <small>{d.role || userRole}</small>
                    </td>
                  )}
                  <td>
                    {d.date || "November 13, 2026"}
                    {d.time && <small>{d.time}</small>}
                  </td>
                  <td>
                    <Badge status={isContributorRole ? facultyStatus : (d.status || "For Review")} />
                  </td>
                </tr>
              );
            })}

            {docs.length === 0 && (
              <tr>
                <td colSpan={isContributorRole ? 3 : isProgramHead || isDean ? 4 : 5}>
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
            title="Request"
            className="required-record-modal"
            showClose={false}
            onClose={() => setRequestModalOpen(false)}
            action={handleRequestSubmit}
            actionLabel="Send"
          >
            <div className="required-record-form">
              <div className="record-form-group">
                <label>Document Name</label>
                <input
                  className="record-form-input"
                  value={requestDocName}
                  onChange={(e) => setRequestDocName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="record-form-group">
                <label>Uploader</label>
                <div className="record-select-wrapper">
                  <select
                    className="record-form-select"
                    value={requestUploader}
                    onChange={(e) => setRequestUploader(e.target.value)}
                  >
                    <option value="Maria Santos - Faculty">Maria Santos - Faculty</option>
                    <option value="Ana Reyes - Faculty">Ana Reyes - Faculty</option>
                    <option value="Juan Dela Cruz - Faculty">Juan Dela Cruz - Faculty</option>
                    <option value="Rizal Lim - Office Representative">Rizal Lim - Office Representative</option>
                  </select>
                  <span className="record-select-arrow" aria-hidden="true">
                    <UiIcon name="chevron-down" />
                  </span>
                </div>
              </div>

              <div className="record-form-group">
                <label>Date</label>
                <div className="record-date-wrapper">
                  <input
                    type="text"
                    className="record-date-input"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                    placeholder="November 13, 2026"
                  />
                  <input
                    type="date"
                    ref={datePickerRef}
                    className="record-native-date-picker"
                    value={getIsoDate(requestDate)}
                    onChange={handleNativeDateChange}
                    tabIndex={-1}
                    aria-label="Pick submission date"
                  />
                  <button
                    type="button"
                    className="record-date-btn"
                    onClick={openCalendarPicker}
                    title="Choose submission date"
                    aria-label="Choose submission date"
                  >
                    <UiIcon name="calendar" />
                  </button>
                </div>
              </div>
            </div>
          </Modal>,
          document.body
        )}
      {facultyModalOpen && activeFacultyDoc &&
        createPortal(
          <Modal
            title="Requested Document"
            className="required-record-modal"
            showClose={false}
            onClose={() => setFacultyModalOpen(false)}
            action={handleFacultySubmit}
            actionLabel="Send"
          >
            <div className="required-record-form">
              <div className="record-form-group">
                <label>Document Name</label>
                <div className="faculty-doc-preview-input">
                  <span className="faculty-doc-preview-icon" aria-hidden="true">
                    <UiIcon name="file" />
                  </span>
                  <span className="faculty-doc-preview-name">
                    {activeFacultyDoc.name.replace(/\.pdf$/i, "")}
                  </span>
                </div>
              </div>

              <div className="record-form-group">
                <label>Instructions/Remarks:</label>
                <input
                  type="text"
                  className="record-form-input"
                  value={facultyRemarks}
                  onChange={(e) => setFacultyRemarks(e.target.value)}
                  placeholder=""
                />
              </div>

              <div className="record-form-group">
                <label>Attachments (Optional)</label>
                <input
                  type="file"
                  ref={facultyFileInputRef}
                  style={{ display: "none" }}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFacultyFile(e.target.files[0]);
                    }
                  }}
                />
                <div
                  className="faculty-upload-box"
                  onClick={() => facultyFileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      facultyFileInputRef.current?.click();
                    }
                  }}
                >
                  <span className="faculty-upload-icon" aria-hidden="true">
                    <UiIcon name="upload" />
                  </span>
                  <div className="faculty-upload-text">
                    {facultyFile ? (
                      <span className="faculty-file-selected">
                        {facultyFile.name} ({(facultyFile.size / 1024).toFixed(0)} KB)
                      </span>
                    ) : (
                      <>
                        <span className="faculty-upload-prompt">
                          <strong>Click to Upload</strong> or drag and drop
                        </span>
                        <span className="faculty-upload-types">
                          PDF, DOC, DOCX, JPG, PNG
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
}

export default Documents;
