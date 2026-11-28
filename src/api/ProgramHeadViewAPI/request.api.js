// Program Head Requests API

export const initialProgramHeadRequests = [
  {
    id: 1,
    requirement: "Faculty Information",
    documentName: "Teaching Loads",
    recipient: "Maria Santos",
    recipientRole: "Faculty",
    submissionDate: "2026-11-20",
    date: "November 20, 2026",
    status: "Pending",
    instructions: "Submit signed 1st Semester teaching load sheets and faculty timetables.",
  },
  {
    id: 2,
    requirement: "Faculty Information",
    documentName: "Teaching Loads & Class Schedules",
    recipient: "Maria Santos",
    recipientRole: "Faculty",
    submissionDate: "2026-11-20",
    date: "November 20, 2026",
    status: "Pending",
    instructions: "Submit signed 1st Semester teaching load sheets and faculty timetables.",
  },
  {
    id: 3,
    requirement: "Facilities & Equipment",
    documentName: "Laboratory Facility Specifications",
    recipient: "Engr. Rizal Lim",
    recipientRole: "Office Representative",
    submissionDate: "2026-11-25",
    date: "November 25, 2026",
    status: "Completed",
    instructions: "Attach certified networking and computer lab equipment specs.",
  },
];

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