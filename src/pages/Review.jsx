import PageHead from "../components/ui/PageHead";

export function Review({ setPage }) {
  return (
    <>
      <button className="back" onClick={() => setPage("documents")}>
        ← Back to documents
      </button>
      <PageHead
        title="Review Document"
        subtitle="Select a submitted document to begin its review."
      />
      <section className="card">
        <p className="empty-state">No document is available for review.</p>
      </section>
    </>
  );
}

export default Review;
