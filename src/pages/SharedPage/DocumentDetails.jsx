import { useState } from "react";
import { initialDocuments } from "../../api/CopcViewAPI/document.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function DocumentDetails({
  index,
  document: passedDoc,
  documents = initialDocuments,
  setPage,
  openRevision,
  openApprove,
  source = "documents",
  record,
  parentRequirement,
  userRole = "Program Head",
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const base =
    passedDoc ||
    documents[index] ||
    initialDocuments[index] ||
    initialDocuments[0];

  const doc = record
    ? {
        name: record.file || "Document.pdf",
        size: record.size || "1.8 MB",
        requirement: parentRequirement || "Faculty Information",
        record: record.name || "Compliance Record",
        uploader: record.assigned || "Faculty Submitter",
        role: record.role || "Faculty",
        date: record.updated ? record.updated.split(" • ")[0] : "Oct 24, 2026",
        time: record.updated ? record.updated.split(" • ")[1] || "" : "10:30 AM",
        version: record.version || "v1",
        status: record.status || "For Revision",
      }
    : base;

  if (!doc) {
    return (
      <section className="card">
        <p className="empty-state">No document selected.</p>
        <button className="btn secondary" onClick={() => setPage("documents")}>
          Back to Documents
        </button>
      </section>
    );
  }

  const fromRequirements = source === "requirements";
  const docTitle = doc.record || doc.name;

  return (
    <div className="document-details-view">
      <button
        className="back"
        onClick={() =>
          setPage(
            fromRequirements
              ? "requirementDetail"
              : source === "dean"
                ? "dean"
                : source === "faculty"
                  ? "faculty"
                  : source === "officeRepresentative"
                    ? "officeRepresentative"
                    : "documents"
          )
        }
      >
        ← Back to{" "}
        {fromRequirements
          ? "Faculty Information"
          : source === "dean"
            ? "Dean Documents"
            : source === "faculty"
              ? "Faculty Documents"
              : source === "officeRepresentative"
                ? "Office Rep Documents"
                : "Documents"}
      </button>

      <PageHead
        title={docTitle}
        subtitle={`COPC Compliance > ${doc.requirement || "General"} > ${doc.name}`}
        action={
          <div className="doc-head-actions">
            <button
              type="button"
              className="btn danger icon-button doc-revision-btn"
              onClick={() => openRevision && openRevision(doc)}
            >
              <UiIcon name="revision" />
              <span>Revision</span>
            </button>
            <button
              type="button"
              className="btn success icon-button doc-approve-btn"
              onClick={() => openApprove && openApprove(doc)}
            >
              <UiIcon name="check" />
              <span>Approve</span>
            </button>
            <button
              type="button"
              className="btn secondary icon-button"
              onClick={() => alert(`Downloading ${doc.name}...`)}
            >
              <UiIcon name="download" />
              <span>Download</span>
            </button>
          </div>
        }
      />

      <div className="document-detail-grid">
        {/* Left Column: Document Preview Viewer */}
        <div>
          <section className="pdf document-viewer">
            <div className="pdf-tools">
              <span className="pdf-doc-name">
                <UiIcon name="file" /> {doc.name}
              </span>
              <div className="pdf-controls">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <span>{currentPage} / 4</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
                  disabled={currentPage >= 4}
                  aria-label="Next page"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  aria-label="Zoom out"
                >
                  −
                </button>
                <b>{zoomLevel}%</b>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                  aria-label="Zoom in"
                >
                  ＋
                </button>
                <button type="button" onClick={() => setZoomLevel(100)}>
                  Fit Page
                </button>
              </div>
            </div>

            <div className="viewer-body">
              <aside className="page-thumbnails">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={currentPage === n ? "active" : ""}
                    onClick={() => setCurrentPage(n)}
                  >
                    <span>{n}</span>
                  </button>
                ))}
              </aside>

              <div
                className="paper"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              >
                <div className="paper-seal">MSU</div>
                <b>MINDANAO STATE UNIVERSITY AT NAAWAN</b>
                <span>College of Information Technology</span>
                <h2>{docTitle.toUpperCase()}</h2>
                <p>
                  <b>Bachelor of Science in Information Technology</b>
                  <br />
                  Academic Year 2026–2027 • CHED COPC Compliance Record
                </p>

                {/* Dynamic Document Content Preview */}
                {doc.name.toLowerCase().includes("syllabus") ||
                doc.requirement.toLowerCase().includes("syllabi") ? (
                  <div className="paper-section">
                    <h3>COURSE SYLLABUS OUTLINE</h3>
                    <table className="paper-table">
                      <tbody>
                        <tr>
                          <th>Course Code</th>
                          <td>ITE 183 / ITD 109</td>
                          <th>Credit Units</th>
                          <td>3 Units (2 hrs lec, 3 hrs lab)</td>
                        </tr>
                        <tr>
                          <th>Course Title</th>
                          <td colSpan={3}>{doc.record || "Web Systems and Technologies"}</td>
                        </tr>
                        <tr>
                          <th>Prerequisites</th>
                          <td colSpan={3}>ITE 101 Computer Programming II</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="paper-copy">
                      <b>Course Description:</b> This course covers technologies and
                      architectures used to build scalable modern web applications,
                      APIs, and interactive web clients conforming with CHED CMO 25 series.
                    </p>
                  </div>
                ) : doc.name.toLowerCase().includes("laboratory") ||
                  doc.requirement.toLowerCase().includes("facilities") ? (
                  <div className="paper-section">
                    <h3>LABORATORY &amp; FACILITY SPECIFICATIONS</h3>
                    <table className="paper-table">
                      <thead>
                        <tr>
                          <th>Facility / Room</th>
                          <th>Equipment Details</th>
                          <th>Quantity</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>IT Laboratory 1</td>
                          <td>Core i7 Workstations, 16GB RAM</td>
                          <td>45 Units</td>
                          <td>Operational</td>
                        </tr>
                        <tr>
                          <td>Networking Lab</td>
                          <td>Cisco 2960 Switches &amp; Routers</td>
                          <td>8 Racks</td>
                          <td>Operational</td>
                        </tr>
                        <tr>
                          <td>Server Room</td>
                          <td>Enterprise Rack Server, APC UPS</td>
                          <td>2 Units</td>
                          <td>Operational</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : doc.name.toLowerCase().includes("curriculum") ? (
                  <div className="paper-section">
                    <h3>CURRICULUM MAPPING &amp; GRADUATION REQUIREMENTS</h3>
                    <table className="paper-table">
                      <thead>
                        <tr>
                          <th>Year Level</th>
                          <th>Semester</th>
                          <th>Total Courses</th>
                          <th>Total Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>First Year</td>
                          <td>1st &amp; 2nd Sem</td>
                          <td>14 Courses</td>
                          <td>38 Units</td>
                        </tr>
                        <tr>
                          <td>Second Year</td>
                          <td>1st &amp; 2nd Sem</td>
                          <td>15 Courses</td>
                          <td>40 Units</td>
                        </tr>
                        <tr>
                          <td>Third Year</td>
                          <td>1st &amp; 2nd Sem</td>
                          <td>14 Courses</td>
                          <td>39 Units</td>
                        </tr>
                        <tr>
                          <td>Fourth Year</td>
                          <td>Capstone &amp; OJT</td>
                          <td>6 Courses</td>
                          <td>23 Units</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="paper-section">
                    <h3>FACULTY QUALIFICATION &amp; CREDENTIALS SUMMARY</h3>
                    <table className="paper-table">
                      <thead>
                        <tr>
                          <th>Faculty Name</th>
                          <th>Academic Rank</th>
                          <th>Highest Degree Earned</th>
                          <th>Specialization</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Dr. Ana Reyes</td>
                          <td>Associate Professor</td>
                          <td>Ph.D. in Computer Science</td>
                          <td>Software Engineering &amp; AI</td>
                        </tr>
                        <tr>
                          <td>Prof. Juan Dela Cruz</td>
                          <td>Assistant Professor</td>
                          <td>MS Information Technology</td>
                          <td>Database &amp; Data Mining</td>
                        </tr>
                        <tr>
                          <td>Engr. Rizal Lim</td>
                          <td>Instructor</td>
                          <td>BS Computer Engineering / MIT</td>
                          <td>Networks &amp; Security</td>
                        </tr>
                        <tr>
                          <td>Prof. Maria Santos</td>
                          <td>Program Head</td>
                          <td>Doctor of Information Tech</td>
                          <td>Information Systems</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="paper-footer">
                  <div className="paper-sign">
                    <b>Verified &amp; Certified Correct:</b>
                    <span>{doc.uploader}</span>
                    <small>{doc.role}</small>
                  </div>
                  <div className="paper-sign">
                    <b>Endorsed for COPC Review:</b>
                    <span>Academic Standards Committee</span>
                    <small>MSU at Naawan</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Remarks and Comments Card */}
          <section className="card comments-card">
            <h2>Remarks / Comments</h2>
            <div className="comment-form">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Write a comment or review note"
              />
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  if (comment.trim()) {
                    setComments((prev) => [
                      ...prev,
                      {
                        author: `${userRole} (You)`,
                        text: comment.trim(),
                        time: "Just now",
                      },
                    ]);
                    setComment("");
                  }
                }}
              >
                Add Remark
              </button>
            </div>

            {doc.remark && (
              <div className="comment system-remark">
                <div className="avatar small danger">!</div>
                <div>
                  <b>
                    Reviewer Note <small>Important Feedback</small>
                  </b>
                  <p>{doc.remark}</p>
                </div>
              </div>
            )}

            {comments.map((c, i) => (
              <div className="comment" key={`${c.text}-${i}`}>
                <div className="avatar small">U</div>
                <div>
                  <b>
                    {c.author} <small>{c.time}</small>
                  </b>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column: File Information Panel & Decision Buttons */}
        <section className="card document-info-panel">
          <div className="section-head">
            <h2>Document Information</h2>
            <Badge status={doc.status} />
          </div>

          {[
            ["Document Name", docTitle],
            ["File Name", doc.name],
            ["Requirement", doc.requirement || "COPC Document"],
            ["Required Record", doc.record || docTitle],
            ["Category", doc.requirement?.includes("Faculty") ? "Faculty" : "Program Records"],
            ["Uploaded By", doc.uploader],
            ["Submitter Role", doc.role || "Faculty"],
            ["Date Uploaded", `${doc.date} • ${doc.time || "10:00 AM"}`],
            ["Current Version", doc.version || "v1"],
            ["File Size", doc.size || "1.8 MB"],
            ["Status", doc.status],
          ].map((x) => (
            <div className="document-info-row" key={x[0]}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}

          {/* Action Decision Panel */}
          <div className="document-decision-panel">
            <span>REVIEW DECISION</span>
            <p>Review this document and take appropriate action.</p>
            <div className="decision-actions-row">
              <button
                type="button"
                className="btn danger"
                onClick={() => openRevision && openRevision(doc)}
              >
                <UiIcon name="revision" />
                <span>Request Revision</span>
              </button>
              <button
                type="button"
                className="btn success"
                onClick={() => openApprove && openApprove(doc)}
              >
                <UiIcon name="check" />
                <span>Approve Document</span>
              </button>
            </div>
          </div>

          <div className="panel-history">
            <h3>VERSION HISTORY</h3>
            <div className="history-item">
              <i>●</i>
              <span>
                <b>Version {doc.version || "v1"} (Current)</b>
                <small>
                  {doc.date} • Uploaded by {doc.uploader}
                </small>
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DocumentDetails;
