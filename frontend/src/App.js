import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import CourseDetails from "./pages/CourseDetails";
import Courses from "./pages/Courses";
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f1f5f9",
            borderRadius: "20px",
            padding: "14px 16px",
            border: "1px solid rgba(99,102,241,0.18)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 24px 80px -30px rgba(6, 182, 212, 0.35)",
          },
          success: {
            iconTheme: {
              primary: "#34d399",
              secondary: "#f8fafc",
            },
          },
          error: {
            iconTheme: {
              primary: "#fb7185",
              secondary: "#f8fafc",
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            token
              ? <Navigate to="/courses" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
