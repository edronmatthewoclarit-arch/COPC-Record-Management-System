import UiIcon from "./UiIcon";

export function Stat({ n, label, tone }) {
  const iconName =
    tone === "green"
      ? "check"
      : tone === "amber"
        ? "clock"
        : tone === "red"
          ? "revision"
          : "checklist";

  return (
    <div className="stat">
      <i className={tone}>
        <UiIcon name={iconName} />
      </i>
      <div>
        <strong>{n}</strong>
        <span>{label}</span>
      </div>
      <small>View details →</small>
    </div>
  );
}

export default Stat;
