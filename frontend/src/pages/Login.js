import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || fallbackMessage;
};

const stats = [
  { label: "Courses live", value: "120+" },
  { label: "Completion events", value: "14k" },
  { label: "Resources shared", value: "3.2k" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter both email and password.");
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const response = await loginUser(email, password);

      localStorage.setItem("token", response.data.token);

      toast.success("Welcome back. Login successful.");
      navigate("/courses");
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      const message = getErrorMessage(error, "Login failed. Please try again.");
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(34,211,238,0.2),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),_transparent_20%)]" />

      <div className="app-shell relative flex min-h-screen flex-col py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-cyan-500/20">
              EC
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-100">
                EduCore LMS
              </p>
              <p className="text-sm text-slate-400">
                Premium learning ops
              </p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="hidden lg:block"
          >
            <span className="badge-premium">Premium SaaS workspace</span>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-tight text-slate-100 xl:text-6xl">
              The calm command center for courses, teaching, progress, and learner momentum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Built for modern LMS teams who want the clarity of Notion, the polish
              of Stripe, and the operational sharpness of a real product dashboard.
            </p>

            <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-3">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08 * index }}
                  className="surface-card p-5"
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
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="surface-card w-full max-w-xl justify-self-center p-8 sm:p-10"
          >
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-bold text-white">
                EC
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">
                  EduCore LMS
                </p>
                <p className="text-sm text-slate-400">
                  Premium workspace
                </p>
              </div>
            </div>

            <span className="mt-4 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Welcome back
            </span>
            <h2 className="mt-5 text-3xl font-semibold text-slate-100">
              Sign in to your workspace
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Continue managing lectures, uploads, certifications, learner progress, and course operations.
            </p>

            {formError ? (
              <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@educore.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={submitting}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  className="input-premium"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="button-primary w-full"
              >
                {submitting ? "Signing in..." : "Enter EduCore"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
              Role-aware controls stay automatic, so admins, instructors, and learners all land in the right experience.
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default Login;
