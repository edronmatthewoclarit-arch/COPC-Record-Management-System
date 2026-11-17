// BRAND ASSET: place the official seal at public/assets/branding/msu-naawan-seal.svg.
export function Seal({ dark = false }) {
  return (
    <div
      className={`seal ${dark ? "seal-dark" : ""}`}
      aria-label="Mindanao State University at Naawan"
    >
      <span>MSU</span>
      <small>NAAWAN</small>
    </div>
  );
}

export default Seal;
