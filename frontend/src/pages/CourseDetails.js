import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  createLecture,
  getLecturesByCourse,
} from "../services/api";

function CourseDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);

  const [lectureTitle, setLectureTitle] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

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

  useEffect(() => {

    fetchLectures();

  }, [id]);

  const handleCreateLecture = async () => {

    // VALIDATION
    if (!lectureTitle || !videoUrl) {
      alert("Please fill all fields");
      return;
    }

    // SIMPLE URL VALIDATION
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

      // CLEAR FORM
      setLectureTitle("");
      setVideoUrl("");

      // REFRESH LECTURES
      fetchLectures();

    } catch (error) {

      console.log(error);

      alert("Failed to create lecture");
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
              Manage lectures for this course and keep your learning content
              organized in one place.
            </p>

          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* LEFT SIDE */}
            <div className="space-y-6">

              {/* OVERVIEW */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

                <h2 className="text-lg font-semibold text-slate-900">
                  Course Overview
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This course details page is connected to your backend lecture
                  APIs. You can create lectures dynamically and manage course
                  learning content here.
                </p>

              </div>

              {/* LECTURES */}
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
                        className="rounded-xl bg-white p-4 transition hover:shadow-sm ring-1 ring-slate-200"
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

            </div>

            {/* RIGHT SIDE */}
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

              <h2 className="text-lg font-semibold text-slate-900">
                Create Lecture
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add new lectures and video resources for this course.
              </p>

              <div className="mt-6 space-y-4">

                {/* TITLE */}
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

                {/* VIDEO URL */}
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

                {/* BUTTON */}
                <button
                  type="button"
                  onClick={handleCreateLecture}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Create Lecture
                </button>

                {/* COURSE INFO */}
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Course ID
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {id}
                  </p>

                </div>

              </div>

            </aside>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CourseDetails;