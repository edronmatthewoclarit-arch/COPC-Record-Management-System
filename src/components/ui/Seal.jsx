export function Seal({ dark = false }) {
  return (
    <div
      className={`seal ${dark ? "seal-dark" : ""}`}
      aria-label="Mindanao State University at Naawan"
    >
      <img
        src="/assets/branding/msu-naawan-seal.png"
        alt="Mindanao State University at Naawan"
      />
    </div>
  );
}

export default Seal;
