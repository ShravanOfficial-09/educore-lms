package com.educore.repository;

import com.educore.entity.Resource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByLecture_IdOrderByUploadedAtDesc(Long lectureId);
}
