package com.example.blog_app.repository;

import com.example.blog_app.model.Message;
import com.example.blog_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
        User sender, User receiver, User sender2, User receiver2
    );
}
