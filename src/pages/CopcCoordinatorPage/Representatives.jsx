import { useState } from "react";
import { initialRepresentatives } from "../../api/CopcViewAPI/representative.api";
import PageHead from "../../components/ui/PageHead";
import UiIcon from "../../components/ui/UiIcon";

export function Representatives({
  addedRepresentatives = [],
  openAddRepresentative,
}) {
  const [query, setQuery] = useState("");

  const allRepresentatives = [
    ...initialRepresentatives,
    ...addedRepresentatives,
  ];

  const filtered = allRepresentatives.filter((rep) =>
    `${rep.name} ${rep.office} ${rep.program} ${rep.email} ${rep.contact} ${rep.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <PageHead title="Representative Records" />

      <section className="card table-card representative-records-card">
        <div className="representative-toolbar">
          <div className="search representative-search">
            <UiIcon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search representative records"
              placeholder="Search representative records..."
            />
          </div>

          <button
            className="btn primary add-representative-btn"
            onClick={openAddRepresentative}
          >
            Add Representative
          </button>
        </div>

        <table className="representative-table">
          <thead>
            <tr>
              <th>Representative Name</th>
              <th>Office Name</th>
              <th>Program</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((rep, index) => {
              const f = rep.firstName?.trim() || "";
              const m = rep.middleName?.trim() || "";
              const l = rep.lastName?.trim() || "";
              let displayName = rep.name;
              if (f && l) {
                if (m) {
                  const initial = m.replace(/\.+$/, "")[0]?.toUpperCase();
                  displayName = `${f} ${initial ? `${initial}. ` : ""}${l}`;
                } else {
                  displayName = `${f} ${l}`;
                }
              }

              return (
                <tr key={`${rep.email || rep.name}-${index}`}>
                  <td>{displayName || rep.name}</td>
                  <td>{rep.office}</td>
                  <td>{rep.program}</td>
                  <td>{rep.email}</td>
                  <td>{rep.contact}</td>
                  <td>
                    <span
                      className={`rep-status ${(rep.status || "Active").toLowerCase()}`}
                    >
                      {rep.status || "Active"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default Representatives;
