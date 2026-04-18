package com.example.blog_app.controller;

import com.example.blog_app.model.Like;
import com.example.blog_app.repository.LikeRepository;
import com.example.blog_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LikeController {

    @Autowired
    private LikeRepository likeRepo;

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> togglePostLike(@PathVariable Long postId, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        return likeRepo.findByUserIdAndPostId(userId, postId)
                .map(existing -> {
                    likeRepo.delete(existing);
                    return ResponseEntity.ok("Unliked");
                })
                .orElseGet(() -> {
                    Like like = new Like();
                    like.setUserId(userId);
                    like.setPostId(postId);
                    likeRepo.save(like);
                    return ResponseEntity.ok("Liked");
                });
    }

    @PostMapping("/comments/{commentId}/like")
    public ResponseEntity<?> toggleCommentLike(@PathVariable Long commentId, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        return likeRepo.findByUserIdAndCommentId(userId, commentId)
                .map(existing -> {
                    likeRepo.delete(existing);
                    return ResponseEntity.ok("Unliked");
                })
                .orElseGet(() -> {
                    Like like = new Like();
                    like.setUserId(userId);
                    like.setCommentId(commentId);
                    likeRepo.save(like);
                    return ResponseEntity.ok("Liked");
                });
    }
}