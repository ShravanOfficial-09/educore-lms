package com.educore.controller;

import com.educore.common.ApiResponse;
import com.educore.config.JwtUtil;
import com.educore.dto.AuthResponse;
import com.educore.dto.LoginRequest;
import com.educore.dto.UserRequestDTO;
import com.educore.dto.UserResponseDTO;
import com.educore.entity.User;
import com.educore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO userResponseDTO = userService.registerUser(userRequestDTO);
        return ResponseEntity.ok(new ApiResponse(true, "User registered successfully", userResponseDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(new ApiResponse(true, "Login successful", new AuthResponse(token)));
    }

    @GetMapping("/test")
    public ResponseEntity<ApiResponse> testProtectedApi() {
        return ResponseEntity.ok(new ApiResponse(true, "Protected API working", "Protected API Working"));
    }
}
