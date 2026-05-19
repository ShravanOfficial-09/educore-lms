package com.educore.repository;

import com.educore.entity.Comment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByLecture_IdOrderByCreatedAtDesc(Long lectureId);
}
