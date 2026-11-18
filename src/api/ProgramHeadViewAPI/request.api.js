// Program Head Requests API

export const initialProgramHeadRequests = [];

export { initialFacultyRecords } from "./faculty.api";

/**
 * Fetch all document requests assigned to the Program Head
 * @param {string} _token - JWT Bearer token
 */
export const getMyRequests = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(`${BASE_URL}/program-head/requests`, getAuthHeaders(_token));
    // return response.data;
    return initialProgramHeadRequests;
  } catch (error) {
    console.error("Error fetching Program Head requests:", error);
    throw error;
  }
};

/**
 * Fetch a single document request by ID
 * @param {string|number} id - Request ID
 * @param {string} _token - JWT Bearer token
 */
export const getRequestById = async (id, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(`${BASE_URL}/program-head/requests/${id}`, getAuthHeaders(_token));
    // return response.data;
    return initialProgramHeadRequests.find((r) => r.id === id) || null;
  } catch (error) {
    console.error(`Error fetching request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Submit a document in response to a specific request
 * @param {string|number} id - Request ID
 * @param {FormData} formData - Multipart form data containing the file and remarks
 * @param {string} _token - JWT Bearer token
 */
export const submitRequestDocument = async (id, formData, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.post(`${BASE_URL}/program-head/requests/${id}/submit`, formData, {
    //   headers: { Authorization: `Bearer ${_token}`, "Content-Type": "multipart/form-data" },
    // });
    // return response.data;
    return { id, formData };
  } catch (error) {
    console.error(`Error submitting document for request ID ${id}:`, error);
    throw error;
  }
};

export default {
  getMyRequests,
  getRequestById,
  submitRequestDocument,
};