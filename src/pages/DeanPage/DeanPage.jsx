import RoleDocumentPage from "../SharedPage/RoleDocumentPage";

export function DeanPage({ documents, openDocument, openSendFile }) {
  return (
    <RoleDocumentPage
      roleTitle="Dean - Sent Documents"
      roleSubtitle="Official college curriculum documents, program accreditations, and endorsements sent to the COPC Coordinator."
      targetRole="Dean"
      documents={documents}
      openDocument={openDocument}
      openSendFile={openSendFile}
    />
  );
}

export default DeanPage;
