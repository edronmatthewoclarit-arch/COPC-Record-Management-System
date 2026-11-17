import UiIcon from "../ui/UiIcon";

const coordinatorNav = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "requirements", label: "Requirements", icon: "checklist" },
  { id: "documents", label: "Documents", icon: "file" },
  { id: "representatives", label: "Representative", icon: "users" },
];

const userNav = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "requests", label: "My Requests", icon: "send" },
  { id: "documents", label: "My Documents", icon: "file" },
];

export function Sidebar({ page, setPage, role }) {
  const visibleNav = role === "COPC Coordinator" ? coordinatorNav : userNav;

  return (
    <aside>
      <div className="program-card">
        <span>Assigned program</span>
        <b>BS Information Technology</b>
        <small>Academic Year 2026–2027</small>
      </div>

      <nav>
        {visibleNav.map((n) => {
          const isActive =
            page === n.id ||
            (n.id === "requirements" &&
              (page === "requirementDetail" || page === "recordDetail")) ||
            (n.id === "documents" && page === "documentDetail");

          return (
            <button
              key={n.id}
              className={isActive ? "active" : ""}
              onClick={() => setPage(n.id)}
            >
              <i>
                <UiIcon name={n.icon} />
              </i>
              {n.label}
              {n.id === "requests" && <em>0</em>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-help">
        <b>Need assistance?</b>
        <span>Contact the Records Office</span>
        <button>View help guide</button>
      </div>
    </aside>
  );
}

export default Sidebar;
