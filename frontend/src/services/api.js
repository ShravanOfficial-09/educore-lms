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

// CREATE QUIZ API
export const createQuiz = async (lectureId, quizData) => {

  const response = await axios.post(
    `${BASE_URL}/quizzes/create/${lectureId}`,
    quizData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// ADD QUESTION API
export const addQuestion = async (quizId, questionData) => {

  const response = await axios.post(
    `${BASE_URL}/quizzes/question/${quizId}`,
    questionData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET QUIZ BY LECTURE API
export const getQuizByLecture = async (lectureId) => {

  const response = await axios.get(
    `${BASE_URL}/quizzes/lecture/${lectureId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// SUBMIT QUIZ API
export const submitQuiz = async (quizId, submissionData) => {

  const response = await axios.post(
    `${BASE_URL}/quizzes/submit/${quizId}`,
    submissionData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// UPLOAD RESOURCE API
export const uploadResource = async (lectureId, resourceData) => {

  const response = await axios.post(
    `${BASE_URL}/resources/upload/${lectureId}`,
    resourceData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET LECTURE RESOURCES API
export const getLectureResources = async (lectureId) => {

  const response = await axios.get(
    `${BASE_URL}/resources/lecture/${lectureId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// CREATE COMMENT API
export const createComment = async (lectureId, commentData) => {

  const response = await axios.post(
    `${BASE_URL}/comments/create/${lectureId}`,
    commentData,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET LECTURE COMMENTS API
export const getLectureComments = async (lectureId) => {

  const response = await axios.get(
    `${BASE_URL}/comments/lecture/${lectureId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// GET CERTIFICATE API
export const getCertificate = async (courseId) => {

  const response = await axios.get(
    `${BASE_URL}/certificates/course/${courseId}`,
    {
      headers: getAuthHeader(),
    }
  );

  return response.data;
};

// FILE UPLOAD API
export const uploadFile = async (file) => {

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/upload/file`,
    formData,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
