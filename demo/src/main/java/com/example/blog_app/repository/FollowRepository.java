package com.example.blog_app.repository;

import com.example.blog_app.model.Follow;
import com.example.blog_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    List<Follow> findByFollower(User follower);
    List<Follow> findByFollowing(User following);
    long countByFollower(User follower);
    long countByFollowing(User following);
}
