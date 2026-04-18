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
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setStatus(MessageStatus.SENT);

        return messageRepository.save(message);
    }

    public List<Message> getChatHistory(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1).orElseThrow();
        User user2 = userRepository.findByUsername(username2).orElseThrow();
        return messageRepository.findBySenderAndReceiverOrSenderAndReceiverOrderByTimestampAsc(
            user1, user2, user2, user1
        );
    }
}
