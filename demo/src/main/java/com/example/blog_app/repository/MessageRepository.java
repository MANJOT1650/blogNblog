package com.example.blog_app.repository;

import com.example.blog_app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
        Long senderId, Long receiverId, Long senderId2, Long receiverId2
    );
}
