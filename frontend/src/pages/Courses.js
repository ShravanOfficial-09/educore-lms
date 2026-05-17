import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { createCourse, getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    try {
      const courseData = {
        title,
        description,
        price: Number(price),
      };

      await createCourse(courseData);

      alert("Course created successfully");

      setTitle("");
      setDescription("");
      setPrice("");

      fetchCourses();
    } catch (error) {
      console.log(error);
      alert("Failed to create course");
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h2>Create Course</h2>

        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Course Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <br />
        <br />

        <button onClick={handleCreateCourse}>Create Course</button>

        <br />
        <br />

        <h2>Courses</h2>

        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                <strong>{course.title}</strong>
                <br />
                {course.description}
                <br />
                Price: {course.price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Courses;
