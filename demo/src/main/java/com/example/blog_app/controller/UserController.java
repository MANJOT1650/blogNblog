package com.example.blog_app.controller;

import com.example.blog_app.model.Follow;
import com.example.blog_app.model.User;
import com.example.blog_app.repository.FollowRepository;
import com.example.blog_app.repository.UserRepository;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private FollowRepository followRepo;

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
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            Authentication auth) throws IOException {
        
        String username = auth.getName();
        User user = userRepo.findByUsername(username).orElseThrow();

        if (bio != null) user.setBio(bio);
        
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
