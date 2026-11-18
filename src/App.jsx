import "./App.css";
import { useEffect, useState } from "react";
import { initialDocuments, initialNotices } from "./api/CopcViewAPI/document.api";
import { categoryOptions, initialRequirements } from "./api/CopcViewAPI/requirement.api";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Modal from "./components/ui/Modal";
import UiIcon from "./components/ui/UiIcon";
import { useAuth } from "./context/AuthContext";
import CoordinatorDashboard from "./pages/CopcCoordinatorPage/CoordinatorDashboard";
import DocumentDetails from "./pages/SharedPage/DocumentDetails";
import Documents from "./pages/SharedPage/Documents";
import DeanPage from "./pages/DeanPage/DeanPage";
import FacultyPage from "./pages/FacultyPage/FacultyPage";
import OfficeRepresentativePage from "./pages/OfficeRepresentativePage/OfficeRepresentativePage";
import SendFileModal from "./pages/SharedPage/SendFileModal";
import Login from "./pages/AuthPage/Login";
import LogoutModal from "./pages/AuthPage/LogoutModal";
import NotificationsPage from "./pages/SharedPage/NotificationsPage";
import Reports from "./pages/CopcCoordinatorPage/Reports";
import Representatives from "./pages/CopcCoordinatorPage/Representatives";
import Requests, { RequestDetail } from "./pages/ProgramHeadPage/Requests";
import NewRequestModal from "./pages/ProgramHeadPage/NewRequestModal";
import { initialProgramHeadRequests } from "./api/ProgramHeadViewAPI/request.api";
import { initialFacultyRecords } from "./api/ProgramHeadViewAPI/faculty.api";
import RequirementDetails, { RecordDetails } from "./pages/CopcCoordinatorPage/RequirementDetails";
import Requirements from "./pages/CopcCoordinatorPage/Requirements";
import Review from "./pages/CopcCoordinatorPage/Review";
import Settings from "./pages/SharedPage/Settings";
import UserDashboard from "./pages/ProgramHeadPage/UserDashboard";

