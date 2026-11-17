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

export const initialRepresentatives = [];

/**
 * Fetch all office/program representatives
 * @param {string} _token - JWT Bearer token
 */
export const getRepresentatives = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/representatives`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialRepresentatives;
  } catch (error) {
    console.error("Error fetching representatives:", error);
    throw error;
  }
};

/**
 * Create a new representative record
 * @param {Object} data - Representative payload (name, office, program, email, contact, status)
 * @param {string} _token - JWT Bearer token
 */
export const addRepresentative = async (data, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.post(
    //   `${BASE_URL}/representatives`,
    //   data,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return data;
  } catch (error) {
    console.error("Error adding representative:", error);
    throw error;
  }
};

/**
 * Update an existing representative record by ID
 * @param {string|number} id - Representative ID
 * @param {Object} data - Updated representative fields
 * @param {string} _token - JWT Bearer token
 */
export const updateRepresentative = async (id, data, _token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.put(
    //   `${BASE_URL}/representatives/${id}`,
    //   data,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating representative with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getRepresentatives,
  addRepresentative,
  updateRepresentative,
};
