import { useState } from "react";
import { createPortal } from "react-dom";
import Modal from "../../components/ui/Modal";
import UiIcon from "../../components/ui/UiIcon";

export function NewRequestModal({
  onClose,
  onSubmit,
  facultyRecords = [],
  onAddFaculty,
}) {
  const [activeTab, setActiveTab] = useState("request"); // "request" | "faculty"

  // Request form state
  const [documentName, setDocumentName] = useState("");
  const [uploader, setUploader] = useState("");
  const [details, setDetails] = useState("");
  const [formError, setFormError] = useState("");

  // Faculty tab state
  const [facultySearch, setFacultySearch] = useState("");
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: "",
    position: "",
    program: "Information Technology",
    email: "",
    contact: "",
  });
  const [facultyFormError, setFacultyFormError] = useState("");
  const [facultySuccessMessage, setFacultySuccessMessage] = useState("");

  // Filtered faculty list
  const filteredFaculty = facultyRecords.filter((f) =>
    `${f.name} ${f.position} ${f.program} ${f.email} ${f.contact} ${f.status || "Active"}`
      .toLowerCase()
      .includes(facultySearch.toLowerCase())
  );

  // Submit request form
  const handleRequestSubmit = (e) => {
    if (e) e.preventDefault();
    if (!documentName.trim()) {
      setFormError("Document name is required.");
      return;
    }
    if (!uploader.trim()) {
      setFormError("Please select an uploader for this document.");
      return;
    }
    if (!details.trim()) {
      setFormError("Please provide details or instructions for this request.");
      return;
    }

    setFormError("");
    onSubmit({
      documentName: documentName.trim(),
      uploader: uploader.trim(),
      details: details.trim(),
    });
  };

  // Add new faculty member (without status)
  const handleSaveFaculty = (e) => {
    if (e) e.preventDefault();
    if (!newFaculty.name.trim()) {
      setFacultyFormError("Faculty name is required.");
      return;
    }
    if (!newFaculty.position.trim()) {
      setFacultyFormError("Position is required.");
      return;
    }
    if (!newFaculty.program.trim()) {
      setFacultyFormError("Program is required.");
      return;
    }
    if (!newFaculty.email.trim()) {
      setFacultyFormError("Email is required.");
      return;
    }
    if (!newFaculty.contact.trim()) {
      setFacultyFormError("Contact number is required.");
      return;
    }

    const created = {
      id: Date.now(),
      name: newFaculty.name.trim(),
      position: newFaculty.position.trim(),
      program: newFaculty.program.trim(),
      email: newFaculty.email.trim(),
      contact: newFaculty.contact.trim(),
      status: "Active", // Automatically active without exposing status field
    };

    onAddFaculty(created);

    // Auto-select as uploader in request tab
    setUploader(created.name);

    // Reset faculty form
    setNewFaculty({
      name: "",
      position: "",
      program: "Information Technology",
      email: "",
      contact: "",
    });
    setFacultyFormError("");
    setShowAddFaculty(false);
    setFacultySuccessMessage(
      `✓ ${created.name} was successfully added and set as uploader!`
    );
    setTimeout(() => setFacultySuccessMessage(""), 4000);
  };

  const handleSelectUploaderAndReturn = (facultyName) => {
    setUploader(facultyName);
    setActiveTab("request");
    setFormError("");
  };

  return (
    <Modal
      title="New Document Request"
      eyebrow="Program Head"
      subtitle="Request a document submission or view and manage faculty records."
      icon="send"
      className="ph-request-dialog"
      onClose={onClose}
      footer={
        activeTab === "request" ? (
          <div className="modal-actions ph-modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleRequestSubmit}
            >
              <UiIcon name="send" />
              <span>Send Request</span>
            </button>
          </div>
        ) : (
          <div className="modal-actions ph-modal-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => setActiveTab("request")}
            >
              ← Back to Request Form
            </button>
            <button type="button" className="btn primary" onClick={onClose}>
              Done
            </button>
          </div>
        )
      }
    >
      {/* Modal Tab Navigation */}
      <div className="ph-modal-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "request"}
          className={`ph-modal-tab ${activeTab === "request" ? "active" : ""}`}
          onClick={() => setActiveTab("request")}
        >
          <UiIcon name="send" />
          <span>Request Details</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "faculty"}
          className={`ph-modal-tab ${activeTab === "faculty" ? "active" : ""}`}
          onClick={() => setActiveTab("faculty")}
        >
          <UiIcon name="users" />
          <span>Faculty Records</span>
          <span className="ph-tab-badge">{facultyRecords.length}</span>
        </button>
      </div>

      {facultySuccessMessage && (
        <div className="ph-modal-notice success">
          {facultySuccessMessage}
        </div>
      )}

      {/* TAB 1: Request Details Form */}
      {activeTab === "request" && (
        <form onSubmit={handleRequestSubmit} className="ph-request-tab-body">
          {formError && <div className="ph-modal-error">{formError}</div>}

          <div className="form-grid modal-form">
            <label className="full">
              Document Name *
              <input
                type="text"
                value={documentName}
                onChange={(e) => {
                  setDocumentName(e.target.value);
                  if (formError) setFormError("");
                }}
                autoFocus
              />
            </label>

            <label className="full">
              <div className="ph-label-with-action">
                <span>Uploader *</span>
                <button
                  type="button"
                  className="ph-text-btn"
                  onClick={() => setActiveTab("faculty")}
                >
                  <UiIcon name="users" /> View Faculty Directory →
                </button>
              </div>
              <div className="ph-uploader-select-wrapper">
                <select
                  value={uploader}
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setActiveTab("faculty");
                      setShowAddFaculty(true);
                      return;
                    }
                    setUploader(e.target.value);
                    if (formError) setFormError("");
                  }}
                >
                  <option value="">Select faculty member or uploader...</option>
                  <optgroup label="Faculty Members">
                    {facultyRecords.map((f) => (
                      <option key={f.id || f.email} value={f.name}>
                        {f.name} — {f.position} ({f.program})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Other Personnel">
                    <option value="Rizal Lim">
                      Rizal Lim — Office Representative
                    </option>
                    <option value="Maria Santos">
                      Maria Santos — Program Head
                    </option>
                    <option value="Dr. Ramon Castillo">
                      Dr. Ramon Castillo — Dean
                    </option>
                  </optgroup>
                  <optgroup label="Actions">
                    <option value="__add_new__">＋ Add New Faculty Member...</option>
                  </optgroup>
                </select>
              </div>
              {uploader && (
                <div className="ph-uploader-hint">
                  Document will be requested from <b>{uploader}</b>.
                </div>
              )}
            </label>

            <label className="full">
              Details *
              <textarea
                rows={4}
                value={details}
                maxLength={500}
                onChange={(e) => {
                  setDetails(e.target.value);
                  if (formError) setFormError("");
                }}
              />
              <span className="char-count">{details.length} / 500</span>
            </label>
          </div>
        </form>
      )}

      {/* TAB 2: Faculty Records & Add Faculty */}
      {activeTab === "faculty" && (
        <div className="ph-faculty-tab-body">
          {/* Faculty Header Toolbar */}
          <div className="ph-faculty-toolbar">
            <div className="search ph-faculty-search">
              <UiIcon name="search" />
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                aria-label="Search faculty records"
              />
            </div>

            <button
              type="button"
              className="btn primary ph-add-faculty-btn"
              onClick={() => {
                setShowAddFaculty(true);
                setFacultyFormError("");
              }}
            >
              ＋ Add Faculty
            </button>
          </div>

          {/* Add Faculty Form (Collapsible/Modal View) */}
          {showAddFaculty &&
            createPortal(
              <div
                className="ph-faculty-modal-overlay"
                onClick={() => setShowAddFaculty(false)}
              >
                <div
                  className="ph-add-faculty-panel"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="ph-add-faculty-head">
                    <div>
                      <h4>Add New Faculty Member</h4>
                      <small>
                        Enter faculty credentials. Status defaults to Active.
                      </small>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setShowAddFaculty(false)}
                      aria-label="Close add faculty form"
                    >
                      ×
                    </button>
                  </div>

                  {facultyFormError && (
                    <div className="ph-modal-error">{facultyFormError}</div>
                  )}

                  <form onSubmit={handleSaveFaculty}>
                    <div className="form-grid ph-faculty-form-grid">
                      <label>
                        Faculty Name *
                        <input
                          type="text"
                          value={newFaculty.name}
                          onChange={(e) =>
                            setNewFaculty({
                              ...newFaculty,
                              name: e.target.value,
                            })
                          }
                          autoFocus
                        />
                      </label>

                      <label>
                        Position *
                        <input
                          type="text"
                          value={newFaculty.position}
                          onChange={(e) =>
                            setNewFaculty({
                              ...newFaculty,
                              position: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Program *
                        <input
                          type="text"
                          value={newFaculty.program}
                          onChange={(e) =>
                            setNewFaculty({
                              ...newFaculty,
                              program: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label>
                        Email *
                        <input
                          type="email"
                          value={newFaculty.email}
                          onChange={(e) =>
                            setNewFaculty({
                              ...newFaculty,
                              email: e.target.value,
                            })
                          }
                        />
                      </label>

                      <label className="full">
                        Contact Number *
                        <input
                          type="text"
                          value={newFaculty.contact}
                          onChange={(e) =>
                            setNewFaculty({
                              ...newFaculty,
                              contact: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>

                    <div className="ph-add-faculty-actions">
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => setShowAddFaculty(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn primary">
                        Save Faculty
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}

          {/* Current Faculty Records Table */}
          <div className="ph-faculty-table-container">
            <table className="ph-faculty-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Position</th>
                  <th>Program</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length > 0 ? (
                  filteredFaculty.map((f, idx) => {
                    const initials = f.name
                      ? f.name
                          .replace(/(Dr\.|Prof\.|Engr\.|Mr\.|Ms\.)/g, "")
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                      : "F";

                    const isCurrentUploader =
                      uploader &&
                      uploader.toLowerCase() === f.name.toLowerCase();

                    return (
                      <tr
                        key={f.id || `${f.email}-${idx}`}
                        className={isCurrentUploader ? "highlighted-row" : ""}
                      >
                        <td>
                          <div className="ph-faculty-name-wrap">
                            <span className="ph-faculty-avatar">{initials}</span>
                            <div>
                              <b>{f.name}</b>
                              {isCurrentUploader && (
                                <span className="ph-current-tag">
                                  Current Uploader
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{f.position}</td>
                        <td>{f.program}</td>
                        <td>
                          <a
                            href={`mailto:${f.email}`}
                            className="ph-faculty-email"
                          >
                            {f.email}
                          </a>
                        </td>
                        <td>{f.contact}</td>
                        <td>
                          <span
                            className={`rep-status ${(f.status || "Active").toLowerCase()}`}
                          >
                            {f.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn small ${isCurrentUploader ? "primary" : "secondary"}`}
                            onClick={() =>
                              handleSelectUploaderAndReturn(f.name)
                            }
                            title={`Select ${f.name} as document uploader`}
                          >
                            {isCurrentUploader ? "Selected" : "Select as Uploader"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No faculty records found matching &ldquo;{facultySearch}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default NewRequestModal;
