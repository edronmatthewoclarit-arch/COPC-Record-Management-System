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

export const initialRequirements = [];

export const recordsByRequirement = {};

export const requirementDescriptions = [
  "Faculty qualifications, assignments, and supporting records.",
  "Faculty teaching assignments and loads per semester.",
  "Course syllabi required for the BS Information Technology program.",
  "Curriculum and program documentation.",
  "Laboratory facilities, equipment, and supporting records.",
  "Library holdings, subscriptions, and learning resources.",
  "Program facilities and supporting infrastructure.",
  "Research and extension outputs and activities.",
  "Student academic and enrollment records.",
  "Additional documentary requirements prescribed for COPC.",
];

export const categoryOptions = [
  "Faculty",
  "Curriculum",
  "Facilities",
  "Library",
  "Research",
  "Student Records",
  "Other",
];

export const roleOptions = [
  "Program Head",
  "Faculty",
  "Office Representative",
  "Dean",
];

/**
 * Fetch all COPC requirements
 * @param {string} _token - JWT Bearer token
 */
export const getAllRequirements = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/requirements`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialRequirements;
  } catch (error) {
    console.error("Error fetching all requirements:", error);
    throw error;
  }
};

/**
 * Fetch a single COPC requirement by ID
 * @param {string|number} id - Requirement ID
 * @param {string} _token - JWT Bearer token
 */
export const getRequirementById = async (id, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/requirements/${id}`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialRequirements.find((r) => r.id === id) || null;
  } catch (error) {
    console.error(`Error fetching requirement with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new COPC requirement
 * @param {Object} data - Requirement payload (name, category, description, responsible, year)
 * @param {string} _token - JWT Bearer token
 */
export const addRequirement = async (data, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.post(
    //   `${BASE_URL}/requirements`,
    //   data,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return data;
  } catch (error) {
    console.error("Error adding new requirement:", error);
    throw error;
  }
};

export default {
  getAllRequirements,
  getRequirementById,
  addRequirement,
};
