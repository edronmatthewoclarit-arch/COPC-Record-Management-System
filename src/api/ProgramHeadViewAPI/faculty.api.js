// Faculty API for Program Head view

export const initialFacultyRecords = [
  {
    id: 1,
    name: "Dr. Ana Reyes",
    rank: "Associate Professor",
    degree: "Ph.D. in Computer Science",
    specialization: "Software Engineering & AI",
    status: "Active",
    email: "ana.reyes@msunaawan.edu.ph",
  },
  {
    id: 2,
    name: "Prof. Juan Dela Cruz",
    rank: "Assistant Professor",
    degree: "MS Information Technology",
    specialization: "Database & Data Mining",
    status: "Active",
    email: "juan.delacruz@msunaawan.edu.ph",
  },
  {
    id: 3,
    name: "Engr. Rizal Lim",
    rank: "Instructor",
    degree: "BS Computer Engineering / MIT",
    specialization: "Networks & Security",
    status: "Active",
    email: "rizal.lim@msunaawan.edu.ph",
  },
  {
    id: 4,
    name: "Prof. Maria Santos",
    rank: "Program Head",
    degree: "Doctor of Information Tech",
    specialization: "Information Systems",
    status: "Active",
    email: "maria.santos@msunaawan.edu.ph",
  },
];

export const getFacultyRecords = async (_token) => {
  try {
    return initialFacultyRecords;
  } catch (error) {
    console.error("Error fetching faculty records:", error);
    throw error;
  }
};

export const addFacultyRecord = async (data, _token) => {
  try {
    return { id: Date.now(), status: "Active", ...data };
  } catch (error) {
    console.error("Error adding faculty record:", error);
    throw error;
  }
};

export const updateFacultyRecord = async (id, data, _token) => {
  try {
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating faculty record with ID ${id}:`, error);
    throw error;
  }
};

export default {
  initialFacultyRecords,
  getFacultyRecords,
  addFacultyRecord,
  updateFacultyRecord,
};