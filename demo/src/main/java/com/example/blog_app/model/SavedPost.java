package com.example.blog_app.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="saved_posts")
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    private LocalDateTime savedAt;

    public SavedPost() {}

    public SavedPost(Long id, User user, Post post, LocalDateTime savedAt) {
        this.id = id;
        this.user = user;
        this.post = post;
        this.savedAt = savedAt;
    }

    @PrePersist
    public void prePersist() {
        this.savedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
