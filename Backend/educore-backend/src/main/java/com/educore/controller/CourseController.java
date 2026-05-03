package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.dto.CourseRequestDTO;
import com.educore.dto.CourseResponseDTO;
import com.educore.entity.Course;
import com.educore.service.CourseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse> createCourse(@RequestBody CourseRequestDTO courseRequestDTO) {
        Course course = courseService.createCourse(courseRequestDTO);
        return ResponseEntity.ok(new ApiResponse(true, "Course created successfully", course));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(new ApiResponse(true, "Courses fetched successfully", courses));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse> getCourseById(@PathVariable Long courseId) {
        CourseResponseDTO course = courseService.getCourseByIdForCurrentUser(courseId);
        return ResponseEntity.ok(new ApiResponse(true, "Course fetched successfully", course));
    }
}
