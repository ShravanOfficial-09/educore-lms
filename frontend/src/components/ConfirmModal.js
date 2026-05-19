import { motion, AnimatePresence } from "framer-motion";

function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) {
    return <AnimatePresence />;
  }

  const confirmClassName =
    confirmVariant === "danger"
      ? "bg-rose-500 hover:bg-rose-400 focus:ring-rose-400/20"
      : "bg-gradient-to-r from-indigo-500 to-cyan-400 hover:opacity-95 focus:ring-cyan-400/20";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-premium backdrop-blur-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Please Confirm
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-slate-100">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {description}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="button-secondary"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
            >
              {loading ? "Please wait..." : confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ConfirmModal;
