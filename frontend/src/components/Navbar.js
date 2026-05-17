import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link
  to="/courses"
  style={{
    textDecoration: "none",
    color: "black"
  }}
>
  <h2 style={{ margin: 0 }}>LMS</h2>
</Link>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link to="/courses">Courses</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
