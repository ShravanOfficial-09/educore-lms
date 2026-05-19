import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme } from "../utils/theme";

function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const nextTheme = getStoredTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggleTheme}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/70 text-lg text-slate-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === "dark" ? "L" : "D"}
    </button>
  );
}

export default ThemeToggle;
