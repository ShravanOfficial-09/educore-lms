import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModal";

function Navbar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      localStorage.removeItem("token");
      toast.success("You have been logged out.");
      navigate("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl"
      >
        <nav className="app-shell flex items-center justify-between py-4">
          <Link to="/courses" className="group flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition duration-200 group-hover:scale-105">
              EC
            </div>

            <div>
              <p className="text-lg font-semibold text-slate-100">
                EduCore LMS
              </p>
              <p className="text-sm text-slate-400">
                Modern learning workspace
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="button-ghost"
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
