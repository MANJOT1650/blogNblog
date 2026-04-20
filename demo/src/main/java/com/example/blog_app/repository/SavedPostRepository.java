package com.example.blog_app.repository;

import com.example.blog_app.model.SavedPost;
import com.example.blog_app.model.User;
import com.example.blog_app.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    List<SavedPost> findByUserOrderBySavedAtDesc(User user);
    Optional<SavedPost> findByUserAndPost(User user, Post post);
    void deleteByUserAndPost(User user, Post post);
    long countByUser(User user);
}
