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

export const initialRequirements = [
  {
    id: 1,
    name: "Faculty Information",
    category: "Faculty",
    description: "Faculty qualifications, assignments, and supporting records.",
    role: "Program Head",
    deadline: "Nov 30, 2026",
    status: "In Progress",
    program: "Information Technology",
  },
  {
    id: 2,
    name: "Curriculum & Syllabi",
    category: "Curriculum",
    description: "Course syllabi and curriculum mapping for the BS Information Technology program.",
    role: "Program Head",
    deadline: "Nov 25, 2026",
    status: "Completed",
    program: "Information Technology",
  },
  {
    id: 3,
    name: "Physical Facilities & Laboratories",
    category: "Facilities",
    description: "Laboratory facilities, equipment inventory, and supporting records.",
    role: "Office Representative",
    deadline: "Dec 05, 2026",
    status: "In Progress",
    program: "Information Technology",
  },
  {
    id: 4,
    name: "Library Holdings & Resources",
    category: "Library",
    description: "Library holdings, journal subscriptions, and learning resources.",
    role: "Office Representative",
    deadline: "Dec 10, 2026",
    status: "Pending",
    program: "Information Technology",
  },
];

export const recordsByRequirement = {
  "Faculty Information": [
    {
      id: 101,
      name: "Faculty Profile",
      file: "Faculty_Profile_BSIT_2026.pdf",
      size: "1.6 mb",
      assigned: "Maria Santos",
      role: "Faculty",
      status: "Approved",
      updated: "October 20, 2026 • 9:50am",
      version: "v2",
    },
    {
      id: 102,
      name: "Faculty Qualification Summary",
      file: "Faculty_Information_BSIT_2026.pdf",
      size: "1.6 mb",
      assigned: "Maria Santos",
      role: "Faculty",
      status: "For Review",
      updated: "October 20, 2026 • 9:50am",
      version: "v2",
    },
    {
      id: 103,
      name: "Faculty Licenses & Certifications",
      file: "Faculty_Licenses.pdf",
      size: "3.1 mb",
      assigned: "Ana Reyes",
      role: "Faculty",
      status: "For Revision",
      updated: "October 22, 2026 • 3:45pm",
      version: "v1",
      remark: "Please re-upload renewed PRC license card and updated certifications.",
    },
    {
      id: 104,
      name: "Teaching Loads",
      file: null,
      size: "—",
      assigned: "Maria Santos",
      role: "Faculty",
      status: "Pending",
      updated: "—",
      version: "—",
    },
  ],
  "Curriculum & Syllabi": [
    {
      id: 201,
      name: "Curriculum Map",
      file: "Curriculum_Mapping_BSIT.pdf",
      size: "2.4 mb",
      assigned: "Juan Dela Cruz",
      role: "Faculty",
      status: "Approved",
      updated: "October 18, 2026 • 2:15pm",
      version: "v2",
    },
    {
      id: 202,
      name: "ITE183 Course Syllabus",
      file: "ITE183_Syllabus_v2.pdf",
      size: "1.8 mb",
      assigned: "Ana Reyes",
      role: "Faculty",
      status: "For Review",
      updated: "October 24, 2026 • 11:20am",
      version: "v1",
    },
  ],
  "Physical Facilities & Laboratories": [
    {
      id: 301,
      name: "IT Laboratory Specifications",
      file: "Laboratory_Equipment_Specs.pdf",
      size: "3.2 mb",
      assigned: "Engr. Rizal Lim",
      role: "Office Representative",
      status: "Submitted",
      updated: "October 19, 2026 • 3:30pm",
      version: "v1",
    },
    {
      id: 302,
      name: "Physical Plant Inventory",
      file: null,
      size: "—",
      assigned: "Engr. Rizal Lim",
      role: "Office Representative",
      status: "Pending",
      updated: "—",
      version: "—",
    },
  ],
  "Library Holdings & Resources": [
    {
      id: 401,
      name: "IT Textbooks & Reference List",
      file: null,
      size: "—",
      assigned: "Office Representative",
      role: "Office Representative",
      status: "Pending",
      updated: "—",
      version: "—",
    },
  ],
};

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
