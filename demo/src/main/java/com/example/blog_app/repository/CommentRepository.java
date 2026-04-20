package com.example.blog_app.repository;

import com.example.blog_app.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
    List<Comment> findByUserId(Long userId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.commentId = :commentId")
    long countLikesByCommentId(@Param("commentId") Long commentId);
}