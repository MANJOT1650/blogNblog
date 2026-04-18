package com.example.blog_app.controller;

import com.example.blog_app.model.Comment;
import com.example.blog_app.repository.CommentRepository;
import com.example.blog_app.repository.UserRepository;
import com.example.blog_app.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private LikeRepository likeRepo;

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Map<String, Object> request, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        Comment comment = new Comment();
        comment.setContent((String) request.get("text"));
        comment.setPostId(Long.valueOf(request.get("postId").toString()));
        comment.setUserId(userId);

        Comment saved = commentRepo.save(comment);
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("text", saved.getContent());
        response.put("username", username);
        response.put("postId", saved.getPostId());
        response.put("userId", saved.getUserId());
        response.put("likes", 0);
        response.put("liked", false);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/post/{postId}")
    public List<Map<String, Object>> getByPost(@PathVariable Long postId, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        return commentRepo.findByPostId(postId).stream().map(comment -> {
            String commentUsername = userRepo.findById(comment.getUserId()).map(u -> u.getUsername()).orElse("Anonymous");
            long likes = commentRepo.countLikesByCommentId(comment.getId());
            boolean liked = likeRepo.findByUserIdAndCommentId(userId, comment.getId()).isPresent();
            Map<String, Object> commentMap = new HashMap<>();
            commentMap.put("id", comment.getId());
            commentMap.put("text", comment.getContent());
            commentMap.put("username", commentUsername);
            commentMap.put("postId", comment.getPostId());
            commentMap.put("userId", comment.getUserId());
            commentMap.put("likes", likes);
            commentMap.put("liked", liked);
            return commentMap;
        }).collect(Collectors.toList());
    }
}