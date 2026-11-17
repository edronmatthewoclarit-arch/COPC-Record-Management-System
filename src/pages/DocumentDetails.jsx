import { useState } from "react";
import { initialDocuments } from "../api/CopcViewAPI/document.api";
import Badge from "../components/ui/Badge";
import PageHead from "../components/ui/PageHead";
import UiIcon from "../components/ui/UiIcon";

export function DocumentDetails({
  index,
  setPage,
  openRevision,
  openApprove,
  source = "documents",
  record,
  parentRequirement,
}) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  const base = initialDocuments[index] || initialDocuments[0];
  const doc = record
    ? {
        name: record.file || "",
        size: record.size,
        requirement: parentRequirement || "Faculty Information",
        record: record.name,
        uploader: record.assigned,
        role: record.role,
        date: record.updated.split(" • ")[0],
        time: record.updated.split(" • ")[1] || "",
        version: record.version,
        status: record.status,
      }
    : base;

  if (!doc) {
    return (
      <section className="card">
        <p className="empty-state">No document selected.</p>
      </section>
    );
  }

  const versionHistory = [];
  const reviewEvents = [];
  const fromRequirements = source === "requirements";

  return (
    <>
      <button
        className="back"
        onClick={() =>
          setPage(fromRequirements ? "requirementDetail" : "documents")
        }
      >
        ← Back to {fromRequirements ? "Faculty Information" : "Documents"}
      </button>

      <PageHead
        title={doc.record}
        subtitle={`${fromRequirements ? "Requirements" : "Documents"} > ${doc.requirement} > ${doc.record}`}
        action={
          <button className="btn secondary icon-button">
            <UiIcon name="download" />
            Download
          </button>
        }
      />

      <div className="document-detail-grid">
        <div>
          <section className="pdf document-viewer">
            <div className="pdf-tools">
              <span>{doc.name}</span>
              <div>
                <button>‹</button>
                <span>1 / 4</span>
                <button>›</button>
                <button>−</button>
                <b>100%</b>
                <button>＋</button>
                <button>Fit Page</button>
                <button aria-label="Download">
                  <UiIcon name="download" />
                </button>
              </div>
            </div>

            <div className="viewer-body">
              <aside className="page-thumbnails">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} className={n === 1 ? "active" : ""}>
                    <span>{n}</span>
                  </button>
                ))}
              </aside>

              <div className="paper">
                <div className="paper-seal">MSU</div>
                <b>MINDANAO STATE UNIVERSITY AT NAAWAN</b>
                <span>College of Information Technology</span>
                <h2>{doc.record.toUpperCase()}</h2>
                <p>
                  <b>Bachelor of Science in Information Technology</b>
                  <br />
                  Academic Year 2026–2027
                </p>

                {doc.name.includes("Faculty_Qualifications") && (
                  <>
                    <h3>FACULTY QUALIFICATION SUMMARY</h3>
                    <table>
                      <tbody>
                        <tr>
                          <td>Faculty Name</td>
                          <td>Academic Rank</td>
                          <td>Highest Attainment</td>
                        </tr>
                        <tr>
                          <td>Alex Rivera</td>
                          <td>Assistant Professor</td>
                          <td>MS Information Technology</td>
                        </tr>
                        <tr>
                          <td>Jamie Cruz</td>
                          <td>Instructor III</td>
                          <td>MS Computer Science</td>
                        </tr>
                        <tr>
                          <td>Patricia Flores</td>
                          <td>Instructor II</td>
                          <td>MIT</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="paper-copy">
                      This fictional demonstration document summarizes academic
                      qualifications, specialization, teaching experience, and
                      relevant certifications.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="card comments-card">
            <h2>Remarks / Comments</h2>
            <div className="comment-form">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                aria-label="Write a comment or review note"
              />
              <button
                className="btn primary"
                onClick={() => {
                  if (comment.trim()) {
                    setComments((x) => [...x, comment]);
                    setComment("");
                  }
                }}
              >
                Add Comment
              </button>
            </div>

            {comments.map((c, i) => (
              <div className="comment" key={`${c}-${i}`}>
                <div className="avatar small">U</div>
                <div>
                  <b>
                    Rubie Jane Jabagat{" "}
                    <small>COPC Coordinator • Oct 20, 2026 • 9:45 AM</small>
                  </b>
                  <p>{c}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="card document-info-panel">
          <div className="section-head">
            <h2>Document Information</h2>
            <Badge status={doc.status} />
          </div>

          {[
            ["File", doc.name],
            ["Requirement", doc.requirement],
            ["Required Record", doc.record],
            [
              "Category",
              doc.requirement.includes("Faculty")
                ? "Faculty"
                : "Program Records",
            ],
            ["Uploaded By", doc.uploader],
            ["Role", doc.role],
            ["Date Uploaded", `${doc.date} • ${doc.time}`],
            ["Current Version", doc.version],
            ["File Size", doc.size],
          ].map((x) => (
            <div className="document-info-row" key={x[0]}>
              <span>{x[0]}</span>
              <b>{x[1]}</b>
            </div>
          ))}

          <div className="panel-history">
            <h3>VERSION HISTORY</h3>
            {versionHistory.map((x) => (
              <button key={x[0]}>
                <i />
                <span>
                  <b>
                    Version {x[0].replace("v", "")} {x[1] && <em>{x[1]}</em>}
                  </b>
                  <small>
                    {x[2]}
                    <br />
                    Uploaded by {doc.uploader}
                  </small>
                </span>
              </button>
            ))}
          </div>

          <div className="panel-history review-history">
            <h3>REVIEW HISTORY</h3>
            {reviewEvents.map((x, i) => (
              <div key={x}>
                <i
                  className={
                    x.startsWith("Approved")
                      ? "green"
                      : x.startsWith("Revision requested")
                        ? "red"
                        : ""
                  }
                />
                <span>
                  <b>{x}</b>
                  <small>Oct {20 - i}, 2026 • 9:45 AM</small>
                  {x.startsWith("Approved") && (
                    <em className="history-remark">Complete and verified.</em>
                  )}
                  {x.startsWith("Revision requested") && (
                    <em className="history-remark">
                      {record?.remark ||
                        "Please update the document based on the coordinator's remarks."}
                    </em>
                  )}
                </span>
              </div>
            ))}
          </div>

          {doc.status !== "Approved" && (
            <div className="document-decision-panel">
              <span>REVIEW DECISION</span>
              <p>
                Complete your review of this document before selecting an
                action.
              </p>
              <div>
                <button className="btn danger" onClick={openRevision}>
                  Request Revision
                </button>
                <button className="btn success" onClick={openApprove}>
                  Approve Document
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default DocumentDetails;
