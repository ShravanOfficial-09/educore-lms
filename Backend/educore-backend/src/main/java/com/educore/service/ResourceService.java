package com.educore.service;

import com.educore.dto.ResourceRequestDTO;
import com.educore.dto.ResourceResponseDTO;
import com.educore.entity.Lecture;
import com.educore.entity.Resource;
import com.educore.repository.LectureRepository;
import com.educore.repository.ResourceRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final LectureRepository lectureRepository;

    public ResourceResponseDTO uploadResource(Long lectureId, ResourceRequestDTO request) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        Resource resource = new Resource();
        resource.setTitle(request.getTitle());
        resource.setFileUrl(request.getFileUrl());
        resource.setLecture(lecture);
        resource.setUploadedAt(LocalDateTime.now());

        Resource savedResource = resourceRepository.save(resource);
        return mapToResponseDTO(savedResource);
    }

    public List<ResourceResponseDTO> getLectureResources(Long lectureId) {
        lectureRepository.findById(lectureId)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        return resourceRepository.findByLecture_IdOrderByUploadedAtDesc(lectureId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        return new ResourceResponseDTO(
                resource.getId(),
                resource.getTitle(),
                resource.getFileUrl(),
                resource.getLecture().getId(),
                resource.getUploadedAt()
        );
    }
}
