import { useEffect, useState } from "react";
import { getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();

        console.log(response);

        // API RESPONSE -> response.data
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
      <h2>Courses</h2>

      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            {course.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Courses;