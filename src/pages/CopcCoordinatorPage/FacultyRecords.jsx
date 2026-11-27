import { useState } from "react";
import { createPortal } from "react-dom";
import {
  addFacultyRecord,
  updateFacultyRecord,
} from "../../api/ProgramHeadViewAPI/faculty.api";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

const emptyForm = {
  name: "",
  position: "",
  email: "",
  contact: "",
  program: "Information Technology",
};

export function FacultyRecords({
  facultyRecords = [],
  onAddFaculty,
  onUpdateFaculty,
  onNotify,
}) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filtered = facultyRecords.filter((f) =>
    `${f.name} ${f.position} ${f.program} ${f.email} ${f.contact} ${f.status || "Active"}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (faculty) => {
    setEditingId(faculty.id);
    setForm({
      name: faculty.name || "",
      position: faculty.position || "",
      email: faculty.email || "",
      contact: faculty.contact || "",
      program: faculty.program || "Information Technology",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    const trimmedPosition = form.position.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedContact = form.contact.trim();
    const trimmedProgram = form.program.trim();

    if (!trimmedName) {
      setFormError("Faculty Name is required.");
      return;
    }
    if (!trimmedPosition) {
      setFormError("Position is required.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!trimmedContact) {
      setFormError("Contact Number is required.");
      return;
    }

    const duplicate = facultyRecords.find(
      (f) =>
        f.id !== editingId &&
        ((f.email || "").toLowerCase() === trimmedEmail ||
          ((f.name || "").toLowerCase() === trimmedName.toLowerCase() &&
            (f.program || "").toLowerCase() === trimmedProgram.toLowerCase()))
    );
    if (duplicate) {
      setFormError("A faculty record with this email or name already exists in this program.");
      return;
    }

    const payload = {
      name: trimmedName,
      position: trimmedPosition,
      email: trimmedEmail,
      contact: trimmedContact,
      program: trimmedProgram || "Information Technology",
    };

    try {
      if (editingId !== null) {
        const existing = facultyRecords.find((f) => f.id === editingId);
        const updated = await updateFacultyRecord(editingId, {
          ...existing,
          ...payload,
        });
        onUpdateFaculty?.(updated);
        onNotify?.(`Updated faculty record for ${trimmedName}.`);
      } else {
        const created = await addFacultyRecord(payload);
        onAddFaculty?.(created);
        onNotify?.(`Added ${trimmedName} to faculty records.`);
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      setFormError("");
    } catch {
      setFormError("Unable to save faculty record. Please try again.");
    }
  };

  const handleToggleStatus = async (faculty) => {
    const nextStatus =
      (faculty.status || "Active") === "Active" ? "Inactive" : "Active";
    try {
      const updated = await updateFacultyRecord(faculty.id, {
        ...faculty,
        status: nextStatus,
      });
      onUpdateFaculty?.(updated);
      onNotify?.(`${faculty.name} status updated to ${nextStatus}.`);
    } catch {
      onNotify?.("Failed to update faculty status.");
    }
  };

  return (
    <>
      <PageHead
        title="Faculty Records"
        subtitle="Manage faculty members assigned to the academic program."
      />

      <section className="card table-card representative-records-card">
        <div className="representative-toolbar">
          <div className="search representative-search">
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search faculty records..."
              aria-label="Search faculty records"
            />
          </div>

          <button
            type="button"
            className="btn primary add-representative-btn"
            onClick={openAddModal}
          >
            Add Faculty
          </button>
        </div>

        <table className="representative-table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Position</th>
              <th>Program</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((f, index) => {
                const status = f.status || "Active";
                return (
                  <tr key={f.id || `${f.email || f.name}-${index}`}>
                    <td>{f.name}</td>
                    <td>{f.position}</td>
                    <td>{f.program}</td>
                    <td>{f.email}</td>
                    <td>{f.contact}</td>
                    <td>
                      <span className={`rep-status ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="requirements-empty">
                    <UiIcon name="users" />
                    <b>No faculty records found.</b>
                    <p>Click &ldquo;Add Faculty&rdquo; to create a faculty record.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {modalOpen &&
        createPortal(
          <div
            className="modal-backdrop"
            onMouseDown={() => {
              setModalOpen(false);
              setFormError("");
            }}
          >
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <h2>Faculty</h2>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => {
                    setModalOpen(false);
                    setFormError("");
                  }}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {formError && (
                  <div className="ph-modal-error" style={{ marginBottom: "12px" }}>
                    {formError}
                  </div>
                )}
                <div
                  className="form-grid modal-form"
                  style={{ display: "flex", flexDirection: "column", gap: "16px" }}
                >
                  <label>
                    Faculty Name
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Position
                    <input
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                  <label>
                    Contact Number
                    <input
                      value={form.contact}
                      onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    />
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn secondary"
                  onClick={() => {
                    setModalOpen(false);
                    setFormError("");
                  }}
                >
                  Cancel
                </button>
                <button className="btn primary" onClick={handleSave}>
                  Send
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default FacultyRecords;
