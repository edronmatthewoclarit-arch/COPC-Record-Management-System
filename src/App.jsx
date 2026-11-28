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
import FacultyRecords from "./pages/CopcCoordinatorPage/FacultyRecords";
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
    if (
      currentRole === "Dean" ||
      currentRole === "Faculty" ||
      currentRole === "Office Representative"
    ) {
      return "documents";
    }
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
    firstName: "",
    middleName: "",
    lastName: "",
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
    responsible: "Maria Santos - Program Head",
    type: "Required",
    status: "Pending",
  });
  const [requestTargetRecord, setRequestTargetRecord] = useState(null);
  const [recordOverrides, setRecordOverrides] = useState({});

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
          if (
            role === "Dean" ||
            role === "Faculty" ||
            role === "Office Representative"
          ) {
            setPage("documents");
          } else {
            setPage("dashboard");
          }
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
        onLogout={() => {
          logout();
          setPage("dashboard");
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
                documents={documents}
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
              openRequest={(targetRecord) => {
                setRequestTargetRecord(targetRecord || null);
                setRequestRequirement(currentRequirementName);
                setRequestRequirementLocked(true);
                if (targetRecord?.assigned && targetRecord.assigned !== "—") {
                  const roleSuffix = targetRecord.role ? ` — ${targetRecord.role}` : "";
                  setRequestRecipient(`${targetRecord.assigned}${roleSuffix}`);
                }
                setModal("request");
              }}
              openAddRecord={() => setModal("addRecord")}
              openRecord={(record) => {
                setSelectedRecord(record);
                setPage("recordDetail");
              }}
              addedRecords={addedRecords}
              addedRequirements={addedRequirements}
              recordOverrides={recordOverrides}
            />
          )}

          {page === "recordDetail" && (
            <RecordDetails
              setPage={setPage}
              record={selectedRecord}
              parentRequirement={currentRequirementName}
              onUpdateRecord={(updated) => {
                if (selectedRecord) {
                  setSelectedRecord((prev) => ({ ...prev, ...updated }));
                }
                setRecordOverrides((prev) => ({
                  ...prev,
                  [selectedRecord?.id || selectedRecord?.name]: updated.status,
                }));
              }}
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
              onUpdateRequest={(updatedReq) => {
                const uId = Array.isArray(updatedReq)
                  ? updatedReq[0]
                  : updatedReq.id || updatedReq.documentName || updatedReq.name;
                setRequests((prev) =>
                  prev.map((r) => {
                    const rId = Array.isArray(r) ? r[0] : r.id || r.documentName || r.name;
                    if (rId === uId) {
                      if (Array.isArray(r)) {
                        const next = [...r];
                        next[4] = "Submitted";
                        return next;
                      }
                      return { ...r, status: "Submitted" };
                    }
                    return r;
                  })
                );
              }}
              setToast={setToast}
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
              userProgram={user?.program || "Information Technology"}
              openSendFile={() => {
                setSendFileRole(currentRole);
                setModal("sendFile");
              }}
              openDocument={(index, docObj) => {
                setSelectedDocument(index);
                setSelectedDocObj(docObj);
                setPage("documentDetail");
              }}
              onRequest={currentRole === "Program Head" ? (newReqData) => {
                const docName = newReqData.documentName.replace(/\.pdf$/i, "").trim();
                const newDoc = {
                  id: Date.now(),
                  name: docName,
                  uploader: newReqData.uploader,
                  role: "Faculty",
                  date: newReqData.date || "November 13, 2026",
                  status: "Requested",
                  program: user?.program || "Information Technology",
                };

                setDocuments((prev) => [newDoc, ...prev]);
                setToast(`Document request for "${docName}" created.`);
                setTimeout(() => setToast(""), 3000);
              } : undefined}
              onUpdateDocument={(updatedDoc) => {
                setDocuments((prev) =>
                  prev.map((d) =>
                    (updatedDoc.id && d.id === updatedDoc.id) || d.name === updatedDoc.name
                      ? { ...d, ...updatedDoc }
                      : d
                  )
                );
                setToast(`Document "${updatedDoc.name.replace(/\.pdf$/i, "")}" submitted successfully.`);
                setTimeout(() => setToast(""), 3000);
              }}
            />
          )}

          {page === "facultyRecords" && (
            <FacultyRecords
              facultyRecords={facultyRecords}
              onAddFaculty={(newFac) =>
                setFacultyRecords((prev) => [...prev, newFac])
              }
              onUpdateFaculty={(updatedFac) =>
                setFacultyRecords((prev) =>
                  prev.map((f) => (f.id === updatedFac.id ? updatedFac : f))
                )
              }
              onNotify={(msg) => {
                setToast(msg);
                setTimeout(() => setToast(""), 3000);
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
              source={
                currentRole === "Program Head" || currentRole === "Dean"
                  ? "programDocuments"
                  : "documents"
              }
              onUpdateDocumentStatus={(updatedDoc) => {
                setDocuments((prevDocs) =>
                  prevDocs.map((d) =>
                    d.name === updatedDoc.name || d.id === updatedDoc.id
                      ? { ...d, ...updatedDoc }
                      : d
                  )
                );
                if (selectedDocObj) {
                  setSelectedDocObj((prev) => ({ ...prev, ...updatedDoc }));
                }
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
          action={() => {
            if (requestTargetRecord) {
              setRecordOverrides((prev) => ({
                ...prev,
                [requestTargetRecord.name]: {
                  status: "Requested",
                  updated: "Just now",
                },
              }));
              setAddedRecords((prev) =>
                prev.map((rec) =>
                  rec.name === requestTargetRecord.name
                    ? { ...rec, status: "Requested", updated: "Just now" }
                    : rec
                )
              );
            }
            done(
              `Document request sent successfully — ${requestTargetRecord?.name || requestRequirement} was requested from ${requestRecipient.split(" — ")[0]}.`
            );
          }}
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

      {modal === "addRequirement" && (
        <Modal
          title="COPC Requirement"
          className="add-requirement-modal"
          onClose={() => setModal(null)}
          action={() => {
            if (newReq.name.trim()) {
              setAddedRequirements((x) => [...x, newReq]);
              done(`${newReq.name} was created successfully.`, "requirements");
              setNewReq({
                name: "",
                category: "Faculty",
                description: "",
                responsible: "Program Head",
                year: "2026–2027",
              });
            } else {
              setModal(null);
            }
          }}
          actionLabel="Save"
          showClose={false}
        >
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
          </div>
        </Modal>
      )}

      {modal === "addRecord" && (
        <Modal
          title="Required Record"
          className="required-record-modal"
          onClose={() => setModal(null)}
          showClose={false}
          action={() => {
            if (newRecord.name.trim()) {
              setAddedRecords((x) => [
                ...x,
                {
                  ...newRecord,
                  name: newRecord.name.trim(),
                  responsible:
                    newRecord.responsible || "Maria Santos - Program Head",
                  status: "Pending",
                  type: "Required",
                },
              ]);
              done(
                `${newRecord.name.trim()} was added successfully.`,
                "requirementDetail"
              );
              setNewRecord({
                name: "",
                description: "",
                responsible: "Maria Santos - Program Head",
                type: "Required",
                status: "Pending",
              });
            } else {
              setModal(null);
            }
          }}
          actionLabel="Save"
        >
          <div className="required-record-form">
            <div className="record-form-group">
              <label>Required Record Name</label>
              <input
                className="record-form-input"
                value={newRecord.name}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="record-form-group">
              <label>Responsible Personnel</label>
              <div className="record-select-wrapper">
                <select
                  className="record-form-select"
                  value={
                    newRecord.responsible || "Maria Santos - Program Head"
                  }
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, responsible: e.target.value })
                  }
                >
                  <option value="Maria Santos - Program Head">
                    Maria Santos - Program Head
                  </option>
                  <option value="Ana Reyes - Faculty">
                    Ana Reyes - Faculty
                  </option>
                  <option value="Rizal Lim - Office Representative">
                    Rizal Lim - Office Representative
                  </option>
                </select>
                <span className="record-select-arrow" aria-hidden="true">
                  <UiIcon name="chevron-down" />
                </span>
              </div>
            </div>
          </div>
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
              program: user?.program || "Information Technology",
              status: "Revision", // Status strictly only approved and revision
              details:
                newFileData.notes ||
                "Sent document for COPC Coordinator review.",
            };

            setDocuments((prev) => [newDoc, ...prev]);
            done(
              `File "${newDoc.name}" sent successfully to the COPC Coordinator.`,
              "documents"
            );
          }}
        />
      )}

      {modal === "addRepresentative" && (
        <Modal
          title="Add Representative"
          showClose={false}
          onClose={() => setModal(null)}
          action={() => {
            const f = newRep.firstName?.trim() || "";
            const m = newRep.middleName?.trim() || "";
            const l = newRep.lastName?.trim() || "";
            let finalName = "";
            if (f && l) {
              if (m) {
                const initial = m.replace(/\.+$/, "")[0]?.toUpperCase();
                finalName = `${f} ${initial ? `${initial}. ` : ""}${l}`;
              } else {
                finalName = `${f} ${l}`;
              }
            } else {
              finalName = newRep.name?.trim() || [f, m, l].filter(Boolean).join(" ");
            }

            if (finalName) {
              setAddedRepresentatives((x) => [
                ...x,
                {
                  ...newRep,
                  name: finalName,
                  firstName: f,
                  middleName: m,
                  lastName: l,
                },
              ]);
              setNewRep({
                name: "",
                firstName: "",
                middleName: "",
                lastName: "",
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
            <div className="rep-name-row full">
              <label>
                First Name *
                <input
                  value={newRep.firstName}
                  onChange={(e) =>
                    setNewRep({ ...newRep, firstName: e.target.value })
                  }
                  placeholder="e.g. Juan"
                />
              </label>
              <label>
                Middle Name
                <input
                  value={newRep.middleName}
                  onChange={(e) =>
                    setNewRep({ ...newRep, middleName: e.target.value })
                  }
                  placeholder="e.g. Cruz"
                />
              </label>
              <label>
                Last Name *
                <input
                  value={newRep.lastName}
                  onChange={(e) =>
                    setNewRep({ ...newRep, lastName: e.target.value })
                  }
                  placeholder="e.g. Dela Cruz"
                />
              </label>
            </div>
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
