import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  checkEnrollment,
  createLecture,
  enrollInCourse,
  getLecturesByCourse,
} from "../services/api";
import { isAdmin, isStudent } from "../utils/auth";

function CourseDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [enrolled, setEnrolled] = useState(false);

  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const [enrolling, setEnrolling] = useState(false);

  const adminUser = useMemo(() => isAdmin(), []);

  const studentUser = useMemo(() => isStudent(), []);

  const canViewLectures =
    adminUser || !studentUser || enrolled;

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
    }

  }, [id, canViewLectures]);

  const handleCreateLecture = async () => {

    if (!lectureTitle || !videoUrl) {

      alert("Please fill all fields");

      return;
    }

    if (
      !videoUrl.startsWith("http://")
      && !videoUrl.startsWith("https://")
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

    } catch (error) {

      console.log(error);

      alert("Failed to enroll in course");

    } finally {

      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate("/courses")}
          className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back to Courses
        </button>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* HERO */}
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-10 text-white sm:px-8">

            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-100">
              Course Details
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Course #{id}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">
              View lectures for this course and keep your learning content
              organized in one place.
            </p>

          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* LEFT SIDE */}
            <div className="space-y-6">

              {/* COURSE OVERVIEW */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                <h2 className="text-lg font-semibold text-slate-900">
                  Course Overview
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This course details page is connected to your backend lecture
                  and enrollment APIs.
                </p>

              </div>

              {/* ENROLLMENT CARD */}
              {studentUser && !checkingEnrollment && !enrolled && (

                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6">

                  <h2 className="text-lg font-semibold text-slate-900">
                    Enrollment Required
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Enroll in this course to unlock lectures and start learning.
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

              {/* LOADING */}
              {checkingEnrollment ? (

                <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  Checking enrollment status...
                </div>

              ) : canViewLectures ? (

                /* LECTURE SECTION */
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                  <div className="mb-4 flex items-center justify-between">

                    <h2 className="text-lg font-semibold text-slate-900">
                      Lecture List
                    </h2>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      {lectures.length} Lectures
                    </span>

                  </div>

                  {lectures.length === 0 ? (

                    <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-xl bg-white p-6 text-sm text-slate-500 ring-1 ring-slate-200">
                      No lectures available for this course yet.
                    </div>

                  ) : (

                    <div className="mt-4 space-y-3">

                      {lectures.map((lecture) => (

                        <div
                          key={lecture.id}
                          className="rounded-xl bg-white p-4 transition ring-1 ring-slate-200 hover:shadow-sm"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <p className="text-sm font-semibold text-slate-900">
                                {lecture.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Lecture ID: {lecture.id}
                              </p>

                            </div>

                            <a
                              href={lecture.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-200"
                            >
                              Watch Video
                            </a>

                          </div>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              ) : null}

            </div>

            {/* RIGHT SIDE */}
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
                        placeholder="https://youtube.com/..."
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
                        ? "You are enrolled in this course and can access all lectures."
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