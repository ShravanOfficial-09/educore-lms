package com.educore.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads";
    private static final Path UPLOAD_PATH = Path.of(System.getProperty("user.dir"), UPLOAD_DIR);

    public String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            Files.createDirectories(UPLOAD_PATH);

            String uniqueFileName = generateUniqueFileName(file.getOriginalFilename());
            Path filePath = UPLOAD_PATH.resolve(uniqueFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/" + UPLOAD_DIR + "/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }

        return UUID.randomUUID() + extension;
    }
}
