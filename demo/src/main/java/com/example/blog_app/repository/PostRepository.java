package com.example.blog_app.repository;

import com.example.blog_app.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT COUNT(l) FROM Like l WHERE l.postId = :postId")
    long countLikesByPostId(@Param("postId") Long postId);
}