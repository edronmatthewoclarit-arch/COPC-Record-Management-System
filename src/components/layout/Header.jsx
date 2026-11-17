import Seal from "../ui/Seal";
import UiIcon from "../ui/UiIcon";

export function Header({
  notify,
  onNotify,
  onLogout,
  role,
  onSettings,
  notices,
  markAll,
  openNotice,
  viewAll,
}) {
  const user = { name: "Account", initials: "U" };
  const unreadCount = notices.filter((n) => !n.read).length;

  return (
    <header>
      <div className="university-brand">
        <Seal dark />
        <div>
          <b>Mindanao State University</b>
          <span>at Naawan</span>
        </div>
      </div>

      <div className="header-title">
        <div>
          <b>COPC Record Management System</b>
          <span>Bachelor of Science in Information Technology</span>
        </div>
      </div>

      <div className="header-user">
        <button className="bell" aria-label="Notifications" onClick={onNotify}>
          <UiIcon name="bell" />
          {unreadCount > 0 && <i>{unreadCount}</i>}
        </button>

        <button
          className="settings-trigger"
          aria-label="Settings"
          title="Settings"
          onClick={onSettings}
        >
          <UiIcon name="settings" />
        </button>

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

      {notify && (
        <div className="notifications">
          <div className="notify-head">
            <b>Notifications</b>
            <button className="link" onClick={markAll}>
              Mark all as read
            </button>
          </div>
          {notices.slice(0, 3).map((n) => (
            <button
              key={n.id}
              className={`notification ${n.read ? "read" : "unread"}`}
              onClick={() => openNotice(n)}
            >
              <i />
              <span className="notice-type-icon">
                <UiIcon name={n.icon} />
              </span>
              <div>
                <b>{n.type}</b>
                <p>{n.description}</p>
                <small>{n.meta}</small>
                <span>{n.relative}</span>
              </div>
            </button>
          ))}
          <button className="view-all" onClick={viewAll}>
            View all notifications
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
