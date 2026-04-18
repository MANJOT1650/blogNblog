package com.example.blog_app.controller;

import com.example.blog_app.model.Message;
import com.example.blog_app.model.MessageStatus;
import com.example.blog_app.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> payload, Principal principal) {
        String senderUsername = principal.getName();
        String receiverUsername = payload.get("receiver");
        String content = payload.get("content");

        Message savedMessage = messageService.saveMessage(senderUsername, receiverUsername, content);

        messagingTemplate.convertAndSendToUser(
            receiverUsername, "/queue/messages", savedMessage
        );
        messagingTemplate.convertAndSendToUser(
            senderUsername, "/queue/messages", savedMessage
        );
    }

    @GetMapping("/api/messages/{username}")
    @ResponseBody
    public List<Message> getChatHistory(@PathVariable String username, Principal principal) {
        return messageService.getChatHistory(principal.getName(), username);
    }

    @PostMapping("/api/messages/{id}/status")
    @ResponseBody
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @Payload Map<String, String> payload, Principal principal) {
        String statusStr = payload.get("status");
        MessageStatus status = MessageStatus.valueOf(statusStr);
        // Add logic in service to update status if needed
        return ResponseEntity.ok().build();
    }
}
