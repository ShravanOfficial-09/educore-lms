import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
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

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

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
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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

const resetProgressState = {
  completedLectures: 0,
  totalLectures: 0,
  progressPercentage: 0,
  completedLectureIds: [],
};

function SectionHeader({ title, description, badge }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      {badge ? <span className="badge-premium">{badge}</span> : null}
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="surface-soft flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-sm font-semibold text-slate-200">
        EC
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-100">
        {title}
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function InlineError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="button-secondary !px-4 !py-2"
          >
            Try Again
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InsightCard({ label, value, accent }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-gradient-to-br ${accent} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
}

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showLectureSidebar, setShowLectureSidebar] = useState(false);
  const [lectureError, setLectureError] = useState("");
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [creatingLecture, setCreatingLecture] = useState(false);
  const [lectureTitle, setLectureTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [progress, setProgress] = useState(resetProgressState);
  const [progressError, setProgressError] = useState("");
  const [markingCompleted, setMarkingCompleted] = useState(false);

  const [resources, setResources] = useState([]);
  const [resourceError, setResourceError] = useState("");
  const [loadingResources, setLoadingResources] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFileUrl, setResourceFileUrl] = useState("");
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");

  const [certificate, setCertificate] = useState(null);
  const [certificateError, setCertificateError] = useState("");
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  const [quiz, setQuiz] = useState(null);
  const [quizError, setQuizError] = useState("");
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
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

  const fetchLectures = useCallback(async () => {
    try {
      setLoadingLectures(true);
      setLectureError("");

      const response = await getLecturesByCourse(id);
      setLectures(response.data || []);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch lectures.");
      setLectureError(message);
      toast.error(message);
    } finally {
      setLoadingLectures(false);
    }
  }, [id]);

  const fetchEnrollmentStatus = useCallback(async () => {
    if (!studentUser) {
      setEnrolled(false);
      setCheckingEnrollment(false);
      return;
    }

    try {
      const response = await checkEnrollment(id);
      setEnrolled(Boolean(response.data?.enrolled));
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to check enrollment status."));
    } finally {
      setCheckingEnrollment(false);
    }
  }, [id, studentUser]);

  const fetchCourseProgress = useCallback(async () => {
    if (!studentUser || !enrolled) {
      setProgress(resetProgressState);
      setProgressError("");
      return;
    }

    try {
      setProgressError("");
      const response = await getCourseProgress(id);
      setProgress({
        completedLectures: response.data?.completedLectures || 0,
        totalLectures: response.data?.totalLectures || 0,
        progressPercentage: response.data?.progressPercentage || 0,
        completedLectureIds: response.data?.completedLectureIds || [],
      });
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch course progress.");
      setProgressError(message);
      toast.error(message);
    }
  }, [enrolled, id, studentUser]);

  const fetchResources = useCallback(async (lectureId) => {
    if (!lectureId) {
      setResources([]);
      setResourceError("");
      return;
    }

    try {
      setLoadingResources(true);
      setResourceError("");
      const response = await getLectureResources(lectureId);
      setResources(response.data || []);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch resources.");
      setResourceError(message);
      toast.error(message);
    } finally {
      setLoadingResources(false);
    }
  }, []);

  const fetchComments = useCallback(async (lectureId) => {
    if (!lectureId) {
      setComments([]);
      setCommentError("");
      return;
    }

    try {
      setLoadingComments(true);
      setCommentError("");
      const response = await getLectureComments(lectureId);
      setComments(response.data || []);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch discussion.");
      setCommentError(message);
      toast.error(message);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const fetchCertificate = useCallback(async () => {
    if (!studentUser || !enrolled) {
      setCertificate(null);
      setCertificateError("");
      return;
    }

    try {
      setLoadingCertificate(true);
      setCertificateError("");
      const response = await getCertificate(id);
      setCertificate(response.data || null);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch certificate.");
      setCertificateError(message);
      toast.error(message);
    } finally {
      setLoadingCertificate(false);
    }
  }, [enrolled, id, studentUser]);

  const fetchQuiz = useCallback(async (lectureId) => {
    if (!lectureId) {
      setQuiz(null);
      setQuizError("");
      return;
    }

    try {
      setLoadingQuiz(true);
      setQuizError("");
      const response = await getQuizByLecture(lectureId);
      setQuiz(response.data || null);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch quiz.");

      if (message.toLowerCase().includes("quiz not found")) {
        setQuiz(null);
        setQuizError("");
      } else {
        setQuizError(message);
        toast.error(message);
      }
    } finally {
      setLoadingQuiz(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollmentStatus();
  }, [fetchEnrollmentStatus]);

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
      setQuiz(null);
      setCertificate(null);
      setProgress(resetProgressState);
    }
  }, [canViewLectures, fetchCertificate, fetchCourseProgress, fetchLectures]);

  useEffect(() => {
    if (lectures.length === 0) {
      setSelectedLecture(null);
      return;
    }

    const nextSelectedLecture = lectures.find(
      (lecture) => lecture.id === selectedLecture?.id
    );

    setSelectedLecture(nextSelectedLecture || lectures[0]);
  }, [lectures, selectedLecture?.id]);

  useEffect(() => {
    setQuizResult(null);
    setSelectedAnswers({});
    fetchResources(selectedLecture?.id);
    fetchComments(selectedLecture?.id);
    fetchQuiz(selectedLecture?.id);
  }, [fetchComments, fetchQuiz, fetchResources, selectedLecture?.id]);

  useEffect(() => {
    setShowLectureSidebar(false);
  }, [selectedLecture?.id]);

  const isLectureCompleted = (lectureId) => {
    return (progress.completedLectureIds || []).includes(lectureId);
  };

  const handleCreateLecture = async () => {
    if (!lectureTitle.trim() || !videoUrl.trim()) {
      toast.error("Please fill all lecture fields.");
      return;
    }

    if (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
      toast.error("Please enter a valid video URL.");
      return;
    }

    try {
      setCreatingLecture(true);
      await createLecture(id, { title: lectureTitle, videoUrl });
      toast.success("Lecture created successfully.");
      setLectureTitle("");
      setVideoUrl("");
      fetchLectures();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to create lecture."));
    } finally {
      setCreatingLecture(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollInCourse(id);
      toast.success("Enrollment successful.");
      await fetchEnrollmentStatus();
      await fetchLectures();
      await fetchCourseProgress();
      await fetchCertificate();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to enroll in course."));
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
      toast.success("Lecture marked as completed.");
      await fetchCourseProgress();
      await fetchCertificate();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to mark lecture as completed."));
    } finally {
      setMarkingCompleted(false);
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
      toast.error("Please choose a file first.");
      return;
    }

    try {
      setUploadingFile(true);
      const response = await uploadFile(selectedUploadFile);
      setResourceFileUrl(response.data?.fileUrl || "");
      setUploadSuccess(true);
      toast.success("File uploaded successfully.");
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to upload file."));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadResource = async () => {
    if (!selectedLecture) {
      toast.error("Please select a lecture first.");
      return;
    }

    if (!resourceTitle.trim() || !resourceFileUrl.trim()) {
      toast.error("Please fill all resource fields.");
      return;
    }

    if (
      !resourceFileUrl.startsWith("http://") &&
      !resourceFileUrl.startsWith("https://")
    ) {
      toast.error("Please enter a valid file URL.");
      return;
    }

    try {
      setUploadingResource(true);
      await uploadResource(selectedLecture.id, {
        title: resourceTitle,
        fileUrl: resourceFileUrl,
      });
      toast.success("Resource added successfully.");
      setResourceTitle("");
      setResourceFileUrl("");
      setSelectedUploadFile(null);
      setUploadedFileName("");
      setUploadSuccess(false);
      fetchResources(selectedLecture.id);
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to add resource."));
    } finally {
      setUploadingResource(false);
    }
  };

  const handleCreateComment = async () => {
    if (!selectedLecture) {
      toast.error("Please select a lecture first.");
      return;
    }

    if (!commentMessage.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    try {
      setPostingComment(true);
      await createComment(selectedLecture.id, { message: commentMessage });
      toast.success("Comment added successfully.");
      setCommentMessage("");
      fetchComments(selectedLecture.id);
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to add comment."));
    } finally {
      setPostingComment(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!selectedLecture) {
      toast.error("Please select a lecture first.");
      return;
    }

    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title.");
      return;
    }

    try {
      setCreatingQuiz(true);
      const response = await createQuiz(selectedLecture.id, { title: quizTitle });
      setQuiz(response.data);
      setQuizTitle("");
      toast.success("Quiz created successfully.");
      fetchQuiz(selectedLecture.id);
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to create quiz."));
    } finally {
      setCreatingQuiz(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!quiz?.quizId) {
      toast.error("Create a quiz first.");
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
      !question.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim() ||
      !correctAnswer.trim()
    ) {
      toast.error("Please fill all question fields.");
      return;
    }

    try {
      setAddingQuestion(true);
      await addQuestion(quiz.quizId, questionForm);
      setQuestionForm({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      toast.success("Question added successfully.");
      fetchQuiz(selectedLecture?.id);
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to add question."));
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

    if ((quiz.questions || []).length === 0) {
      toast.error("This quiz has no questions yet.");
      return;
    }

    try {
      setSubmittingQuiz(true);
      const response = await submitQuiz(quiz.quizId, {
        answers: selectedAnswers,
      });
      setQuizResult(response.data);
      toast.success("Quiz submitted successfully.");
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to submit quiz."));
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
      toast.error("Please allow pop-ups to download the certificate.");
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
  const progressPercentage = Math.round(progress.progressPercentage || 0);
  const lectureInsights = [
    {
      label: "Lecture count",
      value: String(lectures.length),
      accent: "from-sky-500/12 to-cyan-500/10",
    },
    {
      label: "Access",
      value: adminUser ? "Admin" : enrolled ? "Unlocked" : "Locked",
      accent: "from-violet-500/12 to-fuchsia-500/10",
    },
    {
      label: "Progress",
      value: studentUser ? `${progressPercentage}%` : "Live",
      accent: "from-emerald-500/12 to-teal-500/10",
    },
  ];

  const handleSelectLecture = (lecture) => {
    setSelectedLecture(lecture);
    setShowLectureSidebar(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950">
      <Navbar />

      <main className="app-shell py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="button-secondary"
          >
            Back to Courses
          </button>

          <span className="badge-premium">Course ID {id}</span>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="surface-card hero-gradient overflow-hidden p-6 sm:p-8 md:p-10"
        >
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:gap-8">
            <div>
              <span className="badge-premium">Course workspace</span>
              <h1 className="mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl md:text-5xl">
                A premium learning experience for lectures, resources, progress, and assessment.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                This workspace keeps teaching operations and learning flow in one place:
                watch lectures, unlock materials, track completion, join discussion,
                take quizzes, and finish with a certificate.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {lectureInsights.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 * index }}
                >
                  <InsightCard
                    label={item.label}
                    value={item.value}
                    accent={item.accent}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.75fr_0.85fr] xl:gap-8">
          <div className="space-y-8">
            {studentUser && !checkingEnrollment && !enrolled ? (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="surface-card p-6 sm:p-8"
              >
                <SectionHeader
                  title="Enrollment required"
                  description="Unlock lectures, resources, quizzes, and completion tracking by enrolling in this course."
                />
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="button-primary"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              </motion.section>
            ) : null}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="surface-card p-5 sm:p-6"
            >
              <SectionHeader
                title="Learning player"
                description="Choose a lecture from the sidebar to update the video, resources, discussion, and quiz."
                badge={`${lectures.length} lectures`}
              />

              {lectureError ? (
                <div className="mb-5">
                  <InlineError message={lectureError} onRetry={fetchLectures} />
                </div>
              ) : null}

              {checkingEnrollment || loadingLectures ? (
                <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="surface-soft space-y-3 p-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="rounded-3xl border border-white/10 p-4">
                        <LoadingSkeleton className="h-4 w-20" />
                        <LoadingSkeleton className="mt-4 h-5 w-4/5" />
                        <LoadingSkeleton className="mt-3 h-3 w-1/3" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <LoadingSkeleton className="aspect-video w-full rounded-3xl" />
                    <div className="surface-soft p-5">
                      <LoadingSkeleton className="h-6 w-40" />
                      <LoadingSkeleton className="mt-4 h-4 w-full" />
                      <LoadingSkeleton className="mt-2 h-4 w-5/6" />
                      <LoadingSkeleton className="mt-6 h-11 w-44" />
                    </div>
                  </div>
                </div>
              ) : !canViewLectures ? null : lectures.length === 0 ? (
                <EmptyState
                  title="No lectures available yet"
                  description="Once lectures are added to this course, the learning player and the full student experience will appear here."
                />
              ) : (
                <>
                  <div className="xl:hidden">
                    <button
                      type="button"
                      onClick={() => setShowLectureSidebar(true)}
                      className="button-secondary w-full justify-between"
                    >
                      <span>Browse Lectures</span>
                      <span className="text-slate-400">{lectures.length}</span>
                    </button>
                  </div>

                  {showLectureSidebar ? (
                    <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm xl:hidden">
                      <div className="app-shell flex h-full items-end py-4 sm:items-center">
                        <div className="surface-card flex max-h-[85vh] w-full flex-col overflow-hidden p-4 sm:p-5">
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-100">
                                Lecture navigation
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Choose a lecture to update the player and learning tools.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowLectureSidebar(false)}
                              className="button-secondary !h-11 !w-11 !px-0 !py-0"
                              aria-label="Close lecture navigation"
                            >
                              X
                            </button>
                          </div>

                          <div className="scrollbar-soft flex-1 space-y-3 overflow-auto pr-1">
                            {lectures.map((lecture, index) => {
                              const activeLecture = selectedLecture?.id === lecture.id;
                              const completedLecture = isLectureCompleted(lecture.id);

                              return (
                                <motion.button
                                  key={lecture.id}
                                  type="button"
                                  whileHover={{ y: -2 }}
                                  onClick={() => handleSelectLecture(lecture)}
                                  className={`w-full rounded-3xl border p-4 text-left transition ${
                                    activeLecture
                                      ? "border-cyan-400/25 bg-indigo-500/10 shadow-lg"
                                      : "border-white/10 bg-slate-900/70 hover:border-cyan-400/15 hover:bg-slate-900"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span
                                      className={`mt-1 h-3 w-3 rounded-full ${
                                        completedLecture ? "bg-emerald-400" : "bg-slate-700"
                                      }`}
                                    />

                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Lecture {index + 1}
                                      </p>
                                      <p className="mt-2 break-words text-sm font-semibold text-slate-100">
                                        {lecture.title}
                                      </p>
                                      <p className="mt-3 text-xs text-slate-400">
                                        {completedLecture ? "Completed" : "Pending"}
                                      </p>
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex min-w-0 flex-col gap-5 xl:flex-row">
                    <aside className="surface-soft hidden w-[300px] shrink-0 xl:block">
                      <div className="scrollbar-soft max-h-[780px] overflow-auto p-4">
                        <p className="px-2 text-sm font-semibold text-slate-100">
                          Lecture navigation
                        </p>
                        <p className="px-2 pt-1 text-xs text-slate-400">
                          The active lesson updates every connected learning module below.
                        </p>

                        <div className="mt-4 space-y-3">
                          {lectures.map((lecture, index) => {
                            const activeLecture = selectedLecture?.id === lecture.id;
                            const completedLecture = isLectureCompleted(lecture.id);

                            return (
                              <motion.button
                                key={lecture.id}
                                type="button"
                                whileHover={{ y: -2 }}
                                onClick={() => handleSelectLecture(lecture)}
                                className={`w-full rounded-3xl border p-4 text-left transition ${
                                  activeLecture
                                    ? "border-cyan-400/25 bg-indigo-500/10 shadow-lg"
                                    : "border-white/10 bg-slate-900/70 hover:border-cyan-400/15 hover:bg-slate-900"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={`mt-1 h-3 w-3 rounded-full ${
                                      completedLecture ? "bg-emerald-400" : "bg-slate-700"
                                    }`}
                                  />

                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                      Lecture {index + 1}
                                    </p>
                                    <p className="mt-2 break-words text-sm font-semibold text-slate-100">
                                      {lecture.title}
                                    </p>
                                    <p className="mt-3 text-xs text-slate-400">
                                      {completedLecture ? "Completed" : "Pending"}
                                    </p>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </aside>

                    <div className="min-w-0 flex-1 space-y-4">
                    <div className="overflow-hidden rounded-[24px] border border-slate-900/70 bg-slate-950 shadow-premium sm:rounded-[28px]">
                      {embeddedVideoUrl ? (
                        <div className="aspect-video w-full">
                          <iframe
                            title={selectedLecture?.title || "Lecture video"}
                            src={embeddedVideoUrl}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-slate-300 sm:px-6">
                          This lecture does not have a supported YouTube embed link yet. You can still open the original video in a new tab.
                        </div>
                      )}
                    </div>

                    <div className="surface-soft p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="badge-premium">Now playing</span>
                        <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-400">
                          Lecture ID {selectedLecture?.id}
                        </span>
                      </div>

                      <h3 className="mt-5 break-words text-2xl font-semibold text-slate-100 sm:text-3xl">
                        {selectedLecture?.title}
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-slate-400">
                        Stay in the flow from here: watch the lecture, open the support materials, join the discussion, complete the lesson, and move into the quiz when it is ready.
                      </p>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {studentUser && selectedLecture ? (
                          <button
                            type="button"
                            onClick={handleMarkCompleted}
                            disabled={markingCompleted || isLectureCompleted(selectedLecture.id)}
                            className={
                              isLectureCompleted(selectedLecture.id)
                                ? "inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-300 sm:w-auto"
                                : "button-primary"
                            }
                          >
                            {isLectureCompleted(selectedLecture.id)
                              ? "Completed"
                              : markingCompleted
                                ? "Marking..."
                                : "Mark as Completed"}
                          </button>
                        ) : null}

                        {selectedLecture?.videoUrl ? (
                          <a
                            href={selectedLecture.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="button-secondary w-full sm:w-auto"
                          >
                            Open Video in New Tab
                          </a>
                        ) : null}
                      </div>
                    </div>
                    </div>
                  </div>
                </>
              )}
            </motion.section>

            {canViewLectures && selectedLecture ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="surface-card p-5 sm:p-6"
              >
                <SectionHeader
                  title="Resources"
                  description={`Files and PDFs for ${selectedLecture.title}.`}
                />

                {resourceError ? (
                  <div className="mb-5">
                    <InlineError
                      message={resourceError}
                      onRetry={() => fetchResources(selectedLecture.id)}
                    />
                  </div>
                ) : null}

                {adminUser ? (
                  <div className="mb-6 surface-soft p-4 sm:p-5">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Upload lecture resource
                    </h3>

                    <div className="mt-4 grid gap-4">
                      <input
                        type="text"
                        placeholder="Resource title"
                        value={resourceTitle}
                        onChange={(event) => setResourceTitle(event.target.value)}
                        disabled={uploadingResource}
                        className="input-premium"
                      />

                      <div className="rounded-3xl border-2 border-dashed border-white/10 bg-slate-950/50 p-4 backdrop-blur transition hover:border-cyan-400/20 hover:bg-slate-950/70 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-100">
                              Cloudinary upload
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              Choose a PDF, image, or thumbnail and we will auto-fill the resource URL.
                            </p>
                          </div>

                          <label className="button-secondary w-full cursor-pointer sm:w-auto">
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
                          <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
                            {uploadedFileName || "No file selected yet"}
                          </div>

                          <button
                            type="button"
                            onClick={handleUploadSelectedFile}
                            disabled={uploadingFile || !selectedUploadFile}
                            className="button-primary w-full sm:w-auto"
                          >
                            {uploadingFile ? "Uploading..." : "Upload File"}
                          </button>
                        </div>

                        {uploadSuccess ? (
                          <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-300">
                            Upload complete. The file URL is ready below.
                          </div>
                        ) : null}
                      </div>

                      <input
                        type="text"
                        placeholder="Uploaded file URL will appear here"
                        value={resourceFileUrl}
                        onChange={(event) => setResourceFileUrl(event.target.value)}
                        disabled={uploadingResource}
                        className="input-premium"
                      />

                      <button
                        type="button"
                        onClick={handleUploadResource}
                        disabled={uploadingResource}
                        className="button-primary w-full sm:w-auto"
                      >
                        {uploadingResource ? "Adding Resource..." : "Add Resource"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {loadingResources ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="surface-soft p-5">
                        <LoadingSkeleton className="h-12 w-12 rounded-2xl" />
                        <LoadingSkeleton className="mt-4 h-5 w-3/4" />
                        <LoadingSkeleton className="mt-3 h-4 w-full" />
                        <LoadingSkeleton className="mt-6 h-10 w-36" />
                      </div>
                    ))}
                  </div>
                ) : resources.length === 0 ? (
                  <EmptyState
                    title="No resources for this lecture yet"
                    description="Once supporting files are added, learners will be able to open and download them here."
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        className="surface-soft p-5"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-sm font-semibold text-rose-300">
                          PDF
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-100">
                          {resource.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-400">
                          Resource for {selectedLecture.title}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="button-primary"
                          >
                            Open PDF
                          </a>
                          <a
                            href={resource.fileUrl}
                            download
                            className="button-secondary"
                          >
                            Download
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            ) : null}

            {canViewLectures && selectedLecture ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="surface-card p-5 sm:p-6"
              >
                <SectionHeader
                  title="Discussion"
                  description={`Questions and discussion for ${selectedLecture.title}.`}
                />

                {commentError ? (
                  <div className="mb-5">
                    <InlineError
                      message={commentError}
                      onRetry={() => fetchComments(selectedLecture.id)}
                    />
                  </div>
                ) : null}

                <div className="surface-soft p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Add Comment
                  </h3>

                  <div className="mt-4 space-y-4">
                    <textarea
                      placeholder="Share a thought, ask a question, or leave a note..."
                      value={commentMessage}
                      onChange={(event) => setCommentMessage(event.target.value)}
                      rows="4"
                      disabled={postingComment}
                      className="input-premium"
                    />

                    <button
                      type="button"
                      onClick={handleCreateComment}
                      disabled={postingComment}
                      className="button-primary w-full sm:w-auto"
                    >
                      {postingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {loadingComments ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="surface-soft p-5">
                          <div className="flex items-start gap-4">
                            <LoadingSkeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-1">
                              <LoadingSkeleton className="h-4 w-1/3" />
                              <LoadingSkeleton className="mt-2 h-3 w-1/4" />
                              <LoadingSkeleton className="mt-4 h-4 w-full" />
                              <LoadingSkeleton className="mt-2 h-4 w-4/5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <EmptyState
                      title="No comments yet"
                      description="Start the discussion for this lecture. Even one good question is enough to make the space feel alive."
                    />
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment, index) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                          className="surface-soft p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-400/20 text-sm font-bold text-cyan-300">
                              {getInitials(comment.userEmail)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="truncate text-sm font-semibold text-slate-100">
                                  {comment.userEmail}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatTimestamp(comment.createdAt)}
                                </p>
                              </div>
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                                {comment.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            ) : null}

            {canViewLectures && selectedLecture ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="surface-card p-5 sm:p-6"
              >
                <SectionHeader
                  title="Quiz + MCQ"
                  description={`Assessment for ${selectedLecture.title}.`}
                  badge={quiz?.questions?.length ? `${quiz.questions.length} questions` : null}
                />

                {quizError ? (
                  <div className="mb-5">
                    <InlineError
                      message={quizError}
                      onRetry={() => fetchQuiz(selectedLecture.id)}
                    />
                  </div>
                ) : null}

                {loadingQuiz ? (
                  <div className="space-y-4">
                    <LoadingSkeleton className="h-28 w-full rounded-3xl" />
                    <LoadingSkeleton className="h-48 w-full rounded-3xl" />
                    <LoadingSkeleton className="h-48 w-full rounded-3xl" />
                  </div>
                ) : adminUser ? (
                  <div className="space-y-6">
                    {!quiz ? (
                      <div className="surface-soft p-4 sm:p-5">
                        <h3 className="text-lg font-semibold text-slate-100">
                          Create Quiz
                        </h3>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <input
                            type="text"
                            placeholder="Enter quiz title"
                            value={quizTitle}
                            onChange={(event) => setQuizTitle(event.target.value)}
                            disabled={creatingQuiz}
                            className="input-premium"
                          />
                          <button
                            type="button"
                            onClick={handleCreateQuiz}
                            disabled={creatingQuiz}
                            className="button-primary w-full sm:w-auto"
                          >
                            {creatingQuiz ? "Creating..." : "Create Quiz"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-indigo-500/12 to-cyan-400/10 p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                            Active Quiz
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold text-slate-100">
                            {quiz.title}
                          </h3>
                        </div>

                        <div className="surface-soft p-4 sm:p-5">
                          <h3 className="text-lg font-semibold text-slate-100">
                            Add MCQ Question
                          </h3>

                          <div className="mt-4 space-y-4">
                            <textarea
                              placeholder="Enter question"
                              value={questionForm.question}
                              onChange={(event) =>
                                setQuestionForm({
                                  ...questionForm,
                                  question: event.target.value,
                                })
                              }
                              rows="3"
                              disabled={addingQuestion}
                              className="input-premium"
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                              <input
                                type="text"
                                placeholder="Option A"
                                value={questionForm.optionA}
                                onChange={(event) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    optionA: event.target.value,
                                  })
                                }
                                disabled={addingQuestion}
                                className="input-premium"
                              />
                              <input
                                type="text"
                                placeholder="Option B"
                                value={questionForm.optionB}
                                onChange={(event) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    optionB: event.target.value,
                                  })
                                }
                                disabled={addingQuestion}
                                className="input-premium"
                              />
                              <input
                                type="text"
                                placeholder="Option C"
                                value={questionForm.optionC}
                                onChange={(event) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    optionC: event.target.value,
                                  })
                                }
                                disabled={addingQuestion}
                                className="input-premium"
                              />
                              <input
                                type="text"
                                placeholder="Option D"
                                value={questionForm.optionD}
                                onChange={(event) =>
                                  setQuestionForm({
                                    ...questionForm,
                                    optionD: event.target.value,
                                  })
                                }
                                disabled={addingQuestion}
                                className="input-premium"
                              />
                            </div>

                            <select
                              value={questionForm.correctAnswer}
                              onChange={(event) =>
                                setQuestionForm({
                                  ...questionForm,
                                  correctAnswer: event.target.value,
                                })
                              }
                              disabled={addingQuestion}
                              className="input-premium"
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
                              className="button-primary w-full sm:w-auto"
                            >
                              {addingQuestion ? "Adding..." : "Add Question"}
                            </button>
                          </div>
                        </div>

                        {(quiz.questions || []).length === 0 ? (
                          <EmptyState
                            title="Quiz created"
                            description="Add your first MCQ question to make this quiz ready for learners."
                          />
                        ) : (
                          <div className="space-y-4">
                            {quiz.questions.map((questionItem, index) => (
                              <div key={questionItem.id} className="surface-soft p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                  Question {index + 1}
                                </p>
                                <h4 className="mt-3 text-lg font-semibold text-slate-100">
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
                                      className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300"
                                    >
                                      {option.key}. {option.label}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : quiz ? (
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-indigo-500/12 to-cyan-400/10 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        Lecture Quiz
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-100">
                        {quiz.title}
                      </h3>
                    </div>

                    {(quiz.questions || []).length === 0 ? (
                      <EmptyState
                        title="Quiz exists, but no questions yet"
                        description="The quiz shell is ready. Questions will appear here once they are added."
                      />
                    ) : (
                      <div className="space-y-4">
                        {quiz.questions.map((questionItem, index) => (
                          <motion.div
                            key={questionItem.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.04 }}
                            className="surface-soft p-5"
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Question {index + 1}
                            </p>
                            <h4 className="mt-3 text-lg font-semibold text-slate-100">
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
                                    onClick={() => handleSelectAnswer(questionItem.id, option.key)}
                                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                      activeOption
                                        ? "border-cyan-400/30 bg-indigo-500/10 text-slate-100"
                                        : "border-white/10 bg-slate-950/70 text-slate-300 hover:bg-slate-950"
                                    }`}
                                  >
                                    {option.key}. {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {(quiz.questions || []).length > 0 ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={submittingQuiz}
                          className="button-primary w-full sm:w-auto"
                        >
                          {submittingQuiz ? "Submitting..." : "Submit Quiz"}
                        </button>

                        {quizResult ? (
                          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-200">
                            <p className="font-semibold">
                              Score: {quizResult.score}/{quizResult.totalQuestions}
                            </p>
                            <p className="mt-1">
                              Percentage: {quizResult.percentage}%
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyState
                    title="No quiz available yet"
                    description="This lecture does not have a quiz yet. Once one exists, it will render here clearly for learners."
                  />
                )}
              </motion.section>
            ) : null}
          </div>

          <div className="space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="surface-card p-5 sm:p-6"
            >
              <SectionHeader
                title="Course insights"
                description="A quick high-signal view of access, lecture state, and completion."
              />

              <div className="grid gap-4">
                <div className="surface-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Course ID
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-100">
                    {id}
                  </p>
                </div>

                <div className="surface-soft p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Access
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-100">
                    {studentUser
                      ? enrolled
                        ? "Enrolled and active"
                        : checkingEnrollment
                          ? "Checking enrollment"
                          : "Enrollment required"
                      : adminUser
                        ? "Admin access"
                        : "Viewer access"}
                  </p>
                </div>

                {selectedLecture && canViewLectures ? (
                  <div className="surface-soft p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Current lecture
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-100">
                      {selectedLecture.title}
                    </p>
                  </div>
                ) : null}
              </div>
            </motion.section>

            {studentUser && canViewLectures ? (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 }}
              className="surface-card p-5 sm:p-6"
              >
                <SectionHeader
                  title="Progress"
                  description="Completion builds lecture by lecture."
                />

                {progressError ? (
                  <div className="mb-4">
                    <InlineError
                      message={progressError}
                      onRetry={fetchCourseProgress}
                    />
                  </div>
                ) : null}

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/12 to-emerald-400/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        Course Progress
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {progress.completedLectures} of {progress.totalLectures} lectures completed
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progressPercentage || 0}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    />
                  </div>
                </div>
              </motion.section>
            ) : null}

            {adminUser ? (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 }}
              className="surface-card p-5 sm:p-6"
              >
                <SectionHeader
                  title="Create Lecture"
                  description="Add a new video lesson without leaving the course workspace."
                />

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Lecture title"
                    value={lectureTitle}
                    onChange={(event) => setLectureTitle(event.target.value)}
                    disabled={creatingLecture}
                    className="input-premium"
                  />

                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                    disabled={creatingLecture}
                    className="input-premium"
                  />

                  <button
                    type="button"
                    onClick={handleCreateLecture}
                    disabled={creatingLecture}
                    className="button-primary w-full"
                  >
                    {creatingLecture ? "Creating Lecture..." : "Create Lecture"}
                  </button>
                </div>
              </motion.section>
            ) : null}

            {studentUser && canViewLectures ? (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.12 }}
                className="surface-card p-6"
              >
                <SectionHeader
                  title="Certificate"
                  description="Complete the course to unlock your certificate."
                />

                {certificateError ? (
                  <div className="mb-4">
                    <InlineError
                      message={certificateError}
                      onRetry={fetchCertificate}
                    />
                  </div>
                ) : null}

                {loadingCertificate ? (
                  <div className="surface-soft p-5">
                    <LoadingSkeleton className="h-5 w-36" />
                    <LoadingSkeleton className="mt-4 h-4 w-full" />
                    <LoadingSkeleton className="mt-2 h-4 w-4/5" />
                    <LoadingSkeleton className="mt-6 h-36 w-full rounded-3xl" />
                  </div>
                ) : certificate?.eligible ? (
                  <div className="rounded-[24px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.2),_transparent_30%),linear-gradient(180deg,_rgba(30,41,59,0.98),_rgba(15,23,42,0.98))] p-5 shadow-premium sm:rounded-[28px] sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      EduCore LMS
                    </p>
                    <h3 className="mt-4 text-xl font-semibold text-slate-100 sm:text-2xl">
                      Certificate of Completion
                    </h3>
                    <p className="mt-4 text-sm text-slate-400">
                      Awarded to
                    </p>
                    <p className="mt-1 break-words text-lg font-semibold text-slate-100 sm:text-xl">
                      {certificate.studentName}
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                      for successfully completing
                    </p>
                    <p className="mt-1 break-words text-base font-semibold text-cyan-300 sm:text-lg">
                      {certificate.courseTitle}
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                      Completion date: {formatTimestamp(certificate.completionDate)}
                    </p>

                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="button-primary mt-6 w-full"
                    >
                      Download Certificate
                    </button>
                  </div>
                ) : (
                  <div className="surface-soft p-5">
                    <p className="text-base font-semibold text-slate-100">
                      Certificate Locked
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">
                      Reach 100% course progress to unlock your printable course certificate.
                    </p>
                  </div>
                )}
              </motion.section>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CourseDetails;
