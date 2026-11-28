import Seal from "../ui/Seal";
import UiIcon from "../ui/UiIcon";

export function Header({ onLogout, role }) {
  const user = { name: "Account", initials: "U" };

  return (
    <header>
      <div className="university-brand">
        <Seal dark />
      </div>

      <div className="header-title">
        <div>
          <b>COPC Record Management System</b>
          <span>Bachelor of Science in Information Technology</span>
        </div>
      </div>

      <div className="header-user">
        <div className="profile-trigger">
          <div className="avatar">{user.initials}</div>
          <div>
            <b>{role}</b>
            <span>{user.name}</span>
          </div>
        </div>

        <button className="logout" aria-label="Log out" onClick={onLogout}>
          <UiIcon name="logout" />
        </button>
      </div>
    </header>
  );
}

export default Header;
