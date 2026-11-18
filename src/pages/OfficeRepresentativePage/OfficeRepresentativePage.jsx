import RoleDocumentPage from "../SharedPage/RoleDocumentPage";

export function OfficeRepresentativePage({
  documents,
  openDocument,
  openSendFile,
}) {
  return (
    <RoleDocumentPage
      roleTitle="Office Representative - Sent Documents"
      roleSubtitle="Laboratory inventories, safety certificates, facility floor plans, and administrative files sent to the COPC Coordinator."
      targetRole="Office Representative"
      documents={documents}
      openDocument={openDocument}
      openSendFile={openSendFile}
    />
  );
}

export default OfficeRepresentativePage;
