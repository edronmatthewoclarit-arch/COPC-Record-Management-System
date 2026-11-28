export function Badge({ status }) {
  const normalized = (status || "").toLowerCase().replace(/\s+/g, "-");
  return (
    <span className={`badge ${normalized}`}>
      {status}
    </span>
  );
}

export default Badge;
