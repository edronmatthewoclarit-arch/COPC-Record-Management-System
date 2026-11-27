import { useState } from "react";
import {
  categoryOptions,
  initialRequirements,
  recordsByRequirement,
  requirementDescriptions,
  roleOptions,
} from "../../api/CopcViewAPI/requirement.api";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function Requirements({
  openRequirement,
  openAdd,
  addedRequirements,
}) {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState([]);
  const [draft, setDraft] = useState([]);

  const categories = [];
  const revisers = [];
  const reviserRoles = [];

  const enriched = [
    ...initialRequirements.map((r, i) => {
      const records = recordsByRequirement[r.name] || [];
      const calculatedStatus = records.some((x) => x.status === "For Revision")
        ? "For Revision"
        : records.some((x) => x.status !== "Approved")
          ? "Pending"
          : "Approved";
      return {
        ...r,
        status: calculatedStatus,
        index: i,
        category: categories[i],
        reviser: revisers[i],
        reviserRole: reviserRoles[i],
      };
    }),
    ...addedRequirements.map((r, i) => ({
      ...r,
      index: initialRequirements.length + i,
      status: "Requested",
      uploader: "—",
      role: r.responsible,
      updated: "—",
      reviser: "—",
      reviserRole: "",
    })),
  ];

  const toggle = (value) =>
    setDraft((items) =>
      items.includes(value)
        ? items.filter((x) => x !== value)
        : [...items, value]
    );

  const filtered = enriched.filter((r) => {
    const haystack =
      `${r.name} ${r.uploader} ${r.reviser} ${r.category}`.toLowerCase();
    const selectedCategories = filters.filter((x) =>
      categoryOptions.includes(x)
    );
    const roles = filters.filter((x) => roleOptions.includes(x));
    return (
      haystack.includes(query.toLowerCase()) &&
      (!selectedCategories.length || selectedCategories.includes(r.category)) &&
      (!roles.length || roles.includes(r.role))
    );
  });

  const clearFilters = () => {
    setFilters([]);
    setDraft([]);
  };

  const recordCounts = initialRequirements.map(
    (r) => (recordsByRequirement[r.name] || []).length
  );
  const progress = initialRequirements.map((r) => {
    const rows = recordsByRequirement[r.name] || [];
    return rows.length
      ? Math.round(
          (rows.filter((x) => x.status === "Approved").length / rows.length) *
            100
        )
      : 0;
  });

  const totalCount = enriched.length;
  const approvedCount = enriched.filter((r) => r.status === "Approved").length;
  const pendingCount = enriched.filter(
    (r) => r.status === "Pending" || r.status === "Requested"
  ).length;
  const revisionCount = enriched.filter(
    (r) => r.status === "For Revision"
  ).length;
  const completionPercentage = totalCount
    ? Math.round((approvedCount / totalCount) * 100)
    : 0;

  return (
    <>
      <PageHead
        title="Program Requirements"
        subtitle="Bachelor of Science in Information Technology"
      />

      <section className="card requirement-summary">
        <div
          className="mini-ring"
          style={{
            background: `conic-gradient(var(--blue, #0b4c91) 0 ${completionPercentage}%, #e6edf4 ${completionPercentage}%)`,
          }}
        >
          <div>
            <strong>{completionPercentage}%</strong>
            <span>Completed</span>
          </div>
        </div>
        {[
          [String(approvedCount), "Approved", "green", "check"],
          [String(pendingCount), "Pending", "amber", "clock"],
          [String(revisionCount), "For Revision", "red", "revision"],
        ].map((x) => (
          <div className="requirement-metric" key={x[1]}>
            <i className={x[2]}>
              <UiIcon name={x[3]} />
            </i>
            <strong>{x[0]}</strong>
            <span>{x[1]}</span>
          </div>
        ))}
      </section>

      <section className="card table-card program-overview-table">
        <div className="requirements-table-toolbar">
          <div className="requirements-toolbar-title">
            <b>Program Requirements</b>
            <span>
              Showing {filtered.length} of {initialRequirements.length}{" "}
              requirements
            </span>
          </div>

          <div className="requirements-actions">
            <div className="search">
              <UiIcon name="search" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search requirements"
              />
            </div>

            <div className="filter-wrap">
              <button
                className={`btn filter-button ${filters.length ? "has-filters" : ""}`}
                onClick={() => {
                  setDraft(filters);
                  setFilterOpen(!filterOpen);
                }}
              >
                <UiIcon name="filter" />
                Filter
                {filters.length > 0 && <em>{filters.length}</em>}
              </button>

              {filterOpen && (
                <div className="filter-popover">
                  <div className="filter-popover-head">
                    <b>Filter Requirements</b>
                    <button onClick={() => setFilterOpen(false)}>×</button>
                  </div>

                  <div className="filter-section">
                    <span>CATEGORY</span>
                    {categoryOptions.map((x) => (
                      <label key={x}>
                        <input
                          type="checkbox"
                          checked={draft.includes(x)}
                          onChange={() => toggle(x)}
                        />
                        {x}
                      </label>
                    ))}
                  </div>

                  <div className="filter-section">
                    <span>UPLOADER ROLE</span>
                    {roleOptions.map((x) => (
                      <label key={x}>
                        <input
                          type="checkbox"
                          checked={draft.includes(x)}
                          onChange={() => toggle(x)}
                        />
                        {x}
                      </label>
                    ))}
                  </div>

                  <div className="filter-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setDraft([])}
                    >
                      Clear Filters
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => {
                        setFilters(draft);
                        setFilterOpen(false);
                      }}
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="btn primary send-request-main" onClick={openAdd}>
              <UiIcon name="checklist" />
              Add Requirement
            </button>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="active-filters">
            <span>Active filters:</span>
            {filters.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setFilters((items) => items.filter((v) => v !== x));
                  setDraft((items) => items.filter((v) => v !== x));
                }}
              >
                {x} ×
              </button>
            ))}
            <button className="clear-all" onClick={clearFilters}>
              Clear all
            </button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>COPC Requirement</th>
              <th>Description</th>
              <th>Records</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.name}
                className="clickable-row"
                onClick={() => openRequirement(r.index)}
              >
                <td>{r.index + 1}</td>
                <td>
                  <b>{r.name}</b>
                  <small>{r.category}</small>
                </td>
                <td>
                  {"description" in r
                    ? r.description
                    : requirementDescriptions[r.index]}
                </td>
                <td>
                  <b>{recordCounts[r.index] ?? 0}</b>
                </td>
                <td>
                  <div className="table-progress">
                    <span>
                      <i style={{ width: `${progress[r.index] ?? 0}%` }} />
                    </span>
                    <b>{progress[r.index] ?? 0}%</b>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="requirements-empty">
                    <UiIcon name="filter" />
                    <b>No requirements match your current filters.</b>
                    <p>Adjust your search or clear the active filters.</p>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        clearFilters();
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

export default Requirements;
