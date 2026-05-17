import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createCourse, getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      console.log(response);
      setCourses(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch courses");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!title || !description || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      const courseData = {
        title,
        description,
        price: parseFloat(price),
      };

      await createCourse(courseData);

      alert("Course created successfully");

      setTitle("");
      setDescription("");
      setPrice("");

      fetchCourses();
    } catch (error) {
      console.log(error);
      alert("Failed to create course");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
              Course Management
            </span>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Build and organize your LMS courses
            </h1>

            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Create new courses from one place and keep your catalog easy to
              browse for students and admins.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Create Course
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add a title, description, and price to publish a new course.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Title
                </label>

                <input
                  type="text"
                  placeholder="Enter course title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  placeholder="Enter course description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price
                </label>

                <input
                  type="number"
                  placeholder="Enter course price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <button
                onClick={handleCreateCourse}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Create Course
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Available Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Browse all courses currently available in your LMS.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              {courses.length} Courses
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
              No courses available yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {course.title}
                    </h3>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      Rs. {course.price}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {course.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Courses;
