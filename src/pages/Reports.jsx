import PageHead from "../components/ui/PageHead";
import Stat from "../components/ui/Stat";
import UiIcon from "../components/ui/UiIcon";

export function Reports() {
  const barChartItems = [];

  return (
    <>
      <PageHead
        title="Reports"
        subtitle="Document and requirement progress · Bachelor of Science in Information Technology"
        action={
          <div>
            <button className="btn secondary icon-button">
              <UiIcon name="download" />
              Export report
            </button>{" "}
            <button className="btn primary">Generate report</button>
          </div>
        }
      />

      <div className="stats">
        <Stat n="0" label="Total requirements" tone="navy" />
        <Stat n="0" label="Approved" tone="green" />
        <Stat n="0" label="Submitted" tone="blue" />
        <Stat n="0" label="For revision" tone="red" />
      </div>

      <div className="reports-grid">
        <section className="card">
          <div className="section-head">
            <h2>COPC requirement progress</h2>
            <select>
              <option>Academic Year 2026–2027</option>
            </select>
          </div>

          <div className="bar-chart">
            {barChartItems.map((x) => (
              <div key={x[0]}>
                <span>{x[0]}</span>
                <div>
                  <i style={{ width: `${x[1]}%` }} />
                </div>
                <b>{x[1]}%</b>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Status distribution</h2>
          <div className="donut">
            <div>
              <strong>0</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="mini-legend">
            <span>
              <i className="green" /> Approved 0
            </span>
            <span>
              <i className="amber" /> Pending 0
            </span>
            <span>
              <i className="red" /> For Revision 0
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

export default Reports;
