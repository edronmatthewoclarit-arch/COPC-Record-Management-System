import { useState } from "react";
import {
  initialRequirements,
  recordsByRequirement,
} from "../api/CopcViewAPI/requirement.api";
import Badge from "../components/ui/Badge";
import PageHead from "../components/ui/PageHead";
import UiIcon from "../components/ui/UiIcon";
import DocumentDetails from "./DocumentDetails";

export function RequirementDetails({
  index,
  setPage,
  openRequest,
  openAddRecord,
  openRecord,
  addedRecords,
  addedRequirements = [],
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
      status: "Requested",
      updated: "—",
      version: "—",
    })),
  ];

  const records = allRecords.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) &&
      (recordStatus === "All" || r.status === recordStatus)
  );

  const approved = allRecords.filter((r) => r.status === "Approved").length;
  const pending = allRecords.filter(
    (r) => r.status === "Pending" || r.status === "For Review"
  ).length;
  const revision = allRecords.filter((r) => r.status === "For Revision").length;
  const requested = allRecords.filter((r) => r.status === "Requested").length;

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
          [String(requested), "Requested", "blue"],
        ].map((x) => (
          <div key={x[1]}>
            <strong>{x[0]}</strong>
            <span>{x[1]}</span>
          </div>
        ))}
      </div>

      <section className="card table-card required-records">
        <div className="requirements-table-toolbar">
          <div className="requirements-toolbar-title">
            <b>Required Records</b>
            <span>
              Showing {records.length} of {allRecords.length} records
            </span>
          </div>

          <div className="requirements-actions">
            <div className="search">
              <UiIcon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search records"
              />
            </div>

            <div className="filter-wrap">
              <button
                className={`btn filter-button ${recordStatus !== "All" ? "has-filters" : ""}`}
                onClick={() => {
                  setDraftRecordStatus(recordStatus);
                  setRecordFilterOpen(!recordFilterOpen);
                }}
              >
                <UiIcon name="filter" />
                Filter
                {recordStatus !== "All" && <em>0</em>}
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
                    <span>STATUS</span>
                    {[
                      "All",
                      "Approved",
                      "For Review",
                      "Submitted",
                      "Pending",
                      "For Revision",
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

            <button className="btn secondary" onClick={openAddRecord}>
              ＋ Add Required Record
            </button>
            <button className="btn primary" onClick={openRequest}>
              <UiIcon name="send" />
              Send Request
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
              <th>Assigned To</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.name}
                className="clickable-row"
                onClick={() => (r.file ? openRecord(r) : openRequest())}
              >
                <td>{i + 1}</td>
                <td>
                  <b>{r.name}</b>
                  <small>{r.file || "No document submitted"}</small>
                </td>
                <td>
                  {r.assigned === "—" ? "—" : `${r.assigned} — ${r.role}`}
                </td>
                <td>
                  <Badge status={r.status} />
                </td>
                <td>{r.updated}</td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={5}>
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
    />
  );
}

export default RequirementDetails;
