import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Courses from "./pages/Courses";
import Login from "./pages/Login";

function App() {

  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>

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