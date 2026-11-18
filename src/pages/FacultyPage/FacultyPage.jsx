import RoleDocumentPage from "../SharedPage/RoleDocumentPage";

export function FacultyPage({ documents, openDocument, openSendFile }) {
  return (
    <RoleDocumentPage
      roleTitle="Faculty - Sent Documents"
      roleSubtitle="Course syllabi, instructional modules, and faculty qualification records sent to the COPC Coordinator."
      targetRole="Faculty"
      documents={documents}
      openDocument={openDocument}
      openSendFile={openSendFile}
    />
  );
}

export default FacultyPage;
