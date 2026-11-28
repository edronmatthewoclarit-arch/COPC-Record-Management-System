import UiIcon from "../ui/UiIcon";

const coordinatorNav = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "requirements", label: "Requirements", icon: "checklist" },
  { id: "documents", label: "Documents", icon: "file" },
  { id: "representatives", label: "Representative", icon: "users" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const programHeadNav = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "requests", label: "Request", icon: "send" },
  { id: "documents", label: "Program Documents", icon: "file" },
  { id: "facultyRecords", label: "Faculty", icon: "users" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const deanNav = [
  { id: "documents", label: "Program Documents", icon: "file" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const facultyNav = [
  { id: "documents", label: "Documents", icon: "file" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const officeRepNav = [
  { id: "documents", label: "Documents", icon: "file" },
  { id: "settings", label: "Settings", icon: "settings" },
];

export function Sidebar({ page, setPage, role }) {
  const visibleNav =
    role === "COPC Coordinator"
      ? coordinatorNav
      : role === "Program Head"
        ? programHeadNav
        : role === "Dean"
          ? deanNav
          : role === "Faculty"
            ? facultyNav
            : role === "Office Representative"
              ? officeRepNav
              : programHeadNav;

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
            (n.id === "documents" && page === "documentDetail") ||
            (n.id === "requests" && page === "requestDetail");

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
