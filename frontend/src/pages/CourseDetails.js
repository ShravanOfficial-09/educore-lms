import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
              Course Details
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Placeholder Course Title
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-50 sm:text-base">
              This page can later be connected to your backend course details
              API. For now, it gives you a clean layout for individual course
              pages.
            </p>
          </div>

          <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Course Description
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Placeholder description for this course. You can later replace
                  this text with real course data fetched from your backend
                  using the course ID from the route.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Lecture Section
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-900">
                      Lecture 1
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Introduction to the course
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-900">
                      Lecture 2
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Core concepts and examples
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                    <p className="text-sm font-medium text-slate-900">
                      Lecture 3
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Practice and next steps
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Course Info
              </h2>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Course ID
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {id}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    Ready for API integration
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
