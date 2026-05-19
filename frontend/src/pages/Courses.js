import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Navbar from "../components/Navbar";
import { createCourse, getCourses } from "../services/api";
import { isAdmin } from "../utils/auth";

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

const dashboardStats = (coursesLength, adminUser) => [
  {
    label: "Courses available",
    value: String(coursesLength),
    tone: "from-sky-500/15 to-cyan-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    label: "Workspace mode",
    value: adminUser ? "Admin" : "Learner",
    tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    label: "Backend sync",
    value: "Live",
    tone: "from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300",
  },
];

const CourseCardSkeleton = () => (
  <div className="glass-card p-6">
    <LoadingSkeleton className="h-4 w-20" />
    <LoadingSkeleton className="mt-4 h-6 w-2/3" />
    <LoadingSkeleton className="mt-5 h-4 w-full" />
    <LoadingSkeleton className="mt-2 h-4 w-5/6" />
    <LoadingSkeleton className="mt-6 h-11 w-36" />
  </div>
);

function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  const navigate = useNavigate();
  const adminUser = useMemo(() => isAdmin(), []);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setCoursesError("");

      const response = await getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.log(error);
      const message = getErrorMessage(error, "Failed to fetch courses.");
      setCoursesError(message);
      toast.error(message);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      toast.error("Please fill all course fields.");
      return;
    }

    try {
      setCreatingCourse(true);

      await createCourse({
        title,
        description,
        price: parseFloat(price),
      });

      toast.success("Course created successfully.");
      setTitle("");
      setDescription("");
      setPrice("");
      fetchCourses();
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Failed to create course."));
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="app-shell flex flex-col gap-8 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`grid gap-6 ${adminUser ? "xl:grid-cols-[1.25fr_0.75fr]" : ""}`}
        >
          <div className="surface-card hero-gradient overflow-hidden p-8">
            <span className="badge-premium">Dashboard</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-100 md:text-5xl">
              A polished control tower for every course, learner path, and teaching workflow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Move through the LMS the way modern SaaS products do: strong visual
              hierarchy, quick scanning, live course state, and clean transitions
              from catalog to classroom.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {dashboardStats(courses.length, adminUser).map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 * index }}
                  className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.tone} p-5 backdrop-blur`}
                >
                  <p className="text-3xl font-semibold text-slate-100">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {item.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {adminUser ? (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="surface-card p-6"
            >
              <h2 className="text-2xl font-semibold text-slate-100">
                Create Course
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Launch a new course with the same clean premium structure students will see downstream.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-100">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Advanced React Fundamentals"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    disabled={creatingCourse}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-100">
                    Description
                  </label>
                  <textarea
                    placeholder="Summarize the promise of the course and what learners will get from it."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows="4"
                    disabled={creatingCourse}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-100">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="4999"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    disabled={creatingCourse}
                    className="input-premium"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateCourse}
                  disabled={creatingCourse}
                  className="button-primary w-full"
                >
                  {creatingCourse ? "Creating Course..." : "Create Course"}
                </button>
              </div>
            </motion.div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="surface-card p-6"
        >
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="badge-premium">Catalog</span>
              <h2 className="mt-4 text-3xl font-semibold text-slate-100">
                Course library
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Browse, scan, and enter any course workspace from one refined catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCourses}
              disabled={loadingCourses}
              className="button-secondary"
            >
              {loadingCourses ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {coursesError && !loadingCourses ? (
            <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {coursesError}
            </div>
          ) : null}

          {loadingCourses ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={index} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="surface-soft flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-xl font-semibold text-slate-100">
                0
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-slate-100">
                No courses published yet
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                Once courses are created, they will appear here with direct paths into lectures, progress tracking, resources, quizzes, and certificates.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course, index) => (
                <motion.button
                  key={course.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="group surface-card flex h-full flex-col p-6 text-left transition hover:-translate-y-1.5 hover:border-cyan-400/20 hover:shadow-premium"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="badge-premium">Course</span>
                      <h3 className="mt-4 text-2xl font-semibold text-slate-100">
                        {course.title}
                      </h3>
                    </div>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
                      Rs. {course.price}
                    </span>
                  </div>

                  <p className="mt-5 flex-1 text-sm leading-7 text-slate-400">
                    {course.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
                    <span className="font-semibold text-slate-100">
                      Open workspace
                    </span>
                    <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-100">
                      ->
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

export default Courses;
