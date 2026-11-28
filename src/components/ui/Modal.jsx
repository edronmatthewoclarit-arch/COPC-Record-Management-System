import { createPortal } from "react-dom";
import UiIcon from "./UiIcon";

export function Modal({
  title,
  subtitle,
  eyebrow,
  icon,
  children,
  onClose,
  action,
  actionLabel,
  className = "",
  footer,
  showClose = true,
}) {
  const isLogout = title === "Log Out?";
  const isRequest = title === "Send Document Request";
  const modalClass = [
    isLogout ? "logout-modal" : "",
    isRequest ? "request-modal" : "",
    title === "Send Document Request?" ? "request-confirm-modal" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const modalNode = (
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
                <span className="eyebrow">{eyebrow || "Confirmation required"}</span>
                <h2>{title}</h2>
                <small>
                  {subtitle || "Request the appropriate personnel to submit this requirement."}
                </small>
              </div>
            </div>
          ) : icon || subtitle || eyebrow ? (
            <div className="request-modal-title">
              {icon && (
                <i>
                  <UiIcon name={icon} />
                </i>
              )}
              <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h2>{title}</h2>
                {subtitle && <small>{subtitle}</small>}
              </div>
            </div>
          ) : (
            <div>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <h2>{title}</h2>
            </div>
          )}
          {showClose && (
            <button className="icon-btn" onClick={onClose} aria-label="Close modal">
              ×
            </button>
          )}
        </div>

        <div className="modal-body">{children}</div>

        {footer !== undefined ? (
          footer
        ) : (
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
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalNode, document.body);
  }

  return modalNode;
}

export default Modal;
