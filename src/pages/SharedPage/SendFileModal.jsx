import { useState } from "react";
import Modal from "../../components/ui/Modal";
import UiIcon from "../../components/ui/UiIcon";

export function SendFileModal({
  onClose,
  onSendFile,
  defaultRole = "Faculty",
  defaultUploader = "",
}) {
  const getDefaultName = () => {
    if (defaultUploader) return defaultUploader;
    if (defaultRole === "Dean") return "Dr. Ramon Castillo";
    if (defaultRole === "Office Representative") return "Engr. Rizal Lim";
    return "Prof. Ana Reyes";
  };

  const [documentName, setDocumentName] = useState("");
  const [requirement, setRequirement] = useState(
    defaultRole === "Dean"
      ? "Curriculum Information"
      : defaultRole === "Office Representative"
        ? "Facilities"
        : "Faculty Information"
  );
  const [uploader, setUploader] = useState(getDefaultName());
  const [role, setRole] = useState(defaultRole);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!documentName.trim()) {
      setError("Please provide a document name.");
      return;
    }
    if (!uploader.trim()) {
      setError("Please specify the uploader name.");
      return;
    }

    const fileName = file
      ? file.name
      : `${documentName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    const fileSize = file
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : "1.8 MB";

    onSendFile({
      name: fileName,
      documentName: documentName.trim(),
      record: documentName.trim(),
      requirement,
      uploader: uploader.trim(),
      role,
      size: fileSize,
      notes: notes.trim(),
      file,
      status: "Revision", // Status should only be approved and revision
    });

    onClose();
  };

  return (
    <Modal
      title="Send File to Coordinator"
      eyebrow={role}
      subtitle="Upload and send documentary records directly to the COPC Coordinator."
      icon="upload"
      onClose={onClose}
      action={handleSubmit}
      actionLabel="Send File"
    >
      <form onSubmit={handleSubmit} className="send-file-modal-form">
        {error && <div className="ph-modal-error">{error}</div>}

        <div className="form-grid modal-form">
          <label className="full">
            Document Name *
            <input
              type="text"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
          </label>

          <label>
            Requirement / Category *
            <select
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            >
              <option>Faculty Information</option>
              <option>Syllabi</option>
              <option>Teaching Loads</option>
              <option>Curriculum Information</option>
              <option>Facilities</option>
              <option>Library</option>
              <option>Research and Extension</option>
              <option>Student Records</option>
              <option>Other Requirements</option>
            </select>
          </label>

          <label>
            Sender Role *
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                if (e.target.value === "Dean") setUploader("Dr. Ramon Castillo");
                else if (e.target.value === "Office Representative")
                  setUploader("Engr. Rizal Lim");
                else setUploader("Prof. Ana Reyes");
              }}
            >
              <option>Faculty</option>
              <option>Dean</option>
              <option>Office Representative</option>
            </select>
          </label>

          <label className="full">
            Uploader Name *
            <input
              type="text"
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
            />
          </label>

          <label className="full">
            Attach Document File
            {file ? (
              <span className="uploaded-file">
                <i>
                  <UiIcon name="file" />
                </i>
                <span>
                  <b>{file.name}</b>
                  <small>{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                </span>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => setFile(null)}
                >
                  Remove ×
                </button>
              </span>
            ) : (
              <span className="upload-drop">
                <UiIcon name="upload" />
                <span>
                  <b>Click to choose file</b> or drag and drop here
                  <small>PDF, DOC, DOCX, JPG, PNG • Up to 15MB</small>
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                      setFile(selected);
                      if (!documentName) {
                        const baseName = selected.name.replace(/\.[^/.]+$/, "");
                        setDocumentName(baseName.replace(/_/g, " "));
                      }
                    }
                  }}
                />
              </span>
            )}
          </label>

          <label className="full">
            Remarks / Context for COPC Coordinator (Optional)
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

export default SendFileModal;
