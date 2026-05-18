import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  checkEnrollment,
  createLecture,
  enrollInCourse,
  getLecturesByCourse,
} from "../services/api";
import { isAdmin, isStudent } from "../utils/auth";

const getYouTubeEmbedUrl = (url) => {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (host === "youtube.com" && parsedUrl.pathname.includes("/embed/")) {
      return url;
    }

    return "";
  } catch (error) {
    console.log("Invalid YouTube URL:", error);
    return "";
  }
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

  const adminUser = isAdmin();
  const studentUser = isStudent();
  const canViewLectures = adminUser || !studentUser || enrolled;

  const fetchLectures = async () => {
    try {
      const response = await getLecturesByCourse(id);
      console.log(response);
      setLectures(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch lectures");
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
      alert("Failed to check enrollment status");
    } finally {
      setCheckingEnrollment(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentStatus();
  }, [id]);

  useEffect(() => {
    if (canViewLectures) {
      fetchLectures();
    } else {
      setLectures([]);
      setSelectedLecture(null);
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
      const lectureData = {
        title: lectureTitle,
        videoUrl,
      };

      await createLecture(id, lectureData);

      alert("Lecture created successfully");

      setLectureTitle("");
      setVideoUrl("");

      fetchLectures();
    } catch (error) {
      console.log(error);
      alert("Failed to create lecture");
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);

      await enrollInCourse(id);

      alert("Enrollment successful");
      setEnrolled(true);
      fetchLectures();
    } catch (error) {
      console.log(error);
      alert("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
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
              Learning Workspace
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Course #{id}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-sky-50 sm:text-base">
              Learn through structured video lectures, track course access, and
              manage content from one professional course space.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 xl:grid-cols-[1.6fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Course Overview
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This course page is connected to your backend lecture and
                  enrollment APIs. Students can unlock lessons through
                  enrollment, and admins can keep course content updated from
                  the same screen.
                </p>
              </div>

              {studentUser && !checkingEnrollment && !enrolled && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Enrollment Required
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Enroll in this course to unlock the lecture library and
                    start learning right away.
                  </p>

                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="mt-5 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                </div>
              )}

              {checkingEnrollment ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Checking enrollment status...
                </div>
              ) : canViewLectures ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Course Lectures
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Pick a lecture from the sidebar to start watching.
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {lectures.length} Lectures
                    </span>
                  </div>

                  {lectures.length === 0 ? (
                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">
                      No lectures available for this course yet.
                    </div>
                  ) : (
                    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                      <aside className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                        <div className="mb-3 px-2 pt-2">
                          <p className="text-sm font-semibold text-slate-900">
                            Lecture Sidebar
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Select a lesson to update the player.
                          </p>
                        </div>

                        <div className="space-y-2">
                          {lectures.map((lecture, index) => {
                            const activeLecture =
                              selectedLecture?.id === lecture.id;

                            return (
                              <button
                                key={lecture.id}
                                type="button"
                                onClick={() => setSelectedLecture(lecture)}
                                className={
                                  activeLecture
                                    ? "w-full rounded-xl border border-sky-200 bg-sky-50 px-4 py-4 text-left shadow-sm transition"
                                    : "w-full rounded-xl border border-transparent bg-slate-50 px-4 py-4 text-left transition hover:border-slate-200 hover:bg-slate-100"
                                }
                              >
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Lecture {index + 1}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">
                                  {lecture.title}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                  ID: {lecture.id}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </aside>

                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
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
                            <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-slate-300">
                              This lecture does not contain a supported YouTube
                              link for embedding yet.
                            </div>
                          )}
                        </div>

                        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              Now Playing
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              Lecture ID: {selectedLecture?.id}
                            </span>
                          </div>

                          <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                            {selectedLecture?.title}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            Watch the selected lecture here. Students can move
                            through the lecture list from the sidebar, while
                            admins can continue adding new content from the
                            course tools panel.
                          </p>

                          {selectedLecture?.videoUrl && (
                            <a
                              href={selectedLecture.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                              Open Video in New Tab
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              {adminUser ? (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create Lecture
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Add new lectures and video resources for this course.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Lecture Title
                      </label>

                      <input
                        type="text"
                        placeholder="Enter lecture title"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Video URL
                      </label>

                      <input
                        type="text"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateLecture}
                      className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Create Lecture
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Course Info
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {studentUser
                      ? enrolled
                        ? "You are enrolled in this course and can access the full lecture experience."
                        : "Enroll in this course to unlock lecture content."
                      : "You can view all lectures for this course here."}
                  </p>

                  <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Course ID
                    </p>

                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {id}
                    </p>
                  </div>

                  {selectedLecture && canViewLectures && (
                    <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Current Lecture
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {selectedLecture.title}
                      </p>
                    </div>
                  )}
                </>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CourseDetails;
