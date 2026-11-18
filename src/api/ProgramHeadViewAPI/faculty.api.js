// Faculty API for Program Head view

export const initialFacultyRecords = [];

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