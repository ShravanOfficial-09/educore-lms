import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// GET JWT TOKEN
const getAuthHeader = () => {

  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// LOGIN API
export const loginUser = async (email, password) => {

  const response = await axios.post(
    `${BASE_URL}/users/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};

// GET ALL COURSES API
export const getCourses = async () => {

  const response = await axios.get(
    `${BASE_URL}/courses`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// CREATE COURSE API
export const createCourse = async (courseData) => {

  const response = await axios.post(
    `${BASE_URL}/courses/create`,
    courseData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET LECTURES BY COURSE API
export const getLecturesByCourse = async (courseId) => {

  const response = await axios.get(
    `${BASE_URL}/lectures/course/${courseId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// CREATE LECTURE API
export const createLecture = async (courseId, lectureData) => {

  const response = await axios.post(
    `${BASE_URL}/lectures/create/${courseId}`,
    lectureData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// ENROLL IN COURSE API
export const enrollInCourse = async (courseId) => {

  const response = await axios.post(
    `${BASE_URL}/enrollments/enroll/${courseId}`,
    {},
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// CHECK ENROLLMENT API
export const checkEnrollment = async (courseId) => {

  const response = await axios.get(
    `${BASE_URL}/enrollments/check/${courseId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// MARK LECTURE AS COMPLETED API
export const markLectureCompleted = async (lectureId) => {

  const response = await axios.post(
    `${BASE_URL}/progress/complete/${lectureId}`,
    {},
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET COURSE PROGRESS API
export const getCourseProgress = async (courseId) => {

  const response = await axios.get(
    `${BASE_URL}/progress/course/${courseId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};