export function App() {
  const { logged, currentRole, user, login, logout } = useAuth();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("copc-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("copc-theme", theme);
  }, [theme]);

  const [page, setPage] = useState(() => {
    if (currentRole === "Dean") return "dean";
    if (currentRole === "Faculty") return "faculty";
    if (currentRole === "Office Representative") return "officeRepresentative";
    return "dashboard";
  });

  const [notify, setNotify] = useState(false);
  const [notices, setNotices] = useState(initialNotices);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const [selectedRequirement, setSelectedRequirement] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState(0);
  const [selectedDocObj, setSelectedDocObj] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [addedRequirements, setAddedRequirements] = useState([]);
  const [addedRecords, setAddedRecords] = useState([]);
  const [addedRepresentatives, setAddedRepresentatives] = useState([]);
  const [requests, setRequests] = useState(initialProgramHeadRequests);
  const [facultyRecords, setFacultyRecords] = useState(initialFacultyRecords);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [sendFileRole, setSendFileRole] = useState("Faculty");
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");

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
    return (
      <Login
        onLogin={(role, email) => {
          login(role, email);
          if (role === "Dean") setPage("dean");
          else if (role === "Faculty") setPage("faculty");
          else if (role === "Office Representative")
            setPage("officeRepresentative");
          else setPage("dashboard");
        }}
      />
    );
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
              <UserDashboard
                role={currentRole}
                setPage={setPage}
                openNewRequest={() => setModal("programHeadNewRequest")}
              />
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

          {page === "requests" && (
            <Requests
              setPage={setPage}
              requests={requests}
              facultyRecords={facultyRecords}
              onSelectRequest={(r) => setSelectedRequest(r)}
              openNewRequest={() => setModal("programHeadNewRequest")}
              onAddFaculty={(newFac) => {
                setFacultyRecords((prev) => [...prev, newFac]);
                setToast(`Added ${newFac.name} to faculty records.`);
                setTimeout(() => setToast(""), 3000);
              }}
              onAddRequest={(newReqData) => {
                const uploaderFac = facultyRecords.find(
                  (f) =>
                    f.name.toLowerCase() === newReqData.uploader.toLowerCase()
                );
                const role = uploaderFac?.position || "Faculty";
                const newEntry = [
                  newReqData.documentName,
                  newReqData.uploader,
                  role,
                  new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                  "Requested",
                  "Just now",
                  newReqData.details,
                ];
                newEntry.documentName = newReqData.documentName;
                newEntry.uploader = newReqData.uploader;
                newEntry.details = newReqData.details;

                setRequests((prev) => [newEntry, ...prev]);
                done(
                  `Document request for "${newReqData.documentName}" sent to ${newReqData.uploader}.`,
                  "requests"
                );
              }}
            />
          )}
          {page === "requestDetail" && (
            <RequestDetail setPage={setPage} request={selectedRequest} />
          )}

          {page === "documents" && (
            <Documents
              documents={documents}
              userRole={currentRole}
              openDocument={(index, docObj) => {
                setSelectedDocument(index);
                setSelectedDocObj(docObj);
                setPage("documentDetail");
              }}
            />
          )}

          {page === "dean" && (
            <DeanPage
              documents={documents}
              openDocument={(index, docObj) => {
                setSelectedDocument(index);
                setSelectedDocObj(docObj);
                setPage("documentDetail");
              }}
              openSendFile={() => {
                setSendFileRole("Dean");
                setModal("sendFile");
              }}
            />
          )}

          {page === "faculty" && (
            <FacultyPage
              documents={documents}
              openDocument={(index, docObj) => {
                setSelectedDocument(index);
                setSelectedDocObj(docObj);
                setPage("documentDetail");
              }}
              openSendFile={() => {
                setSendFileRole("Faculty");
                setModal("sendFile");
              }}
            />
          )}

          {page === "officeRepresentative" && (
            <OfficeRepresentativePage
              documents={documents}
              openDocument={(index, docObj) => {
                setSelectedDocument(index);
                setSelectedDocObj(docObj);
                setPage("documentDetail");
              }}
              openSendFile={() => {
                setSendFileRole("Office Representative");
                setModal("sendFile");
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
              document={selectedDocObj}
              documents={documents}
              userRole={currentRole}
              setPage={setPage}
              openRevision={(doc) => {
                if (doc) setSelectedDocObj(doc);
                setModal("revision");
              }}
              openApprove={(doc) => {
                if (doc) setSelectedDocObj(doc);
                setModal("approve");
              }}
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
          {page === "settings" && (
            <Settings
              role={currentRole}
              user={user}
              theme={theme}
              setTheme={setTheme}
              onSaveToast={done}
            />
          )}

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
          action={() => {
            const targetDoc = selectedDocObj || documents[selectedDocument];
            if (targetDoc) {
              setDocuments((prevDocs) =>
                prevDocs.map((d) =>
                  d.name === targetDoc.name || d.id === targetDoc.id
                    ? {
                        ...d,
                        status: "For Revision",
                        remark: revisionRemarks || "Please revise and resubmit.",
                      }
                    : d
                )
              );
              if (selectedDocObj) {
                setSelectedDocObj((prev) => ({
                  ...prev,
                  status: "For Revision",
                  remark: revisionRemarks || "Please revise and resubmit.",
                }));
              }
            }
            setRevisionRemarks("");
            done(
              `Revision request for "${targetDoc?.name || "document"}" submitted.`,
              "documents"
            );
          }}
          actionLabel="Send revision request"
        >
          <div className="modal-doc">
            <b>Selected requirement</b>
            <span>
              {(selectedDocObj || documents[selectedDocument])?.name || "Document.pdf"} · Submitted by{" "}
              {(selectedDocObj || documents[selectedDocument])?.uploader || "Faculty"}
            </span>
          </div>
          <label>
            Revision remarks *
            <textarea
              value={revisionRemarks}
              onChange={(e) => setRevisionRemarks(e.target.value)}
            />
          </label>
          <div className="warning">
            This records {currentRole} as the revision requester. The person
            who uploads the corrected file will be recorded as “Revised By.”
          </div>
        </Modal>
      )}

      {modal === "approve" && (
        <Modal
          title="Approve document?"
          onClose={() => setModal(null)}
          action={() => {
            const targetDoc = selectedDocObj || documents[selectedDocument];
            if (targetDoc) {
              setDocuments((prevDocs) =>
                prevDocs.map((d) =>
                  d.name === targetDoc.name || d.id === targetDoc.id
                    ? { ...d, status: "Approved" }
                    : d
                )
              );
              if (selectedDocObj) {
                setSelectedDocObj((prev) => ({ ...prev, status: "Approved" }));
              }
            }
            setApprovalRemarks("");
            done(
              `Document "${targetDoc?.name || "document"}" approved as an internal COPC requirement.`,
              "documents"
            );
          }}
          actionLabel="Confirm approval"
        >
          <p>
            You are about to approve this document as a completed COPC
            requirement for Bachelor of Science in Information Technology.
          </p>
          <div className="approve-summary">
            {[
              [
                "Requirement",
                (selectedDocObj || documents[selectedDocument])?.requirement ||
                  "Faculty Information",
              ],
              [
                "Document",
                (selectedDocObj || documents[selectedDocument])?.name ||
                  "Document.pdf",
              ],
              [
                "Submitted by",
                (selectedDocObj || documents[selectedDocument])?.uploader ||
                  "Uploader",
              ],
              [
                "Current version",
                (selectedDocObj || documents[selectedDocument])?.version ||
                  "v1",
              ],
            ].map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <b>{x[1]}</b>
              </div>
            ))}
          </div>
          <label>
            Approval remarks (optional)
            <textarea
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              aria-label="Add an internal approval note"
            />
          </label>
          <div className="warning">
            This is an internal document workflow decision. It indicates that the document has been approved internally.
          </div>
        </Modal>
      )}

      {modal === "sendFile" && (
        <SendFileModal
          defaultRole={sendFileRole}
          onClose={() => setModal(null)}
          onSendFile={(newFileData) => {
            const newDoc = {
              id: Date.now(),
              name: newFileData.name,
              requirement: newFileData.requirement,
              record: newFileData.record,
              uploader: newFileData.uploader,
              role: newFileData.role,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              time: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
              version: "v1",
              size: newFileData.size || "1.8 MB",
              status: "Revision", // Status strictly only approved and revision
              details:
                newFileData.notes ||
                "Sent document for COPC Coordinator review.",
            };

            setDocuments((prev) => [newDoc, ...prev]);
            done(
              `File "${newDoc.name}" sent successfully to the COPC Coordinator.`,
              sendFileRole === "Dean"
                ? "dean"
                : sendFileRole === "Faculty"
                  ? "faculty"
                  : "officeRepresentative"
            );
          }}
        />
      )}

      {modal === "logout" && (
        <LogoutModal
          onClose={() => setModal(null)}
          onConfirm={() => {
            setModal(null);
            logout();
            setPage("dashboard");
          }}
        />
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
          </div>
        </Modal>
      )}

      {modal === "programHeadNewRequest" && (
        <NewRequestModal
          onClose={() => setModal(null)}
          facultyRecords={facultyRecords}
          onAddFaculty={(newFac) => {
            setFacultyRecords((prev) => [...prev, newFac]);
            setToast(`Added ${newFac.name} to faculty records.`);
            setTimeout(() => setToast(""), 3000);
          }}
          onSubmit={(newReqData) => {
            const uploaderFac = facultyRecords.find(
              (f) =>
                f.name.toLowerCase() === newReqData.uploader.toLowerCase()
            );
            const role = uploaderFac?.position || "Faculty";
            const newEntry = [
              newReqData.documentName,
              newReqData.uploader,
              role,
              new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              "Requested",
              "Just now",
              newReqData.details,
            ];
            newEntry.documentName = newReqData.documentName;
            newEntry.uploader = newReqData.uploader;
            newEntry.details = newReqData.details;

            setRequests((prev) => [newEntry, ...prev]);
            done(
              `Document request for "${newReqData.documentName}" sent to ${newReqData.uploader}.`,
              "requests"
            );
          }}
        />
      )}
    </div>
  );
}

export default App;
