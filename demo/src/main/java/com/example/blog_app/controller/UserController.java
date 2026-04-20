package com.example.blog_app.controller;

import com.example.blog_app.model.*;
import com.example.blog_app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private FollowRepository followRepo;

    @Autowired
    private PostRepository postRepo;

    @Autowired
    private SavedPostRepository savedRepo;

    @Autowired
    private LikeRepository likeRepo;

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String uploadDir = "uploads/profiles/";

    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username, Authentication auth) {
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        User u = userOpt.get();
        long followers = followRepo.countByFollowing(u);
        long following = followRepo.countByFollower(u);
        
        boolean isFollowing = false;
        if (auth != null) {
            User currentUser = userRepo.findByUsername(auth.getName()).orElse(null);
            if (currentUser != null) {
                isFollowing = followRepo.findByFollowerAndFollowing(currentUser, u).isPresent();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", u.getId());
        response.put("username", u.getUsername());
        response.put("email", u.getEmail());
        response.put("bio", u.getBio());
        response.put("profilePicture", u.getProfilePicture());
        response.put("followersCount", followers);
        response.put("followingCount", following);
        response.put("isFollowing", isFollowing);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("q") String query) {
        List<Map<String, Object>> results = userRepo.findAll().stream()
            .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()))
            .map(u -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("username", u.getUsername());
                map.put("profilePicture", u.getProfilePicture());
                map.put("bio", u.getBio());
                return map;
            })
            .limit(10)
            .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<?> follow(@PathVariable String username, Authentication auth) {
        String followerName = auth.getName();
        User follower = userRepo.findByUsername(followerName).orElseThrow();
        User following = userRepo.findByUsername(username).orElseThrow();

        if (follower.getId().equals(following.getId())) {
            return ResponseEntity.badRequest().body("Cannot follow yourself");
        }

        if (followRepo.findByFollowerAndFollowing(follower, following).isPresent()) {
            return ResponseEntity.badRequest().body("Already following");
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepo.save(follow);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{username}/unfollow")
    public ResponseEntity<?> unfollow(@PathVariable String username, Authentication auth) {
        String followerName = auth.getName();
        User follower = userRepo.findByUsername(followerName).orElseThrow();
        User following = userRepo.findByUsername(username).orElseThrow();

        followRepo.findByFollowerAndFollowing(follower, following).ifPresent(followRepo::delete);
        return ResponseEntity.ok().build();
    }

    // --- Saved / Liked / Commented Logic ---

    @PostMapping("/me/save/{postId}")
    public ResponseEntity<?> savePost(@PathVariable Long postId, Authentication auth) {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        
        if (savedRepo.findByUserAndPost(user, post).isPresent()) {
            return ResponseEntity.badRequest().body("Already saved");
        }
        
        SavedPost saved = new SavedPost();
        saved.setUser(user);
        saved.setPost(post);
        savedRepo.save(saved);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/unsave/{postId}")
    @Transactional
    public ResponseEntity<?> unsavePost(@PathVariable Long postId, Authentication auth) {
        User user = userRepo.findByUsername(auth.getName()).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        savedRepo.deleteByUserAndPost(user, post);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/saved")
    public ResponseEntity<?> getSavedPosts(@PathVariable String username, Authentication auth) {
        User targetUser = userRepo.findByUsername(username).orElseThrow();
        
        // Security: Check if viewing own saved posts
        if (auth == null) return ResponseEntity.status(401).build();
        User currentUser = userRepo.findByUsername(auth.getName()).orElseThrow();
        
        if (!currentUser.getId().equals(targetUser.getId())) {
            return ResponseEntity.status(403).body("Access Denied: Private content");
        }

        List<Map<String, Object>> saved = savedRepo.findByUserOrderBySavedAtDesc(targetUser).stream()
            .map(s -> mapPostToProfileResult(s.getPost()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{username}/liked")
    public ResponseEntity<?> getLikedPosts(@PathVariable String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        List<Long> postIds = likeRepo.findByUserIdAndPostIdIsNotNull(user.getId()).stream()
            .map(Like::getPostId)
            .distinct()
            .collect(Collectors.toList());
        
        if (postIds.isEmpty()) return ResponseEntity.ok(Collections.emptyList());
        
        List<Map<String, Object>> liked = postRepo.findByIdInOrderByCreatedAtDesc(postIds).stream()
            .map(this::mapPostToProfileResult)
            .collect(Collectors.toList());
        return ResponseEntity.ok(liked);
    }

    @GetMapping("/{username}/commented")
    public ResponseEntity<?> getCommentedPosts(@PathVariable String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        List<Long> postIds = commentRepo.findByUserId(user.getId()).stream()
            .map(Comment::getPostId)
            .distinct()
            .collect(Collectors.toList());
        
        if (postIds.isEmpty()) return ResponseEntity.ok(Collections.emptyList());
        
        List<Map<String, Object>> commented = postRepo.findByIdInOrderByCreatedAtDesc(postIds).stream()
            .map(this::mapPostToProfileResult)
            .collect(Collectors.toList());
        return ResponseEntity.ok(commented);
    }

    private Map<String, Object> mapPostToProfileResult(Post p) {
        Map<String, Object> map = new HashMap<>();
        if (p == null) return map;
        map.put("id", p.getId());
        map.put("title", p.getTitle());
        map.put("imageUrl", p.getImageUrl());
        map.put("author", (p.getUser() != null) ? p.getUser().getUsername() : "Unknown");
        map.put("likes", postRepo.countLikesByPostId(p.getId()));
        return map;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        String username = auth.getName();
        User u = userRepo.findByUsername(username).orElseThrow();
        
        long followers = followRepo.countByFollowing(u);
        long following = followRepo.countByFollower(u);

        Map<String, Object> response = new HashMap<>();
        response.put("id", u.getId());
        response.put("username", u.getUsername());
        response.put("email", u.getEmail());
        response.put("bio", u.getBio());
        response.put("profilePicture", u.getProfilePicture());
        response.put("followersCount", followers);
        response.put("followingCount", following);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/following")
    public ResponseEntity<?> getFollowingUsers(Authentication auth) {
        String username = auth.getName();
        User currentUser = userRepo.findByUsername(username).orElseThrow();
        
        List<Map<String, Object>> following = followRepo.findByFollower(currentUser).stream()
            .map(f -> {
                User u = f.getFollowing();
                Map<String, Object> map = new HashMap<>();
                map.put("id", u.getId());
                map.put("username", u.getUsername());
                map.put("profilePicture", u.getProfilePicture());
                return map;
            }).collect(Collectors.toList());
            
        return ResponseEntity.ok(following);
    }

    @PostMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            Authentication auth) throws IOException {
        
        String currentUsername = auth.getName();
        User user = userRepo.findByUsername(currentUsername).orElseThrow();

        if (username != null && !username.isEmpty() && !username.equals(currentUsername)) {
            if (userRepo.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body("Username already taken");
            }
            user.setUsername(username);
        }
        if (email != null && !email.isEmpty()) user.setEmail(email);
        if (bio != null) user.setBio(bio);
        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        
        if (profilePic != null && !profilePic.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + profilePic.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, profilePic.getBytes());
            user.setProfilePicture("/uploads/profiles/" + fileName);
        }

        userRepo.save(user);
        return getMyProfile(auth);
    }
}
