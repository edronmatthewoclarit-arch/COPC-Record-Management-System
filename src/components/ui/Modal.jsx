import UiIcon from "./UiIcon";

export function Modal({ title, children, onClose, action, actionLabel }) {
  const isLogout = title === "Log Out?";
  const isRequest = title === "Send Document Request";
  const modalClass = isLogout
    ? "logout-modal"
    : isRequest
      ? "request-modal"
      : title === "Send Document Request?"
        ? "request-confirm-modal"
        : "";

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className={`modal ${modalClass}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          {isLogout ? (
            <div className="logout-modal-title">
              <i>
                <UiIcon name="logout" />
              </i>
              <div>
                <h2>{title}</h2>
                <span>End your current session</span>
              </div>
            </div>
          ) : isRequest ? (
            <div className="request-modal-title">
              <i>
                <UiIcon name="send" />
              </i>
              <div>
                <span className="eyebrow">Confirmation required</span>
                <h2>{title}</h2>
                <small>
                  Request the appropriate personnel to submit this requirement.
                </small>
              </div>
            </div>
          ) : (
            <div>
              <span className="eyebrow">Confirmation required</span>
              <h2>{title}</h2>
            </div>
          )}
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${isLogout ? "logout-confirm" : "primary"}`}
            onClick={action}
          >
            {isLogout ? (
              <UiIcon name="logout" />
            ) : isRequest ? (
              <UiIcon name="send" />
            ) : null}
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
