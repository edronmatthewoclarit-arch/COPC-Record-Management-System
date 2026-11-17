import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const ROLES = [
  "COPC Coordinator",
  "Program Head",
  "Dean",
  "Faculty",
  "Office Representative",
];

/**
 * Authenticate a user and retrieve their session & JWT token
 * @param {Object} credentials - { email, password, role }
 */
export const loginUser = async ({ email, password, role }) => {
  try {
    if (!role) {
      throw new Error("Select a user role.");
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("Enter a valid email address.");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must contain at least 8 characters.");
    }

    // Uncomment when Express backend is running:
    // const response = await axios.post(`${BASE_URL}/auth/login`, {
    //   email: normalizedEmail,
    //   password,
    //   role,
    // });
    // return response.data;

    return {
      email: normalizedEmail,
      role,
      name: "Account",
      initials: "U",
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

/**
 * Log out the currently authenticated user
 * @param {string} token - JWT Bearer token
 */
export const logoutUser = async (token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

export default {
  ROLES,
  loginUser,
  logoutUser,
};
