import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();

        console.log(response);
        setCourses(response.data);
      } catch (error) {
        console.log(error);
        alert("Failed to fetch courses");
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Courses</h2>

        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li key={course.id}>{course.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Courses;
