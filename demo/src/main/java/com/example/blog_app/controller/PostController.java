package com.example.blog_app.controller;

import com.example.blog_app.model.Post;
import com.example.blog_app.model.User;
import com.example.blog_app.model.Follow;
import com.example.blog_app.repository.PostRepository;
import com.example.blog_app.repository.UserRepository;
import com.example.blog_app.repository.LikeRepository;
import com.example.blog_app.repository.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    @Autowired
    private FollowRepository followRepo;

    private final String uploadDir = "uploads/";

    @GetMapping
    public List<Map<String, Object>> getAll(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "username", required = false) String profileUsername,
            Authentication auth) {
        
        String username = (auth != null) ? auth.getName() : null;
        User currentUser = (username != null) ? userRepo.findByUsername(username).orElse(null) : null;
        Long currentUserId = (currentUser != null) ? currentUser.getId() : null;

        List<Post> posts;
        if ("following".equals(filter) && currentUser != null) {
            List<User> following = followRepo.findByFollower(currentUser).stream()
                    .map(Follow::getFollowing)
                    .collect(Collectors.toList());
            posts = postRepo.findAll().stream()
                    .filter(p -> following.contains(p.getUser()))
                    .collect(Collectors.toList());
        } else if (profileUsername != null && !profileUsername.isEmpty()) {
            posts = postRepo.findByUserUsernameOrderByCreatedAtDesc(profileUsername);
        } else {
            posts = postRepo.findAll();
        }

        return posts.stream().map(post -> {
            String author = (post.getUser() != null) ? post.getUser().getUsername() : "Unknown";
            long likes = postRepo.countLikesByPostId(post.getId());
            boolean liked = currentUserId != null && likeRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent();
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("title", post.getTitle());
            postMap.put("content", post.getContent());
            postMap.put("category", post.getCategory());
            postMap.put("imageUrl", post.getImageUrl());
            postMap.put("author", author);
            postMap.put("userId", (post.getUser() != null) ? post.getUser().getId() : null);
            postMap.put("userProfilePic", (post.getUser() != null) ? post.getUser().getProfilePicture() : null);
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("likes", likes);
            postMap.put("liked", liked);
            return postMap;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id, Authentication auth) {
        String username = (auth != null) ? auth.getName() : null;
        Long currentUserId = (username != null) ? userRepo.findByUsername(username).map(User::getId).orElse(null) : null;

        return postRepo.findById(id).map(post -> {
            String author = (post.getUser() != null) ? post.getUser().getUsername() : "Unknown";
            long likes = postRepo.countLikesByPostId(post.getId());
            boolean liked = currentUserId != null && likeRepo.findByUserIdAndPostId(currentUserId, post.getId()).isPresent();
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("title", post.getTitle());
            postMap.put("content", post.getContent());
            postMap.put("category", post.getCategory());
            postMap.put("imageUrl", post.getImageUrl());
            postMap.put("author", author);
            postMap.put("userId", (post.getUser() != null) ? post.getUser().getId() : null);
            postMap.put("userProfilePic", (post.getUser() != null) ? post.getUser().getProfilePicture() : null);
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("likes", likes);
            postMap.put("liked", liked);
            return ResponseEntity.ok(postMap);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("category") String category,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication auth) throws IOException {

        String username = auth.getName();
        User user = userRepo.findByUsername(username).orElseThrow();

        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCategory(category);
        post.setUser(user);

        if (image != null && !image.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, image.getBytes());
            post.setImageUrl("/uploads/" + fileName);
        }

        Post saved = postRepo.save(post);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        User user = userRepo.findByUsername(username).orElseThrow();

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        if (post.getUser() == null || !post.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        postRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}