// Uncomment when Express backend is running:
// import axios from "axios";
//
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
//
// const getAuthHeaders = (token) => ({
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   },
// });

export const initialDocuments = [
  {
    id: 1,
    name: "Faculty_Profile_BSIT_2026.pdf",
    size: "1.6 mb",
    requirement: "Faculty Information",
    record: "Faculty Profile",
    uploader: "Maria Santos",
    role: "Faculty",
    date: "October 20, 2026",
    time: "9:50am",
    version: "v2",
    status: "Approved",
    program: "Information Technology",
  },
  {
    id: 2,
    name: "Faculty_Information_BSIT_2026.pdf",
    size: "1.6 mb",
    requirement: "Faculty Information",
    record: "Faculty Profile",
    uploader: "Maria Santos",
    role: "Faculty",
    date: "October 20, 2026",
    time: "9:50am",
    version: "v2",
    status: "For Review",
    program: "Information Technology",
  },
  {
    id: 3,
    name: "Teaching Loads",
    size: "—",
    requirement: "Teaching Loads",
    record: "Teaching Loads",
    uploader: "Faculty Submitter",
    role: "Faculty",
    date: "October 24, 2026",
    time: "10:30am",
    version: "v1",
    status: "Not Submitted",
    isRequested: true,
    instructions: "Please submit official faculty teaching loads and class schedules for 1st Semester.",
    program: "Information Technology",
  },
  {
    id: 4,
    name: "Curriculum_Mapping_BSIT.pdf",
    size: "2.4 mb",
    requirement: "Curriculum Information",
    record: "Curriculum Map",
    uploader: "Juan Dela Cruz",
    role: "Faculty",
    date: "October 18, 2026",
    time: "2:15pm",
    version: "v2",
    status: "Submitted",
    program: "Information Technology",
  },
  {
    id: 5,
    name: "Physical Plant Inventory",
    size: "—",
    requirement: "Laboratories & Facilities",
    record: "Physical Plant Inventory",
    uploader: "Office Representative",
    role: "Office Representative",
    date: "October 26, 2026",
    time: "1:45pm",
    version: "v1",
    status: "Not Submitted",
    isRequested: true,
    instructions: "Please attach certified IT laboratory inventory and physical inspection checklist.",
    program: "Information Technology",
  },
  {
    id: 6,
    name: "ITE183_Syllabus_v2.pdf",
    size: "1.8 mb",
    requirement: "Syllabi",
    record: "Course Syllabus - Web Systems",
    uploader: "Ana Reyes",
    role: "Faculty",
    date: "October 22, 2026",
    time: "11:20am",
    version: "v1",
    status: "For Revision",
    remark: "Please align Course Learning Outcomes with CMO 25 Series 2024.",
    program: "Information Technology",
  },
  {
    id: 7,
    name: "Laboratory_Equipment_Specs.pdf",
    size: "3.2 mb",
    requirement: "Laboratories & Facilities",
    record: "Laboratory Specifications",
    uploader: "Engr. Rizal Lim",
    role: "Office Representative",
    date: "October 19, 2026",
    time: "3:30pm",
    version: "v1",
    status: "Submitted",
    program: "Information Technology",
  },
];

export const initialRequests = [];

export const initialNotices = [];

/**
 * Fetch all submitted COPC documents
 * @param {string} _token - JWT Bearer token
 */
export const getAllDocuments = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/documents`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialDocuments;
  } catch (error) {
    console.error("Error fetching all documents:", error);
    throw error;
  }
};

/**
 * Upload a new document (supports multipart/form-data for PDFs, DOCX, images)
 * @param {FormData} formData - Multipart form data containing the file and metadata
 * @param {string} _token - JWT Bearer token
 */
export const uploadDocument = async (formData, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.post(`${BASE_URL}/documents/upload`, formData, {
    //   headers: {
    //     Authorization: `Bearer ${_token}`,
    //     "Content-Type": "multipart/form-data",
    //   },
    // });
    // return response.data;
    return formData;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

/**
 * Update the review status of a document (e.g., Approved, For Revision, For Review)
 * @param {string|number} id - Document ID
 * @param {Object} statusData - Status payload (e.g., { status: "Approved", remarks: "..." })
 * @param {string} _token - JWT Bearer token
 */
export const updateDocumentStatus = async (id, statusData, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.patch(
    //   `${BASE_URL}/documents/${id}/status`,
    //   statusData,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return { id, ...statusData };
  } catch (error) {
    console.error(`Error updating status for document ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllDocuments,
  uploadDocument,
  updateDocumentStatus,
};