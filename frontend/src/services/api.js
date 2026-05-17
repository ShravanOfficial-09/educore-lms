import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// LOGIN API
export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/users/login`, {
    email,
    password,
  });

  return response.data;
};

// GET COURSES API
export const getCourses = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${BASE_URL}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};