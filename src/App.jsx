import "./App.css";
import { useState } from "react";
import { initialNotices } from "./api/CopcViewAPI/document.api";
import { categoryOptions, initialRequirements } from "./api/CopcViewAPI/requirement.api";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Modal from "./components/ui/Modal";
import UiIcon from "./components/ui/UiIcon";
import { useAuth } from "./context/AuthContext";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import DocumentDetails from "./pages/DocumentDetails";
import Documents from "./pages/Documents";
import Login from "./pages/Login";
import NotificationsPage from "./pages/NotificationsPage";
import Reports from "./pages/Reports";
import Representatives from "./pages/Representatives";
import Requests, { RequestDetail } from "./pages/Requests";
import RequirementDetails, { RecordDetails } from "./pages/RequirementDetails";
import Requirements from "./pages/Requirements";
import Review from "./pages/Review";
import Settings from "./pages/Settings";
import UserDashboard from "./pages/UserDashboard";

export function App() {
  const { logged, currentRole, login, logout } = useAuth();

  const [page, setPage] = useState("dashboard");
  const [notify, setNotify] = useState(false);
  const [notices, setNotices] = useState(initialNotices);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const [selectedRequirement, setSelectedRequirement] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addedRequirements, setAddedRequirements] = useState([]);
  const [addedRecords, setAddedRecords] = useState([]);
  const [addedRepresentatives, setAddedRepresentatives] = useState([]);

  const [newRep, setNewRep] = useState({
    name: "",
    office: "",
    program: "Information Technology",
    email: "",
    contact: "",
    status: "Active",
  });

  const [newReq, setNewReq] = useState({
    name: "",
    category: "Faculty",
    description: "",
    responsible: "Program Head",
    year: "2026–2027",
  });

  const [newRecord, setNewRecord] = useState({
    name: "",
    description: "",
    responsible: "",
    type: "Required",
  });

  const [requestRequirement, setRequestRequirement] = useState("");
  const [requestRecipient, setRequestRecipient] = useState(
    "Rizal Lim — Office Representative"
  );
  const [requestRemarks, setRequestRemarks] = useState("");
  const [requestFile, setRequestFile] = useState(null);
  const [requestRequirementLocked, setRequestRequirementLocked] =
    useState(false);

  const done = (message, next) => {
    setModal(null);
    setToast(message);
    if (next) {
      setPage(next);
    }
    setTimeout(() => setToast(""), 3000);
  };

  const markAll = () =>
    setNotices((items) => items.map((n) => ({ ...n, read: true })));

  const openNotice = (notice) => {
    setNotices((items) =>
      items.map((n) => (n.id === notice.id ? { ...n, read: true } : n))
    );
    setNotify(false);
    setPage(notice.target);
  };

  if (!logged) {
    return <Login onLogin={(role, email) => login(role, email)} />;
  }

  const currentRequirementName =
    initialRequirements[selectedRequirement]?.name ||
    addedRequirements[selectedRequirement - initialRequirements.length]?.name ||
    "";

  return (
    <div className="app">
      <Header
        role={currentRole}
        notify={notify}
        onNotify={() => setNotify(!notify)}
        onLogout={() => setModal("logout")}
        onSettings={() => setPage("settings")}
        notices={notices}
        markAll={markAll}
        openNotice={openNotice}
        viewAll={() => {
          setNotify(false);
          setPage("notifications");
        }}
      />

      <Sidebar role={currentRole} page={page} setPage={setPage} />

      <main className="content">
        <div className="page-view" key={page}>
          {page === "dashboard" &&
            (currentRole === "COPC Coordinator" ? (
              <CoordinatorDashboard setPage={setPage} />
            ) : (
              <UserDashboard role={currentRole} setPage={setPage} />
            ))}

          {page === "requirements" && (
            <Requirements
              addedRequirements={addedRequirements}
              openAdd={() => setModal("addRequirement")}
              openRequirement={(index) => {
                setSelectedRequirement(index);
                setPage("requirementDetail");
              }}
            />
          )}

          {page === "requirementDetail" && (
            <RequirementDetails
              index={selectedRequirement}
              setPage={setPage}
              openRequest={() => {
                setRequestRequirement(currentRequirementName);
                setRequestRequirementLocked(true);
                setModal("request");
              }}
              openAddRecord={() => setModal("addRecord")}
              openRecord={(record) => {
                setSelectedRecord(record);
                setPage("recordDetail");
              }}
              addedRecords={addedRecords}
              addedRequirements={addedRequirements}
            />
          )}

          {page === "recordDetail" && (
            <RecordDetails
              setPage={setPage}
              openRevision={() => setModal("revision")}
              openApprove={() => setModal("approve")}
              record={selectedRecord}
              parentRequirement={currentRequirementName}
            />
          )}

          {page === "requests" && <Requests setPage={setPage} />}
          {page === "requestDetail" && <RequestDetail setPage={setPage} />}

          {page === "documents" && (
            <Documents
              openDocument={(index) => {
                setSelectedDocument(index);
                setPage("documentDetail");
              }}
            />
          )}

          {page === "representatives" && (
            <Representatives
              addedRepresentatives={addedRepresentatives}
              openAddRepresentative={() => setModal("addRepresentative")}
            />
          )}

          {page === "documentDetail" && (
            <DocumentDetails
              index={selectedDocument}
              setPage={setPage}
              openRevision={() => setModal("revision")}
              openApprove={() => setModal("approve")}
            />
          )}

          {page === "review" && (
            <Review
              setPage={setPage}
              openRevision={() => setModal("revision")}
              openApprove={() => setModal("approve")}
            />
          )}

          {page === "reports" && <Reports />}
          {page === "settings" && <Settings />}

          {page === "notifications" && (
            <NotificationsPage
              notices={notices}
              markAll={markAll}
              openNotice={openNotice}
            />
          )}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <i>✓</i>
          <div>
            <b>Success</b>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {modal === "request" && (
        <Modal
          title="Send Document Request"
          onClose={() => setModal(null)}
          action={() => setModal("requestConfirm")}
          actionLabel="Send Request"
        >
          <div className="modal-summary request-form">
            <label>
              Program
              <div className="request-input readonly">
                <UiIcon name="academic" />
                <span>Bachelor of Science in Information Technology</span>
              </div>
            </label>

            <label>
              Requirement
              <div
                className={`request-input ${requestRequirementLocked ? "readonly" : ""}`}
              >
                <UiIcon name="checklist" />
                <select
                  value={requestRequirement}
                  disabled={requestRequirementLocked}
                  onChange={(e) => setRequestRequirement(e.target.value)}
                >
                  {[
                    ...initialRequirements.map((r) => r.name),
                    ...addedRequirements.map((r) => r.name),
                  ].map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </div>
              {requestRequirementLocked && (
                <small className="locked-field-note">
                  Automatically selected from the current requirement.
                </small>
              )}
            </label>

            <label>
              Request From
              <div className="request-person-input">
                <i>
                  {requestRecipient.split(" ")[0]?.[0]}
                  {requestRecipient.split(" ")[1]?.[0]}
                </i>
                <select
                  value={requestRecipient}
                  onChange={(e) => setRequestRecipient(e.target.value)}
                >
                  <option>Rizal Lim — Office Representative</option>
                  <option>Maria Santos — Program Head</option>
                  <option>Ramon Castillo — Dean</option>
                  <option>Ana Reyes — Faculty</option>
                  <option>Juan Dela Cruz — Faculty</option>
                </select>
              </div>
            </label>

            <label>
              Remarks / Instructions
              <div className="remarks-field">
                <textarea
                  maxLength={500}
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                />
                <span>{requestRemarks.length} / 500</span>
              </div>
            </label>

            <label>
              Attachments (Optional)
              {requestFile ? (
                <span className="uploaded-file">
                  <i>
                    <UiIcon name="file" />
                  </i>
                  <span>
                    <b>{requestFile.name}</b>
                    <small>
                      {(requestFile.size / 1024 / 1024).toFixed(1)} MB
                    </small>
                  </span>
                  <button type="button" onClick={() => setRequestFile(null)}>
                    Remove ×
                  </button>
                </span>
              ) : (
                <span className="upload-drop">
                  <UiIcon name="upload" />
                  <span>
                    <b>Click to upload</b> or drag and drop
                    <small>PDF, DOC, DOCX, JPG, PNG • Max 10MB</small>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const allowed = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(
                        file.name
                      );
                      if (!allowed || file.size > 10 * 1024 * 1024) {
                        setRequestFile(null);
                        e.target.value = "";
                        setToast(
                          !allowed
                            ? "Unsupported file type. Use PDF, DOC, DOCX, JPG, or PNG."
                            : "File exceeds the 10 MB limit."
                        );
                        return;
                      }
                      setRequestFile(file);
                    }}
                  />
                </span>
              )}
            </label>
          </div>
        </Modal>
      )}

      {modal === "requestConfirm" && (
        <Modal
          title="Send Document Request?"
          onClose={() => setModal("request")}
          action={() =>
            done(
              `Document request sent successfully — ${requestRequirement} was requested from ${requestRecipient.split(" — ")[0]}.`,
              "requests"
            )
          }
          actionLabel="Confirm & Send"
        >
          <p>
            You are about to request <b>“{requestRequirement}”</b> from{" "}
            <b>{requestRecipient.replace(" — ", " (")})</b>.
          </p>
          <p className="confirmation-note">
            The recipient will receive a notification and the request will be
            recorded in the system.
          </p>
        </Modal>
      )}

      {modal === "addRequirement" && (
        <Modal
          title="Add COPC Requirement"
          onClose={() => setModal(null)}
          action={() => setModal("addRequirementConfirm")}
          actionLabel="Continue"
        >
          <p className="modal-subtitle">
            Create a new requirement for the program.
          </p>
          <div className="form-grid modal-form">
            <label>
              Requirement Name *
              <input
                value={newReq.name}
                onChange={(e) => setNewReq({ ...newReq, name: e.target.value })}
              />
            </label>
            <label>
              Category *
              <select
                value={newReq.category}
                onChange={(e) =>
                  setNewReq({ ...newReq, category: e.target.value })
                }
              >
                {categoryOptions.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="full">
              Description *
              <textarea
                value={newReq.description}
                onChange={(e) =>
                  setNewReq({ ...newReq, description: e.target.value })
                }
              />
            </label>
            <label>
              Responsible Personnel / Office
              <select
                value={newReq.responsible}
                onChange={(e) =>
                  setNewReq({ ...newReq, responsible: e.target.value })
                }
              >
                <option>Program Head</option>
                <option>Faculty</option>
                <option>Office Representative</option>
                <option>Dean</option>
              </select>
            </label>
            <label>
              Academic Year *
              <select
                value={newReq.year}
                onChange={(e) => setNewReq({ ...newReq, year: e.target.value })}
              >
                <option>2026–2027</option>
                <option>2025–2026</option>
              </select>
            </label>
          </div>
        </Modal>
      )}

      {modal === "addRequirementConfirm" && (
        <Modal
          title="Create Requirement?"
          onClose={() => setModal("addRequirement")}
          action={() => {
            if (newReq.name) {
              setAddedRequirements((x) => [...x, newReq]);
              done(`${newReq.name} was created successfully.`, "requirements");
            }
          }}
          actionLabel="Create Requirement"
        >
          <p>
            You are about to add{" "}
            <b>“{newReq.name || "this requirement"}”</b> as a new COPC
            requirement for Bachelor of Science in Information Technology.
          </p>
        </Modal>
      )}

      {modal === "addRecord" && (
        <Modal
          title="Add Required Record"
          onClose={() => setModal(null)}
          action={() => setModal("addRecordConfirm")}
          actionLabel="Continue"
        >
          <div className="form-grid modal-form">
            <label className="full">
              Parent Requirement
              <input value={currentRequirementName} readOnly />
            </label>
            <label>
              Required Record Name *
              <input
                value={newRecord.name}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, name: e.target.value })
                }
              />
            </label>
            <label>
              Requirement Type
              <select
                value={newRecord.type}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, type: e.target.value })
                }
              >
                <option>Required</option>
                <option>Optional</option>
              </select>
            </label>
            <label className="full">
              Description *
              <textarea
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
              />
            </label>
            <label>
              Responsible Personnel / Office
              <select
                value={newRecord.responsible}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, responsible: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                <option>Maria Santos — Program Head</option>
                <option>Ana Reyes — Faculty</option>
                <option>Rizal Lim — Office Representative</option>
              </select>
            </label>
            <label>
              Status
              <select>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>
        </Modal>
      )}

      {modal === "addRecordConfirm" && (
        <Modal
          title="Add Required Record?"
          onClose={() => setModal("addRecord")}
          action={() => {
            if (newRecord.name) {
              setAddedRecords((x) => [...x, newRecord]);
              done(
                `${newRecord.name} was added successfully.`,
                "requirementDetail"
              );
            }
          }}
          actionLabel="Add Required Record"
        >
          <p>
            You are about to add{" "}
            <b>“{newRecord.name || "this record"}”</b> under Faculty
            Information.
          </p>
        </Modal>
      )}

      {modal === "revision" && (
        <Modal
          title="Send revision request?"
          onClose={() => setModal(null)}
          action={() => done("Revision request submitted.", "requests")}
          actionLabel="Send revision request"
        >
          <div className="modal-doc">
            <b>Selected requirement</b>
            <span>
              Faculty_Information_BSIT_v2.pdf · Submitted by Juan Dela Cruz
            </span>
          </div>
          <label>
            Revision remarks *
            <textarea defaultValue="" />
          </label>
          <div className="warning">
            This records the coordinator as the revision requester. The person
            who uploads the corrected file will be recorded as “Revised By.”
          </div>
        </Modal>
      )}

      {modal === "approve" && (
        <Modal
          title="Approve document?"
          onClose={() => setModal(null)}
          action={() =>
            done(
              "Document approved as an internal COPC requirement.",
              "documents"
            )
          }
          actionLabel="Confirm approval"
        >
          <p>
            You are about to approve this document as a completed COPC
            requirement for Bachelor of Science in Information Technology.
          </p>
          <div className="approve-summary">
            {[
              ["Requirement", ""],
              ["Document", ""],
              ["Submitted by", ""],
              ["Current version", ""],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
              </div>
            ))}
          </div>
          <label>
            Approval remarks (optional)
            <textarea aria-label="Add an internal approval note" />
          </label>
          <div className="warning">
            This is an internal document workflow decision. It does not indicate
            that CHED has granted a COPC.
          </div>
        </Modal>
      )}

      {modal === "logout" && (
        <Modal
          title="Log Out?"
          onClose={() => setModal(null)}
          action={() => {
            setModal(null);
            logout();
            setPage("dashboard");
          }}
          actionLabel="Log Out"
        >
          <p>
            Are you sure you want to log out of the COPC Record Management
            System?
          </p>
        </Modal>
      )}

      {modal === "addRepresentative" && (
        <Modal
          title="Add Representative"
          onClose={() => setModal(null)}
          action={() => {
            if (newRep.name) {
              setAddedRepresentatives((x) => [...x, newRep]);
              setNewRep({
                name: "",
                office: "",
                program: "Information Technology",
                email: "",
                contact: "",
                status: "Active",
              });
              done("Representative was added successfully.", "representatives");
            }
          }}
          actionLabel="Add Representative"
        >
          <div className="form-grid modal-form">
            <label>
              Representative Name *
              <input
                value={newRep.name}
                onChange={(e) => setNewRep({ ...newRep, name: e.target.value })}
              />
            </label>
            <label>
              Office Name *
              <input
                value={newRep.office}
                onChange={(e) =>
                  setNewRep({ ...newRep, office: e.target.value })
                }
              />
            </label>
            <label>
              Program
              <input
                value={newRep.program}
                onChange={(e) =>
                  setNewRep({ ...newRep, program: e.target.value })
                }
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                value={newRep.email}
                onChange={(e) =>
                  setNewRep({ ...newRep, email: e.target.value })
                }
              />
            </label>
            <label>
              Contact Number
              <input
                value={newRep.contact}
                onChange={(e) =>
                  setNewRep({ ...newRep, contact: e.target.value })
                }
              />
            </label>
            <label>
              Status
              <select
                value={newRep.status}
                onChange={(e) =>
                  setNewRep({ ...newRep, status: e.target.value })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
