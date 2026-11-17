import { useState } from "react";
import PageHead from "../components/ui/PageHead";
import UiIcon from "../components/ui/UiIcon";

export function NotificationsPage({ notices, markAll, openNotice }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const list = notices.filter(
    (n) =>
      `${n.description} ${n.meta}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "All" ||
        (filter === "Unread" && !n.read) ||
        (filter === "Submissions" && n.type.includes("SUBMISSION")) ||
        (filter === "Document Requests" && n.type.includes("REQUEST")) ||
        (filter === "Revisions" && n.type.includes("REVISION")) ||
        (filter === "Approvals" && n.type.includes("APPROVED")))
  );

  return (
    <>
      <PageHead
        title="Notifications"
        subtitle="Stay updated on document submissions, requests, revisions, and approvals for Bachelor of Science in Information Technology."
        action={
          <button className="btn secondary" onClick={markAll}>
            Mark all as read
          </button>
        }
      />

      <section className="card notifications-page">
        <div className="notification-tools">
          <div className="search">
            ⌕{" "}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search notifications"
            />
          </div>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Unread</option>
            <option>Submissions</option>
            <option>Document Requests</option>
            <option>Revisions</option>
            <option>Approvals</option>
          </select>
        </div>

        <div className="notification-list">
          {list.map((n) => (
            <article
              key={n.id}
              className={`notice-row ${n.read ? "read" : "unread"}`}
            >
              <i className="unread-dot" />
              <span className={`notice-page-icon ${n.icon}`}>
                <UiIcon name={n.icon} />
              </span>
              <div>
                <b>{n.type}</b>
                <h3>{n.description}</h3>
                <p>{n.meta}</p>
                <time>{n.date}</time>
              </div>
              <button className="btn secondary" onClick={() => openNotice(n)}>
                {n.target === "requestDetail"
                  ? "View Request"
                  : n.type.includes("REVISION")
                    ? "View Revision"
                    : "View Document"}
              </button>
            </article>
          ))}
        </div>

        {list.length === 0 && (
          <div className="empty">
            <b>No notifications found</b>
            <p>Try changing your search or filter.</p>
          </div>
        )}
      </section>
    </>
  );
}

export default NotificationsPage;
