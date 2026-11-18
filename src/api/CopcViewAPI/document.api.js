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

export const initialDocuments = [];

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