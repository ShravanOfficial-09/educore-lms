package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.entity.Course;
import com.educore.service.CourseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCourses(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }

        System.out.println("User: " + authentication.getName());

        List<Course> courses = courseService.getAllCourses();

        return ResponseEntity.ok(
            new ApiResponse(true, "Courses fetched successfully", courses)
        );
    }
}