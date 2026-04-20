import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

export const connect = (onMessageReceived) => {
    const token = localStorage.getItem('token');
    
    stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
        connectHeaders: {
            Authorization: `Bearer ${token}`
        },
        debug: (str) => {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
            console.log('Connected: ' + frame);
            const username = localStorage.getItem('username');
            stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
                onMessageReceived(JSON.parse(message.body));
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });

    stompClient.activate();
};

export const sendMessage = (receiver, content) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
                receiver: receiver,
                content: content
            })
        });
    }
};

export const disconnect = () => {
    if (stompClient !== null) {
        stompClient.deactivate();
    }
    console.log("Disconnected");
};
