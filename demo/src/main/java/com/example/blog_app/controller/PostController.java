package com.example.blog_app.controller;

import com.example.blog_app.model.Post;
import com.example.blog_app.repository.PostRepository;
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
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private LikeRepository likeRepo;

    @GetMapping
    public List<Map<String, Object>> getAll(Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        return postRepo.findAll().stream().map(post -> {
            String author = userRepo.findById(post.getUserId()).map(u -> u.getUsername()).orElse("Unknown");
            long likes = postRepo.countLikesByPostId(post.getId());
            boolean liked = likeRepo.findByUserIdAndPostId(userId, post.getId()).isPresent();
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("title", post.getTitle());
            postMap.put("content", post.getContent());
            postMap.put("category", post.getCategory());
            postMap.put("author", author);
            postMap.put("userId", post.getUserId());
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("likes", likes);
            postMap.put("liked", liked);
            return postMap;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> request, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        Post post = new Post();
        post.setTitle(request.get("title"));
        post.setContent(request.get("content"));
        post.setCategory(request.get("category"));
        post.setUserId(userId);

        Post saved = postRepo.save(post);
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("title", saved.getTitle());
        response.put("content", saved.getContent());
        response.put("category", saved.getCategory());
        response.put("author", username);
        response.put("userId", saved.getUserId());
        response.put("createdAt", saved.getCreatedAt());
        response.put("likes", 0);
        response.put("liked", false);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        Long userId = userRepo.findByUsername(username).get().getId();

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        if (!post.getUserId().equals(userId)) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        postRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}