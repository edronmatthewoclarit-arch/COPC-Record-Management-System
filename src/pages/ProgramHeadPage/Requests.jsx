import { useState, useRef, useEffect } from "react";
import { initialProgramHeadRequests } from "../../api/ProgramHeadViewAPI/request.api";
import { initialFacultyRecords } from "../../api/ProgramHeadViewAPI/faculty.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
import Modal from "../../components/ui/Modal";
import NewRequestModal from "./NewRequestModal";

export function Requests({
  setPage,
  requests = initialProgramHeadRequests,
  onSelectRequest,
  openNewRequest,
  facultyRecords = initialFacultyRecords,
  onAddFaculty,
  onAddRequest,
  onUpdateRequest,
  setToast,
}) {
  const [localRequests, setLocalRequests] = useState(requests);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [draftStatus, setDraftStatus] = useState("All");
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  // Requested Document Modal states
  const [selectedDocRequest, setSelectedDocRequest] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  const getDocName = (r) => (Array.isArray(r) ? r[0] : r.title || r.documentName || r.name);
  const getUploader = (r) => (Array.isArray(r) ? r[1] : r.requestedBy || r.uploader);
  const getDate = (r) => (Array.isArray(r) ? r[3] : r.dateRequested || r.date);
  const getStatus = (r) => (Array.isArray(r) ? r[4] : r.status);
  const getRequirement = (r) =>
    (Array.isArray(r) ? r.requirement : r?.requirement) || "Faculty Information";

  const filteredRequests = localRequests.filter((r) => {
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

  const handleRowClick = (r) => {
    setSelectedDocRequest(r);
    const existingInstructions =
      (Array.isArray(r) ? r[6] : r.instructions || r.details || r.remarks) || "";
    setInstructions(existingInstructions);
    setAttachment(null);
    setShowDocModal(true);
    if (onSelectRequest) {
      onSelectRequest(r);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = (e) => {
    e.stopPropagation();
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendRequestedDoc = () => {
    if (!selectedDocRequest) return;
    const docName = getDocName(selectedDocRequest) || "Document";
    const reqId = Array.isArray(selectedDocRequest)
      ? selectedDocRequest[0]
      : selectedDocRequest.id || selectedDocRequest.documentName || selectedDocRequest.name;

    setLocalRequests((prev) =>
      prev.map((item) => {
        const itemId = Array.isArray(item) ? item[0] : item.id || item.documentName || item.name;
        if (itemId === reqId) {
          if (Array.isArray(item)) {
            const next = [...item];
            next[4] = "Submitted";
            next[6] = instructions;
            return next;
          }
          return { ...item, status: "Submitted", instructions };
        }
        return item;
      })
    );

    if (onUpdateRequest) {
      onUpdateRequest({
        ...selectedDocRequest,
        status: "Submitted",
        instructions,
        attachment,
      });
    }

    if (setToast) {
      setToast(`Document for "${docName}" submitted successfully.`);
      setTimeout(() => setToast(""), 3500);
    }

    setShowDocModal(false);
  };

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
                      <span>{x}</span>
                    </label>
                  ))}
                </div>

                <div className="filter-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setStatusFilter("All");
                      setDraftStatus("All");
                      setFilterOpen(false);
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => {
                      setStatusFilter(draftStatus);
                      setFilterOpen(false);
                    }}
                  >
                    Apply Filter
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
                    onClick={() => handleRowClick(r)}
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

      {/* Requested Document Modal */}
      {showDocModal && selectedDocRequest && (
        <Modal
          title="Requested Document"
          className="requested-doc-modal"
          onClose={() => setShowDocModal(false)}
          showClose={false}
          footer={
            <div className="requested-doc-actions">
              <button
                type="button"
                className="requested-doc-btn-cancel"
                onClick={() => setShowDocModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="requested-doc-btn-send"
                onClick={handleSendRequestedDoc}
              >
                Send
              </button>
            </div>
          }
        >
          <div className="requested-doc-form">
            <div className="requested-doc-field">
              <label>Requirement</label>
              <div className="requested-doc-input-box">
                <UiIcon name="folder" />
                <span>{getRequirement(selectedDocRequest)}</span>
              </div>
            </div>

            <div className="requested-doc-field">
              <label>Document Name</label>
              <div className="requested-doc-input-box">
                <UiIcon name="file" />
                <span>{getDocName(selectedDocRequest) || "Teaching Loads"}</span>
              </div>
            </div>

            <div className="requested-doc-field">
              <label>Instructions/Remarks:</label>
              <textarea
                className="requested-doc-textarea"
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder=""
              />
            </div>

            <div className="requested-doc-field">
              <label>Attachments (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div
                className="requested-doc-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
              >
                {attachment ? (
                  <div className="modal-attached-file">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div className="modal-file-details">
                      <span className="modal-file-name">{attachment.name}</span>
                      <span className="modal-file-size">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="modal-remove-file"
                      onClick={removeAttachment}
                      aria-label="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="modal-dropzone-content">
                    <svg
                      className="modal-upload-icon"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1e1b4b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <polyline points="12 18 12 12"></polyline>
                      <polyline points="9 15 12 12 15 15"></polyline>
                    </svg>
                    <div className="modal-dropzone-text">
                      <p className="modal-dropzone-prompt">
                        <span className="modal-dropzone-link">Click to Upload</span> or drag and drop
                      </p>
                      <p className="modal-dropzone-hint">PDF, DOC, DOCX, JPG, PNG</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

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

export function RequestDetail({ setPage, request }) {
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
