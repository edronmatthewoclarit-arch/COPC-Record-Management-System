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

export const initialProgramHeadDocuments = [];

/**
 * Fetch all documents uploaded by the Program Head
 * @param {string} _token - JWT Bearer token
 */
export const getMyDocuments = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/program-head/documents`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialProgramHeadDocuments;
  } catch (error) {
    console.error("Error fetching Program Head documents:", error);
    throw error;
  }
};

/**
 * Upload a new document as Program Head
 * @param {FormData} formData - Multipart form data containing the file and metadata
 * @param {string} _token - JWT Bearer token
 */
export const uploadMyDocument = async (formData, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.post(
    //   `${BASE_URL}/program-head/documents/upload`,
    //   formData,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${_token}`,
    //       "Content-Type": "multipart/form-data",
    //     },
    //   }
    // );
    // return response.data;
    return formData;
  } catch (error) {
    console.error("Error uploading Program Head document:", error);
    throw error;
  }
};

/**
 * Resubmit a revised document version
 * @param {string|number} id - Document ID
 * @param {FormData} formData - Multipart form data with the revised file
 * @param {string} _token - JWT Bearer token
 */
export const resubmitDocument = async (id, formData, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.put(
    //   `${BASE_URL}/program-head/documents/${id}/resubmit`,
    //   formData,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${_token}`,
    //       "Content-Type": "multipart/form-data",
    //     },
    //   }
    // );
    // return response.data;
    return { id, formData };
  } catch (error) {
    console.error(`Error resubmitting document ID ${id}:`, error);
    throw error;
  }
};

export default {
  getMyDocuments,
  uploadMyDocument,
  resubmitDocument,
  exportMyDocuments,
};

/**
 * Export the Program Head's document list (CSV/PDF)
 * @param {string} _token - JWT Bearer token
 */
export async function exportMyDocuments(_token) {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(`${BASE_URL}/program-head/documents/export`, {
    //   headers: { Authorization: `Bearer ${_token}` },
    //   responseType: "blob",
    // });
    // return response.data;
    return null;
  } catch (error) {
    console.error("Error exporting Program Head documents:", error);
    throw error;
  }
}
