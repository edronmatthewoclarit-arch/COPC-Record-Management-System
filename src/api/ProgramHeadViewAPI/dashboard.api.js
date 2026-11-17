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

export const initialProgramHeadDashboard = {
  stats: {
    pendingRequests: 0,
    submitted: 0,
    forRevision: 0,
    approved: 0,
  },
  requestsRequiringAction: [],
  recentSubmissionActivity: [],
};

/**
 * Fetch Program Head dashboard summary, pending requests, and recent activity
 * @param {string} _token - JWT Bearer token
 */
export const getProgramHeadDashboard = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/program-head/dashboard`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialProgramHeadDashboard;
  } catch (error) {
    console.error("Error fetching Program Head dashboard:", error);
    throw error;
  }
};

export default {
  getProgramHeadDashboard,
};
