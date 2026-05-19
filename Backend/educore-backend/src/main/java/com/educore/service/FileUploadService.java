package com.educore.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final ObjectProvider<Cloudinary> cloudinaryProvider;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            Cloudinary cloudinary = cloudinaryProvider.getObject();

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "educore-lms",
                            "resource_type", "auto"
                    )
            );

            Object secureUrl = uploadResult.get("secure_url");

            if (secureUrl == null) {
                throw new RuntimeException("Cloudinary did not return a file URL");
            }

            return secureUrl.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to upload file", ex);
        }
    }
}
