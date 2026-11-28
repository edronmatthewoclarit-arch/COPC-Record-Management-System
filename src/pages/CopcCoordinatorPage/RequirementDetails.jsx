import { useState } from "react";
import {
  initialRequirements,
  recordsByRequirement,
} from "../../api/CopcViewAPI/requirement.api";
import Badge from "../../components/ui/Badge";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";
import DocumentDetails from "../SharedPage/DocumentDetails";

export function RequirementDetails({
  index,
  setPage,
  openRequest,
  openAddRecord,
  openRecord,
  addedRecords = [],
  addedRequirements = [],
  recordOverrides = {},
}) {
  const allRequirements = [...initialRequirements, ...addedRequirements];
  const requirement = allRequirements[index] ||
    allRequirements[0] || { name: "Requirement" };

  const [query, setQuery] = useState("");
  const [recordFilterOpen, setRecordFilterOpen] = useState(false);
  const [recordStatus, setRecordStatus] = useState("All");
  const [draftRecordStatus, setDraftRecordStatus] = useState("All");

  const baseRecords = recordsByRequirement[requirement.name] || [];
  const allRecords = [
    ...baseRecords,
    ...addedRecords.map((r) => ({
      name: r.name,
      file: null,
      size: "",
      assigned: r.responsible || "—",
      role: "",
      status: r.status || "Pending",
      updated: r.updated || "—",
      version: "—",
    })),
  ].map((rec) => {
    if (recordOverrides[rec.name]) {
      return { ...rec, ...recordOverrides[rec.name] };
    }
    return rec;
  });

  const records = allRecords.filter((r) => {
    const matchesQuery = r.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (recordStatus === "All") return true;

    const isSubmitted = Boolean(
      r.file ||
      r.status === "Submitted" ||
      r.status === "Approved" ||
      r.status === "For Review" ||
      r.status === "For Revision"
    );

    if (recordStatus === "Submitted") return isSubmitted;
    if (recordStatus === "Not Submitted") return !isSubmitted;

    return r.status === recordStatus;
  });

  const approved = allRecords.filter((r) => r.status === "Approved").length;
  const pending = allRecords.filter(
    (r) => r.status === "Pending" || r.status === "For Review"
  ).length;
  const revision = allRecords.filter((r) => r.status === "For Revision").length;
  const notSubmitted = allRecords.filter(
    (r) =>
      !r.file &&
      (r.status === "Not Submitted" || r.status === "Requested" || !r.status)
  ).length;

  return (
    <>
      <button className="back" onClick={() => setPage("requirements")}>
        ← Back to Program Requirements
      </button>

      <PageHead
        title={requirement.name}
        subtitle="Faculty qualifications, assignments, and supporting documentation required for COPC compliance."
      />

      <div className="record-summary">
        {[
          [String(records.length), "Total Records", "navy"],
          [String(approved), "Approved", "green"],
          [String(pending), "Pending", "amber"],
          [String(revision), "For Revision", "red"],
          [String(notSubmitted), "Not Submitted", "blue"],
        ].map((x) => (
          <div key={x[1]}>
            <strong>{x[0]}</strong>
            <span>{x[1]}</span>
          </div>
        ))}
      </div>

      <section className="card table-card required-records">
        <div className="required-records-card-head">
          <b>Required Records</b>
        </div>

        <div className="representative-toolbar">
          <div className="search representative-search" style={{ maxWidth: "360px" }}>
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search records"
              placeholder="Search Records"
            />
          </div>

          <div className="requirements-actions">
            <div className="filter-wrap">
              <button
                type="button"
                className={`btn filter-button ${recordStatus !== "All" ? "has-filters" : ""}`}
                onClick={() => {
                  setDraftRecordStatus(recordStatus);
                  setRecordFilterOpen(!recordFilterOpen);
                }}
              >
                <UiIcon name="filter" />
                Filter
                {recordStatus !== "All" && <em>{recordStatus}</em>}
              </button>

              {recordFilterOpen && (
                <div className="filter-popover record-filter-popover">
                  <div className="filter-popover-head">
                    <b>Filter Required Records</b>
                    <button onClick={() => setRecordFilterOpen(false)}>
                      ×
                    </button>
                  </div>

                  <div className="record-status-options">
                    <span className="filter-group-heading">REVIEW STATUS</span>
                    {[
                      "All",
                      "Approved",
                      "For Review",
                      "For Revision",
                      "Pending",
                      "Requested",
                    ].map((x) => (
                      <label key={x}>
                        <input
                          type="radio"
                          name="record-status"
                          checked={draftRecordStatus === x}
                          onChange={() => setDraftRecordStatus(x)}
                        />
                        {x}
                      </label>
                    ))}
                    <span className="filter-group-heading" style={{ marginTop: "10px" }}>
                      SUBMISSION
                    </span>
                    {["Submitted", "Not Submitted"].map((x) => (
                      <label key={x}>
                        <input
                          type="radio"
                          name="record-status"
                          checked={draftRecordStatus === x}
                          onChange={() => setDraftRecordStatus(x)}
                        />
                        {x}
                      </label>
                    ))}
                  </div>

                  <div className="filter-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setDraftRecordStatus("All")}
                    >
                      Clear Filters
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => {
                        setRecordStatus(draftRecordStatus);
                        setRecordFilterOpen(false);
                      }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn primary send-request-main"
              style={{ minWidth: "175px" }}
              onClick={openAddRecord}
            >
              Add Required Record
            </button>
          </div>
        </div>

        {recordStatus !== "All" && (
          <div className="active-filters">
            <span>Active filter:</span>
            <button
              onClick={() => {
                setRecordStatus("All");
                setDraftRecordStatus("All");
              }}
            >
              {recordStatus} ×
            </button>
            <button
              className="clear-all"
              onClick={() => {
                setRecordStatus("All");
                setDraftRecordStatus("All");
              }}
            >
              Clear all
            </button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Required Record</th>
              <th>Assigned to</th>
              <th>Status</th>
              <th>Submission</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.name || i}
                className="clickable-row"
                onClick={() => (r.file ? openRecord(r) : openRequest(r))}
              >
                <td>{i + 1}</td>
                <td>
                  <b>{r.name}</b>
                </td>
                <td>
                  {r.assigned && r.assigned !== "—"
                    ? r.role
                      ? `${r.assigned} — ${r.role}`
                      : r.assigned
                    : "—"}
                </td>
                <td>
                  {r.status &&
                  r.status !== "Not Submitted" &&
                  r.status !== "Submitted" ? (
                    <Badge status={r.status} />
                  ) : (
                    <span className="record-status-empty">—</span>
                  )}
                </td>
                <td>
                  <div className="record-submission-col">
                    <Badge
                      status={
                        r.file ||
                        r.status === "Approved" ||
                        r.status === "For Review" ||
                        r.status === "For Revision" ||
                        r.status === "Submitted"
                          ? "Submitted"
                          : "Not Submitted"
                      }
                    />
                    {r.file && (
                      <span className="record-submission-file" title={r.file}>
                        <UiIcon name="file" />
                        <span>{r.file}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td>{r.updated || "—"}</td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="requirements-empty">
                    <UiIcon name="filter" />
                    <b>No required records match your filters.</b>
                    <p>Try another status or clear the current search.</p>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setRecordStatus("All");
                        setDraftRecordStatus("All");
                        setQuery("");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

export function RecordDetails({
  setPage,
  openRevision,
  openApprove,
  record,
  parentRequirement,
  onUpdateRecord,
}) {
  return (
    <DocumentDetails
      index={0}
      setPage={setPage}
      openRevision={openRevision}
      openApprove={openApprove}
      source="requirements"
      record={record}
      parentRequirement={parentRequirement}
      onUpdateDocumentStatus={onUpdateRecord}
    />
  );
}

export default RequirementDetails;
