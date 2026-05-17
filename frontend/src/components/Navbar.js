import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/courses" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
            LMS
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">EduCore LMS</p>
            <p className="text-sm text-slate-500">Course Dashboard</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/courses"
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Courses
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
