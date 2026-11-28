import { useState, useRef } from "react";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Modal from "../../components/ui/Modal";

export function DocumentDetails({
  index = 0,
  document: passedDoc,
  documents = initialDocuments,
  setPage,
  source = "documents",
  record,
  parentRequirement,
  userRole = "Program Head",
  onUpdateDocumentStatus,
  openApprove,
  openRevision,
}) {
  const base =
    passedDoc ||
    documents[index] ||
    initialDocuments[index] ||
    initialDocuments[0];

  const formatFileName = (name) => {
    if (!name) return "Faculty_Profile_BSIT_2026.pdf";
    if (name.toLowerCase().endsWith(".pdf")) return name;
    return `${name.replace(/\s+/g, "_")}_BSIT_2026.pdf`;
  };

  const initialDoc = record
    ? {
        name: record.file || formatFileName(record.name),
        size: record.size || "1.6 mb",
        requirement: parentRequirement || "Faculty Information",
        record: record.name || "Faculty Profile",
        uploader: record.assigned || record.uploader || "Maria Santos",
        role: record.role || "Faculty",
        date: record.updated ? record.updated.split(" • ")[0] : "October 20, 2026",
        time: record.updated ? record.updated.split(" • ")[1] || "9:50am" : "9:50am",
        version: record.version || "v2",
        status: record.status || "For Review",
        remark: record.remark || "",
      }
    : {
        name: base?.name ? formatFileName(base.name) : "Faculty_Information_BSIT_2026.pdf",
        size: base?.size || "1.6 mb",
        requirement: base?.requirement || parentRequirement || "Faculty Information",
        record: base?.record || base?.name?.replace(/\.pdf$/i, "").replace(/_/g, " ") || "Faculty Profile",
        uploader: base?.uploader || "Maria Santos",
        role: base?.role || "Faculty",
        date: base?.date || "October 20, 2026",
        time: base?.time || "9:50am",
        version: base?.version || "v2",
        status: base?.status || "For Review",
        remark: base?.remark || "",
      };

  const [currentStatus, setCurrentStatus] = useState(initialDoc.status);
  const [remarks, setRemarks] = useState(initialDoc.remark || "");
  const [attachment, setAttachment] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);

  const isApproved = currentStatus === "Approved";

  const handleBack = () => {
    if (source === "requirements" || parentRequirement) {
      setPage("requirementDetail");
    } else if (source === "requests") {
      setPage("requests");
    } else if (source === "dean") {
      setPage("dean");
    } else if (source === "faculty") {
      setPage("faculty");
    } else if (source === "officeRepresentative") {
      setPage("officeRepresentative");
    } else {
      setPage("documents");
    }
  };

  const getBackLabel = () => {
    if (parentRequirement) {
      return `Back to ${parentRequirement}`;
    }
    if (source === "requirements") {
      return "Back to Faculty Information";
    }
    if (source === "requests") {
      return "Back to Requests";
    }
    if (
      source === "programDocuments" ||
      userRole === "Program Head" ||
      userRole === "Dean"
    ) {
      return "Back to Program Documents";
    }
    return "Back to Documents";
  };

  const handleConfirmApprove = () => {
    setCurrentStatus("Approved");
    setShowApproveConfirm(false);
    setToastMessage("Document approved successfully.");

    if (onUpdateDocumentStatus) {
      onUpdateDocumentStatus({
        name: initialDoc.name,
        status: "Approved",
      });
    }
    if (openApprove) {
      openApprove({ ...initialDoc, status: "Approved" });
    }

    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleConfirmRevision = () => {
    const finalRemark = remarks.trim() || "Please revise and resubmit.";
    setCurrentStatus("For Revision");
    setShowRevisionModal(false);
    setToastMessage(
      attachment
        ? `Revision request submitted with remarks and attached file (${attachment.name}).`
        : "Revision request submitted with remarks."
    );

    if (onUpdateDocumentStatus) {
      onUpdateDocumentStatus({
        name: initialDoc.name,
        status: "For Revision",
        remark: finalRemark,
        attachment: attachment ? attachment.name : null,
      });
    }
    if (openRevision) {
      openRevision({
        ...initialDoc,
        status: "For Revision",
        remark: finalRemark,
        attachment: attachment ? attachment.name : null,
      });
    }

    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachment(e.dataTransfer.files[0]);
    }
  };

  const removeAttachment = (e) => {
    e.stopPropagation();
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine page title based on view context
  const docTitle =
    !isApproved && initialDoc.requirement
      ? initialDoc.requirement
      : initialDoc.record || "Faculty Profile";

  const dateFormatted = `${initialDoc.date} - ${initialDoc.time}`;

  // Version history calculation for approved documents
  const currentVerNum = parseInt(String(initialDoc.version).replace(/\D/g, ""), 10) || 2;
  const versions = [
    { version: `Version ${currentVerNum}`, isCurrent: true },
    { version: `Version ${Math.max(1, currentVerNum - 1)}`, isCurrent: false },
  ];

  return (
    <div className="doc-view-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="doc-view-toast" role="status">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Back Button */}
      <div className="doc-view-top-bar">
        <button
          type="button"
          className="doc-view-back-btn"
          onClick={handleBack}
          aria-label={getBackLabel()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>{getBackLabel()}</span>
        </button>
      </div>

      {/* Header Row: Title on Left, Print on Right */}
      <div className="doc-view-header-row">
        <h1 className="doc-view-title">{docTitle}</h1>
        <button
          type="button"
          className="doc-view-print-btn"
          onClick={() => window.print()}
        >
          Print
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="doc-view-grid">
        {/* Left Column: Preview Sheet */}
        <div className="doc-view-left-col">
          <div className="doc-view-file-bar">
            <div className="doc-view-file-badge">
              <span className="doc-view-pdf-tag">PDF</span>
              <span className="doc-view-file-name">{initialDoc.name}</span>
            </div>
            <span className="doc-view-preview-label">Preview</span>
          </div>

          <div className="doc-view-paper">
            <div className="doc-view-paper-header">
              <p className="doc-view-paper-school">
                Mindanao State<br />
                University at<br />
                Naawan
              </p>
              <p className="doc-view-paper-college">College of Information Technology</p>
            </div>

            <div className="doc-view-paper-body">
              <h2 className="doc-view-paper-title">Faculty Profile</h2>
              <p className="doc-view-paper-ay">Academic Year 2027-2027</p>
            </div>
          </div>
        </div>

        {/* Right Column: Document Information Card */}
        <div className="doc-view-right-col">
          <div className="doc-view-info-card">
            <div className="doc-view-info-header">
              <h2 className="doc-view-card-title">Document Information</h2>
              {isApproved && (
                <span className="doc-view-status-badge">Approved</span>
              )}
            </div>

            <div className="doc-view-meta-list">
              <div className="doc-view-meta-row">
                <span className="doc-view-meta-label">File</span>
                <span className="doc-view-meta-value doc-view-meta-file">
                  {initialDoc.name}
                </span>
              </div>

              {isApproved && (
                <>
                  <div className="doc-view-meta-row">
                    <span className="doc-view-meta-label">Requirement</span>
                    <span className="doc-view-meta-value">
                      {initialDoc.requirement}
                    </span>
                  </div>
                  <div className="doc-view-meta-row">
                    <span className="doc-view-meta-label">Required Record</span>
                    <span className="doc-view-meta-value">
                      {initialDoc.record}
                    </span>
                  </div>
                </>
              )}

              <div className="doc-view-meta-row">
                <span className="doc-view-meta-label">Uploaded by</span>
                <span className="doc-view-meta-value">{initialDoc.uploader}</span>
              </div>
              <div className="doc-view-meta-row">
                <span className="doc-view-meta-label">Date uploaded</span>
                <span className="doc-view-meta-value">{dateFormatted}</span>
              </div>
              <div className="doc-view-meta-row">
                <span className="doc-view-meta-label">Current version</span>
                <span className="doc-view-meta-value">{initialDoc.version}</span>
              </div>
              <div className="doc-view-meta-row">
                <span className="doc-view-meta-label">File size</span>
                <span className="doc-view-meta-value">{initialDoc.size}</span>
              </div>
            </div>

            {/* Version History displayed when Approved */}
            {isApproved && (
              <div className="doc-view-version-section">
                <h3 className="doc-view-version-title">Version History</h3>
                <div className="doc-view-version-list">
                  {versions.map((ver, idx) => (
                    <div className="doc-view-version-item" key={idx}>
                      <span
                        className={`doc-view-version-dot ${
                          ver.isCurrent ? "dot-green" : "dot-red"
                        }`}
                      >
                        ●
                      </span>
                      <span className="doc-view-version-name">{ver.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons for Review / Needs Approval */}
          {!isApproved && (
            <div className="doc-view-bottom-actions">
              <button
                type="button"
                className="doc-view-btn-approve"
                onClick={() => setShowApproveConfirm(true)}
              >
                Approve
              </button>
              <button
                type="button"
                className="doc-view-btn-revision"
                onClick={() => setShowRevisionModal(true)}
              >
                Revision
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Approve (matching Required Record modal style) */}
      {showApproveConfirm && (
        <Modal
          title="Approve Document?"
          className="required-record-modal approve-confirm-modal"
          onClose={() => setShowApproveConfirm(false)}
          showClose={false}
          action={handleConfirmApprove}
          actionLabel="Approve"
        >
          <div className="required-record-form">
            <p style={{ margin: "4px 0 12px", fontSize: "14.5px", lineHeight: "1.55", color: "#334155" }}>
              Are you sure you want to approve <strong>{initialDoc.name}</strong> as a verified COPC compliance document?
            </p>
          </div>
        </Modal>
      )}

      {/* Modular Form Modal for Revision (matching Required Record modal style from Image 1) */}
      {showRevisionModal && (
        <Modal
          title="Request Revision"
          className="required-record-modal revision-modal"
          onClose={() => setShowRevisionModal(false)}
          showClose={false}
          action={handleConfirmRevision}
          actionLabel="Send"
        >
          <div className="required-record-form">
            <div className="record-form-group">
              <label>Document Name</label>
              <input
                className="record-form-input"
                type="text"
                value={initialDoc.name}
                readOnly
              />
            </div>

            <div className="record-form-group">
              <label>Instructions/Remarks</label>
              <textarea
                className="record-form-textarea"
                rows="3"
                placeholder="Enter revision instructions or feedback for the submitter..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                autoFocus
              />
            </div>

            <div className="record-form-group">
              <label>Attachments (Optional)</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <div
                className="record-dropzone-box"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
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
    </div>
  );
}

export default DocumentDetails;
