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

export const initialCoordinatorDashboard = {
  progress: {
    completionPercentage: 0,
    totalRequirements: 0,
    approved: 0,
    pending: 0,
    forRevision: 0,
  },
  recentActivities: [],
  documentUpdates: [],
};

/**
 * Fetch COPC Coordinator dashboard progress, recent activities, and document updates
 * @param {string} _token - JWT Bearer token
 */
export const getCoordinatorDashboard = async (_token) => {
  try {
    // Uncomment when Express backend is running:
    // const response = await axios.get(
    //   `${BASE_URL}/copc/dashboard`,
    //   getAuthHeaders(_token)
    // );
    // return response.data;
    return initialCoordinatorDashboard;
  } catch (error) {
    console.error("Error fetching COPC Coordinator dashboard:", error);
    throw error;
  }
};

export default {
  getCoordinatorDashboard,
};
