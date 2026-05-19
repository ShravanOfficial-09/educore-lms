import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  addQuestion,
  checkEnrollment,
  createComment,
  createLecture,
  createQuiz,
  enrollInCourse,
  getCertificate,
  getCourseProgress,
  getLectureComments,
  getLectureResources,
  getLecturesByCourse,
  getQuizByLecture,
  markLectureCompleted,
  submitQuiz,
  uploadFile,
  uploadResource,
} from "../services/api";
import { isAdmin, isStudent } from "../utils/auth";

const getYouTubeEmbedUrl = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");

    if (host.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsedUrl.pathname.includes("/embed/")) {
        return url;
      }
    }

    if (host.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return "";
  } catch (error) {
    console.log("Invalid YouTube URL:", error);
    return "";
  }
};

const getInitials = (email) => {
  if (!email) {
    return "U";
  }

  const namePart = email.split("@")[0];
  const cleaned = namePart.replace(/[^a-zA-Z0-9]/g, " ").trim();
  const pieces = cleaned.split(/\s+/).filter(Boolean);

  if (pieces.length >= 2) {
    return `${pieces[0][0]}${pieces[1][0]}`.toUpperCase();
  }

  return namePart.slice(0, 2).toUpperCase();
};

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const [lectureTitle, setLectureTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [loadingLectures, setLoadingLectures] = useState(false);

  const [progress, setProgress] = useState({
    completedLectures: 0,
    totalLectures: 0,
    progressPercentage: 0,
    completedLectureIds: [],
  });
  const [markingCompleted, setMarkingCompleted] = useState(false);

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const [certificate, setCertificate] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [quizTitle, setQuizTitle] = useState("");
  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

  const adminUser = useMemo(() => isAdmin(), []);
  const studentUser = useMemo(() => isStudent(), []);
  const canViewLectures = adminUser || !studentUser || enrolled;

  const fetchLectures = async () => {
    try {
      setLoadingLectures(true);

      const response = await getLecturesByCourse(id);
      console.log(response);
      setLectures(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch lectures");
    } finally {
      setLoadingLectures(false);
    }
  };

  const fetchCourseProgress = async () => {
    if (!studentUser || !enrolled) {
      setProgress({
        completedLectures: 0,
        totalLectures: 0,
        progressPercentage: 0,
        completedLectureIds: [],
      });
      return;
    }

    try {
      const response = await getCourseProgress(id);
      console.log(response);
      setProgress(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch course progress");
    }
  };

  const fetchEnrollmentStatus = async () => {
    if (!studentUser) {
      setEnrolled(false);
      setCheckingEnrollment(false);
      return;
    }

    try {
      const response = await checkEnrollment(id);
      console.log(response);
      setEnrolled(response.data.enrolled);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to check enrollment status");
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const fetchResources = async (lectureId) => {
    if (!lectureId) {
      setResources([]);
      return;
    }

    try {
      setLoadingResources(true);

      const response = await getLectureResources(lectureId);
      console.log(response);
      setResources(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch resources");
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchComments = async (lectureId) => {
    if (!lectureId) {
      setComments([]);
      return;
    }

    try {
      setLoadingComments(true);

      const response = await getLectureComments(lectureId);
      console.log(response);
      setComments(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchCertificate = async () => {
    if (!studentUser || !enrolled) {
      setCertificate(null);
      return;
    }

    try {
      setLoadingCertificate(true);

      const response = await getCertificate(id);
      console.log(response);
      setCertificate(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to fetch certificate");
    } finally {
      setLoadingCertificate(false);
    }
  };

  const fetchQuiz = async (lectureId) => {
    if (!lectureId) {
      setQuiz(null);
      return;
    }

    try {
      setLoadingQuiz(true);

      const response = await getQuizByLecture(lectureId);
      console.log(response);
      setQuiz(response.data);
    } catch (error) {
      console.log(error);

      const errorMessage = error?.response?.data?.message || "";

      if (errorMessage.toLowerCase().includes("quiz not found")) {
        setQuiz(null);
      } else {
        alert(errorMessage || "Failed to fetch quiz");
      }
    } finally {
      setLoadingQuiz(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentStatus();
  }, [id]);

  useEffect(() => {
    if (canViewLectures) {
      fetchLectures();
      fetchCourseProgress();
      fetchCertificate();
    } else {
      setLectures([]);
      setSelectedLecture(null);
      setResources([]);
      setComments([]);
      setCertificate(null);
      setQuiz(null);
    }
  }, [id, canViewLectures]);

  useEffect(() => {
    if (lectures.length === 0) {
      setSelectedLecture(null);
      return;
    }

    const lectureStillExists = lectures.find(
      (lecture) => lecture.id === selectedLecture?.id
    );

    if (lectureStillExists) {
      setSelectedLecture(lectureStillExists);
    } else {
      setSelectedLecture(lectures[0]);
    }
  }, [lectures]);

  useEffect(() => {
    setQuizResult(null);
    setSelectedAnswers({});
    setResources([]);
    setComments([]);
    fetchResources(selectedLecture?.id);
    fetchComments(selectedLecture?.id);
    fetchQuiz(selectedLecture?.id);
  }, [selectedLecture?.id]);

  const isLectureCompleted = (lectureId) => {
    return (progress.completedLectureIds || []).includes(lectureId);
  };

  const handleCreateLecture = async () => {
    if (!lectureTitle || !videoUrl) {
      alert("Please fill all fields");
      return;
    }

    if (
      !videoUrl.startsWith("http://") &&
      !videoUrl.startsWith("https://")
    ) {
      alert("Please enter a valid video URL");
      return;
    }

    try {
      await createLecture(id, {
        title: lectureTitle,
        videoUrl,
      });

      alert("Lecture created successfully");
      setLectureTitle("");
      setVideoUrl("");
      fetchLectures();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to create lecture");
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);

      await enrollInCourse(id);

      alert("Enrollment successful");
      setEnrolled(true);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!selectedLecture || isLectureCompleted(selectedLecture.id)) {
      return;
    }

    try {
      setMarkingCompleted(true);

      await markLectureCompleted(selectedLecture.id);

      alert("Lecture marked as completed");
      fetchCourseProgress();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to mark lecture as completed");
    } finally {
      setMarkingCompleted(false);
    }
  };

  const handleUploadResource = async () => {
    if (!selectedLecture) {
      alert("Please select a lecture first");
      return;
    }

    if (!resourceTitle || !resourceFileUrl) {
      alert("Please fill all resource fields");
      return;
    }

    if (
      !resourceFileUrl.startsWith("http://") &&
      !resourceFileUrl.startsWith("https://")
    ) {
      alert("Please enter a valid file URL");
      return;
    }

    try {
      setUploadingResource(true);

      await uploadResource(selectedLecture.id, {
        title: resourceTitle,
        fileUrl: resourceFileUrl,
      });

      alert("Resource added successfully");
      setResourceTitle("");
      setResourceFileUrl("");
      setSelectedUploadFile(null);
      setUploadedFileName("");
      setUploadSuccess(false);
      fetchResources(selectedLecture.id);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to add resource");
    } finally {
      setUploadingResource(false);
    }
  };

  const handleChooseFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedUploadFile(file);
    setUploadedFileName(file.name);
    setUploadSuccess(false);
  };

  const handleUploadSelectedFile = async () => {
    if (!selectedUploadFile) {
      alert("Please choose a file first");
      return;
    }

    try {
      setUploadingFile(true);

      const response = await uploadFile(selectedUploadFile);

      setResourceFileUrl(response.data.fileUrl);
      setUploadSuccess(true);
      alert("File uploaded successfully");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateComment = async () => {
    if (!selectedLecture) {
      alert("Please select a lecture first");
      return;
    }

    if (!commentMessage.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      setPostingComment(true);

      await createComment(selectedLecture.id, {
        message: commentMessage,
      });

      alert("Comment added successfully");
      setCommentMessage("");
      fetchComments(selectedLecture.id);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to add comment");
    } finally {
      setPostingComment(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!selectedLecture) {
      alert("Please select a lecture first");
      return;
    }

    if (!quizTitle.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    try {
      setCreatingQuiz(true);

      const response = await createQuiz(selectedLecture.id, {
        title: quizTitle,
      });

      alert("Quiz created successfully");
      setQuizTitle("");
      setQuiz(response.data);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreatingQuiz(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz?.quizId) {
      alert("Create a quiz first");
      return;
    }

    const {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    } = questionForm;

    if (
      !question ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctAnswer
    ) {
      alert("Please fill all question fields");
      return;
    }

    try {
      setAddingQuestion(true);

      const response = await addQuestion(quiz.quizId, questionForm);

      alert("Question added successfully");
      setQuiz(response.data);
      setQuestionForm({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to add question");
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleSelectAnswer = (questionId, answer) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz?.quizId) {
      return;
    }

    if (quiz.questions.length === 0) {
      alert("This quiz has no questions yet");
      return;
    }

    try {
      setSubmittingQuiz(true);

      const response = await submitQuiz(quiz.quizId, {
        answers: selectedAnswers,
      });

      setQuizResult(response.data);
      alert("Quiz submitted successfully");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificate?.eligible) {
      return;
    }

    const certificateWindow = window.open("", "_blank", "width=1100,height=800");

    if (!certificateWindow) {
      alert("Please allow pop-ups to download the certificate");
      return;
    }

    const completionDate = certificate.completionDate
      ? formatTimestamp(certificate.completionDate)
      : "Completed";

    certificateWindow.document.write(`
      <html>
        <head>
          <title>EduCore LMS Certificate</title>
          <style>
            body {
              margin: 0;
              padding: 32px;
              background: #f8fafc;
              font-family: Arial, sans-serif;
            }
            .certificate {
              max-width: 960px;
              margin: 0 auto;
              background: white;
              border: 8px solid #0f172a;
              padding: 56px;
              text-align: center;
              box-sizing: border-box;
            }
            .brand {
              color: #0284c7;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 3px;
              text-transform: uppercase;
            }
            h1 {
              margin: 20px 0 12px;
              font-size: 44px;
              color: #0f172a;
            }
            .subtitle {
              font-size: 18px;
              color: #475569;
              margin-bottom: 40px;
            }
            .name {
              font-size: 38px;
              font-weight: bold;
              color: #111827;
              margin: 24px 0;
            }
            .course {
              font-size: 28px;
              color: #0284c7;
              font-weight: bold;
              margin: 20px 0 36px;
            }
            .footer {
              margin-top: 48px;
              display: flex;
              justify-content: space-between;
              align-items: end;
              gap: 24px;
            }
            .line {
              width: 260px;
              border-top: 2px solid #cbd5e1;
              padding-top: 12px;
              color: #475569;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="brand">EduCore LMS</div>
            <h1>Certificate of Completion</h1>
            <div class="subtitle">This certificate is proudly awarded to</div>
            <div class="name">${certificate.studentName}</div>
            <div class="subtitle">for successfully completing the course</div>
            <div class="course">${certificate.courseTitle}</div>
            <div class="subtitle">Completion Date: ${completionDate}</div>
            <div class="footer">
              <div class="line">Learner Signature</div>
              <div class="line">EduCore LMS</div>
            </div>
          </div>
        </body>
      </html>
    `);

    certificateWindow.document.close();
    certificateWindow.focus();
    certificateWindow.print();
  };

  const embeddedVideoUrl = getYouTubeEmbedUrl(selectedLecture?.videoUrl);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to Courses
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-10 text-white sm:px-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100">
              Course Workspace
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Course #{id}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">
              Learn, review lecture resources, track progress, and take quizzes
              from one professional LMS workspace.
            </p>
          </div>

          {studentUser && enrolled && (
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Course Progress
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {progress.completedLectures} of {progress.totalLectures} lectures completed
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-sky-600">
                    {progress.progressPercentage}%
                  </p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{
                    width: `${progress.progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          )}

          {studentUser && !enrolled && !checkingEnrollment && (
            <div className="border-b border-slate-200 bg-amber-50 px-6 py-8 sm:px-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Enrollment Required
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Enroll in this course to access lectures, PDFs, and quizzes.
                  </p>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="space-y-6">
              {adminUser && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create Lecture
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Lecture Title
                      </label>

                      <input
                        type="text"
                        placeholder="Enter lecture title"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Video URL
                      </label>

                      <input
                        type="text"
                        placeholder="https://youtube.com/..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <button
                      onClick={handleCreateLecture}
                      className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Create Lecture
                    </button>
                  </div>
                </div>
              )}

              {canViewLectures && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Lectures
                    </h2>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {lectures.length}
                    </span>
                  </div>

                  {loadingLectures ? (
                    <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                      Loading lectures...
                    </div>
                  ) : lectures.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      No lectures available yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lectures.map((lecture) => {
                        const completed = isLectureCompleted(lecture.id);
                        const selected = selectedLecture?.id === lecture.id;

                        return (
                          <button
                            key={lecture.id}
                            onClick={() => setSelectedLecture(lecture)}
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-sky-500 bg-sky-50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {lecture.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  Lecture #{lecture.id}
                                </p>
                              </div>

                              <div
                                className={`h-3 w-3 rounded-full ${
                                  completed ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </aside>

            <section className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {!canViewLectures ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-amber-100 px-5 py-4 text-sm font-semibold text-amber-700">
                      Locked
                    </div>

                    <h2 className="mt-5 text-2xl font-bold text-slate-900">
                      Course Locked
                    </h2>

                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                      Enroll in this course to watch lectures, open PDFs, attempt quizzes,
                      and track your learning progress.
                    </p>
                  </div>
                ) : !selectedLecture ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                      No Lecture Selected
                    </h2>

                    <p className="mt-3 text-sm text-slate-500">
                      Select a lecture from the sidebar to begin learning.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          {selectedLecture.title}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                          Lecture #{selectedLecture.id}
                        </p>
                      </div>

                      {studentUser && enrolled && (
                        <button
                          onClick={handleMarkCompleted}
                          disabled={
                            markingCompleted ||
                            isLectureCompleted(selectedLecture.id)
                          }
                          className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                            isLectureCompleted(selectedLecture.id)
                              ? "cursor-not-allowed bg-emerald-100 text-emerald-700"
                              : "bg-slate-900 text-white hover:bg-slate-700"
                          }`}
                        >
                          {isLectureCompleted(selectedLecture.id)
                            ? "Completed"
                            : markingCompleted
                            ? "Saving..."
                            : "Mark as Completed"}
                        </button>
                      )}
                    </div>

                    <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-black">
                      {embeddedVideoUrl ? (
                        <iframe
                          src={embeddedVideoUrl}
                          title={selectedLecture.title}
                          allowFullScreen
                          className="h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white">
                          Invalid or unsupported video URL
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {canViewLectures && selectedLecture && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Lecture Resources
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        PDFs and supporting files for: {selectedLecture.title}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {resources.length} Resources
                    </span>
                  </div>

                  {adminUser && (
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Add Resource
                      </h3>

                      <div className="mt-4 space-y-4">
                        <input
                          type="text"
                          placeholder="Resource title"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />

                        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5 transition hover:border-sky-400 hover:bg-sky-50/40">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                Upload PDF, image, or thumbnail
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Choose a file and upload it to Cloudinary. The file URL will be filled automatically.
                              </p>
                            </div>

                            <label className="inline-flex cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                              Choose File
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleChooseFile}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
                              {uploadedFileName || "No file selected yet"}
                            </div>

                            <button
                              type="button"
                              onClick={handleUploadSelectedFile}
                              disabled={uploadingFile || !selectedUploadFile}
                              className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {uploadingFile ? "Uploading..." : "Upload File"}
                            </button>
                          </div>

                          {uploadSuccess && (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                              File uploaded successfully. The resource URL has been filled in below.
                            </div>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Uploaded file URL will appear here"
                          value={resourceFileUrl}
                          onChange={(e) => setResourceFileUrl(e.target.value)}
                          className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={handleUploadResource}
                            disabled={uploadingResource}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {uploadingResource ? "Adding..." : "Add Resource"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingResources ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      Loading resources...
                    </div>
                  ) : resources.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      No resources available for this lecture yet.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-xs font-bold text-rose-700">
                              PDF
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-base font-semibold text-slate-900">
                                {resource.title}
                              </h3>

                              <p className="mt-2 line-clamp-2 break-all text-sm text-slate-500">
                                {resource.fileUrl}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-3">
                                <a
                                  href={resource.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                  Open PDF
                                </a>

                                <a
                                  href={resource.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {studentUser && enrolled && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Course Certificate
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Unlock your certificate after completing all course lectures.
                      </p>
                    </div>

                    {certificate?.eligible && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Certificate Ready
                      </span>
                    )}
                  </div>

                  {loadingCertificate ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      Loading certificate...
                    </div>
                  ) : certificate?.eligible ? (
                    <div className="space-y-5">
                      <div className="overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 shadow-sm">
                        <div className="rounded-2xl border-4 border-slate-900 bg-white px-6 py-10 text-center">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                            EduCore LMS
                          </p>

                          <h3 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Certificate of Completion
                          </h3>

                          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">
                            This certificate is proudly presented to
                          </p>

                          <p className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">
                            {certificate.studentName}
                          </p>

                          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">
                            For successfully completing
                          </p>

                          <p className="mt-4 text-2xl font-semibold text-sky-700 sm:text-3xl">
                            {certificate.courseTitle}
                          </p>

                          <div className="mt-10 grid gap-6 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Completion Date
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {formatTimestamp(certificate.completionDate)}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                              </p>
                              <p className="mt-2 text-sm font-semibold text-emerald-700">
                                Course Completed
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadCertificate}
                        className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Download Certificate
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Certificate Locked
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            Complete all lectures to unlock your course certificate.
                            You currently have {progress.progressPercentage}% progress.
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm ring-1 ring-amber-200">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Progress
                          </p>
                          <p className="mt-2 text-2xl font-bold text-amber-600">
                            {progress.progressPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {canViewLectures && selectedLecture && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Discussion
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Questions and comments for: {selectedLecture.title}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {comments.length} Comments
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Add Comment
                    </h3>

                    <div className="mt-4 space-y-4">
                      <textarea
                        placeholder="Share a thought, ask a question, or leave a note..."
                        value={commentMessage}
                        onChange={(e) => setCommentMessage(e.target.value)}
                        rows="4"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />

                      <button
                        type="button"
                        onClick={handleCreateComment}
                        disabled={postingComment}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {postingComment ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {loadingComments ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                        Loading discussion...
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                        No comments yet. Start the discussion.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                                {getInitials(comment.userEmail)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {comment.userEmail}
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {formatTimestamp(comment.createdAt)}
                                  </p>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                  {comment.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {canViewLectures && selectedLecture && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Quiz + MCQ
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Quiz for lecture: {selectedLecture.title}
                      </p>
                    </div>

                    {quiz?.questions?.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {quiz.questions.length} Questions
                      </span>
                    )}
                  </div>

                  {loadingQuiz ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      Loading quiz...
                    </div>
                  ) : adminUser ? (
                    <div className="space-y-6">
                      {!quiz ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Create Quiz
                          </h3>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              placeholder="Enter quiz title"
                              value={quizTitle}
                              onChange={(e) => setQuizTitle(e.target.value)}
                              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            />

                            <button
                              type="button"
                              onClick={handleCreateQuiz}
                              disabled={creatingQuiz}
                              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {creatingQuiz ? "Creating..." : "Create Quiz"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-2xl border border-slate-200 bg-sky-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                              Active Quiz
                            </p>

                            <h3 className="mt-2 text-xl font-semibold text-slate-900">
                              {quiz.title}
                            </h3>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-lg font-semibold text-slate-900">
                              Add MCQ Question
                            </h3>

                            <div className="mt-4 space-y-4">
                              <textarea
                                placeholder="Enter question"
                                value={questionForm.question}
                                onChange={(e) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    question: e.target.value,
                                  })
                                }
                                rows="3"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                              />

                              <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                  type="text"
                                  placeholder="Option A"
                                  value={questionForm.optionA}
                                  onChange={(e) =>
                                    setQuestionForm({
                                      ...questionForm,
                                      optionA: e.target.value,
                                    })
                                  }
                                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />

                                <input
                                  type="text"
                                  placeholder="Option B"
                                  value={questionForm.optionB}
                                  onChange={(e) =>
                                    setQuestionForm({
                                      ...questionForm,
                                      optionB: e.target.value,
                                    })
                                  }
                                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />

                                <input
                                  type="text"
                                  placeholder="Option C"
                                  value={questionForm.optionC}
                                  onChange={(e) =>
                                    setQuestionForm({
                                      ...questionForm,
                                      optionC: e.target.value,
                                    })
                                  }
                                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />

                                <input
                                  type="text"
                                  placeholder="Option D"
                                  value={questionForm.optionD}
                                  onChange={(e) =>
                                    setQuestionForm({
                                      ...questionForm,
                                      optionD: e.target.value,
                                    })
                                  }
                                  className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                              </div>

                              <select
                                value={questionForm.correctAnswer}
                                onChange={(e) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    correctAnswer: e.target.value,
                                  })
                                }
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                              >
                                <option value="A">Correct Answer: A</option>
                                <option value="B">Correct Answer: B</option>
                                <option value="C">Correct Answer: C</option>
                                <option value="D">Correct Answer: D</option>
                              </select>

                              <button
                                type="button"
                                onClick={handleAddQuestion}
                                disabled={addingQuestion}
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {addingQuestion ? "Adding..." : "Add Question"}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {quiz.questions.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                                Quiz created. Add your first MCQ question.
                              </div>
                            ) : (
                              quiz.questions.map((questionItem, index) => (
                                <div
                                  key={questionItem.id}
                                  className="rounded-2xl border border-slate-200 bg-white p-5"
                                >
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Question {index + 1}
                                  </p>

                                  <h4 className="mt-2 text-base font-semibold text-slate-900">
                                    {questionItem.question}
                                  </h4>

                                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {[
                                      { key: "A", label: questionItem.optionA },
                                      { key: "B", label: questionItem.optionB },
                                      { key: "C", label: questionItem.optionC },
                                      { key: "D", label: questionItem.optionD },
                                    ].map((option) => (
                                      <div
                                        key={option.key}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                                      >
                                        {option.key}. {option.label}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : quiz ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-200 bg-sky-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                          Lecture Quiz
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-slate-900">
                          {quiz.title}
                        </h3>
                      </div>

                      {quiz.questions.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                          Quiz exists, but no questions have been added yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quiz.questions.map((questionItem, index) => (
                            <div
                              key={questionItem.id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Question {index + 1}
                              </p>

                              <h4 className="mt-2 text-base font-semibold text-slate-900">
                                {questionItem.question}
                              </h4>

                              <div className="mt-4 space-y-3">
                                {[
                                  { key: "A", label: questionItem.optionA },
                                  { key: "B", label: questionItem.optionB },
                                  { key: "C", label: questionItem.optionC },
                                  { key: "D", label: questionItem.optionD },
                                ].map((option) => {
                                  const activeOption =
                                    selectedAnswers[questionItem.id] === option.key;

                                  return (
                                    <button
                                      key={option.key}
                                      type="button"
                                      onClick={() =>
                                        handleSelectAnswer(questionItem.id, option.key)
                                      }
                                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                                        activeOption
                                          ? "border-sky-500 bg-sky-50 text-sky-900"
                                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      {option.key}. {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {quiz.questions.length > 0 && (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <button
                            type="button"
                            onClick={handleSubmitQuiz}
                            disabled={submittingQuiz}
                            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {submittingQuiz ? "Submitting..." : "Submit Quiz"}
                          </button>

                          {quizResult && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                              <p className="font-semibold">
                                Score: {quizResult.score}/{quizResult.totalQuestions}
                              </p>
                              <p className="mt-1">
                                Percentage: {quizResult.percentage}%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                      No quiz available for this lecture yet.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CourseDetails;
