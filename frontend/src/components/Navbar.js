import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";
import { clearAuthToken } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      clearAuthToken();
      toast.success("You have been logged out.");
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
      setMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinkClassName = (active) =>
    `rounded-2xl px-4 py-2 text-sm font-medium transition duration-200 ${
      active
        ? "bg-slate-900 text-slate-100 ring-1 ring-white/10"
        : "text-slate-400 hover:bg-slate-900/70 hover:text-slate-100"
    }`;

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl"
      >
        <nav className="app-shell py-4">
          <div className="flex items-center justify-between gap-3">
            <Link to="/courses" className="group min-w-0 flex items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition duration-200 group-hover:scale-105 sm:h-12 sm:w-12">
                EC
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-100 sm:text-lg">
                  EduCore LMS
                </p>
                <p className="truncate text-xs text-slate-400 sm:text-sm">
                  Modern learning workspace
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/courses"
                className={navLinkClassName(location.pathname.startsWith("/courses"))}
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="button-secondary"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 text-slate-100 transition hover:border-cyan-400/20 hover:bg-slate-900 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-lg">{mobileMenuOpen ? "X" : "="}</span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {mobileMenuOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden md:hidden"
              >
                <div className="mt-4 space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                  <Link
                    to="/courses"
                    onClick={closeMobileMenu}
                    className={`${navLinkClassName(
                      location.pathname.startsWith("/courses")
                    )} flex w-full items-center justify-center`}
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      setShowLogoutModal(true);
                    }}
                    className="button-secondary w-full"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </nav>
      </motion.header>

      <ConfirmModal
        open={showLogoutModal}
        title="Log out of EduCore?"
        description="You will return to the login screen. Your course updates and progress stay safely saved."
        confirmText="Log Out"
        loading={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default Navbar;
