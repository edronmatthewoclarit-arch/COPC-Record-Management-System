import { useState } from "react";
import { createPortal } from "react-dom";
import {
  addFacultyRecord,
  updateFacultyRecord,
} from "../../api/ProgramHeadViewAPI/faculty.api";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
import Modal from "../../components/ui/Modal";

const formatFullNameWithMiddleInitial = (firstName, middleName, lastName) => {
  const f = firstName?.trim() || "";
  const m = middleName?.trim() || "";
  const l = lastName?.trim() || "";

  if (!f && !l) return "";
  if (m) {
    const initial = m.replace(/\.+$/, "")[0]?.toUpperCase();
    return [f, initial ? `${initial}.` : "", l].filter(Boolean).join(" ");
  }
  return [f, l].filter(Boolean).join(" ");
};

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
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
    let fn = faculty.firstName || "";
    let mn = faculty.middleName || "";
    let ln = faculty.lastName || "";

    if (!fn && faculty.name) {
      const parts = faculty.name.trim().split(/\s+/);
      if (parts.length === 1) {
        fn = parts[0];
      } else if (parts.length === 2) {
        fn = parts[0];
        ln = parts[1];
      } else if (parts.length > 2) {
        fn = parts[0];
        mn = parts.slice(1, -1).join(" ");
        ln = parts[parts.length - 1];
      }
    }

    setForm({
      firstName: fn,
      middleName: mn,
      lastName: ln,
      name: faculty.name || "",
      position: faculty.position || faculty.rank || "",
      email: faculty.email || "",
      contact: faculty.contact || "",
      program: faculty.program || "Information Technology",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedFirst = form.firstName.trim();
    const trimmedMiddle = form.middleName.trim();
    const trimmedLast = form.lastName.trim();
    const trimmedPosition = form.position.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedContact = form.contact.trim();
    const trimmedProgram = form.program.trim();

    if (!trimmedFirst) {
      setFormError("First Name is required.");
      return;
    }
    if (!trimmedLast) {
      setFormError("Last Name is required.");
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

    const formattedName = formatFullNameWithMiddleInitial(
      trimmedFirst,
      trimmedMiddle,
      trimmedLast
    );

    const duplicate = facultyRecords.find(
      (f) =>
        f.id !== editingId &&
        ((f.email || "").toLowerCase() === trimmedEmail ||
          ((f.name || "").toLowerCase() === formattedName.toLowerCase() &&
            (f.program || "").toLowerCase() === trimmedProgram.toLowerCase()))
    );
    if (duplicate) {
      setFormError("A faculty record with this email or name already exists in this program.");
      return;
    }

    const payload = {
      name: formattedName,
      firstName: trimmedFirst,
      middleName: trimmedMiddle,
      lastName: trimmedLast,
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
        onNotify?.(`Updated faculty record for ${formattedName}.`);
      } else {
        const created = await addFacultyRecord(payload);
        onAddFaculty?.(created);
        onNotify?.(`Added ${formattedName} to faculty records.`);
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
                let displayName = f.name;
                if (f.firstName && f.lastName) {
                  displayName = formatFullNameWithMiddleInitial(
                    f.firstName,
                    f.middleName,
                    f.lastName
                  );
                }

                return (
                  <tr key={f.id || `${f.email || f.name}-${index}`}>
                    <td>{displayName || f.name}</td>
                    <td>{f.position || f.rank}</td>
                    <td>{f.program || "Information Technology"}</td>
                    <td>{f.email}</td>
                    <td>{f.contact || "—"}</td>
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

      {modalOpen && (
        <Modal
          title={editingId !== null ? "Edit Faculty" : "Add Faculty"}
          className="add-representative-modal add-faculty-modal"
          showClose={false}
          onClose={() => {
            setModalOpen(false);
            setFormError("");
          }}
          action={handleSave}
          actionLabel={editingId !== null ? "Save Changes" : "Save"}
        >
          {formError && (
            <div className="ph-modal-error" style={{ marginBottom: "12px" }}>
              {formError}
            </div>
          )}
          <div className="form-grid modal-form">
            <div className="rep-name-row full">
              <label>
                First Name *
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  placeholder="e.g. Maria"
                  autoFocus
                />
              </label>
              <label>
                Middle Name
                <input
                  value={form.middleName}
                  onChange={(e) =>
                    setForm({ ...form, middleName: e.target.value })
                  }
                  placeholder="e.g. Santos"
                />
              </label>
              <label>
                Last Name *
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder="e.g. Cruz"
                />
              </label>
            </div>
            <label>
              Position *
              <input
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
                placeholder="e.g. Instructor I"
              />
            </label>
            <label>
              Program
              <input
                value={form.program}
                onChange={(e) =>
                  setForm({ ...form, program: e.target.value })
                }
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. maria.cruz@msunaawan.edu.ph"
              />
            </label>
            <label>
              Contact Number *
              <input
                value={form.contact}
                onChange={(e) =>
                  setForm({ ...form, contact: e.target.value })
                }
                placeholder="e.g. 09123456789"
              />
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}

export default FacultyRecords;
