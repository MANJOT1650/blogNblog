package com.example.blog_app.service;

import com.example.blog_app.model.Message;
import com.example.blog_app.model.MessageStatus;
import com.example.blog_app.model.User;
import com.example.blog_app.repository.MessageRepository;
import com.example.blog_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message saveMessage(String senderUsername, String receiverUsername, String content) {
        User sender = userRepository.findByUsername(senderUsername).orElseThrow();
        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow();

        Message message = new Message();
        message.setSenderId(sender.getId());
        message.setReceiverId(receiver.getId());
        message.setContent(content);
        // Note: createdAt typically is set by @PrePersist on Message, but we can set it explicitly too
        message.setCreatedAt(LocalDateTime.now());
        message.setStatus(MessageStatus.SENT);

        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1).orElseThrow();
        User user2 = userRepository.findByUsername(username2).orElseThrow();
        return messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
            user1.getId(), user2.getId(), user2.getId(), user1.getId()
        );
    }

    public void updateMessageStatus(Long messageId, MessageStatus status) {
        Message message = messageRepository.findById(messageId).orElseThrow();
        message.setStatus(status);
        messageRepository.save(message);
    }
}
