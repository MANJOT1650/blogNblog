import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;

export const connect = (onMessageReceived) => {
    const token = localStorage.getItem('token');
    const socket = new SockJS('http://localhost:8080/ws-chat');
    stompClient = Stomp.over(socket);

    stompClient.connect({ Authorization: `Bearer ${token}` }, (frame) => {
        console.log('Connected: ' + frame);
        const username = localStorage.getItem('username');
        stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
            onMessageReceived(JSON.parse(message.body));
        });
    }, (error) => {
        console.error('Error connecting to websocket', error);
    });
};

export const sendMessage = (receiver, content) => {
    if (stompClient && stompClient.connected) {
        stompClient.send("/app/chat.send", {}, JSON.stringify({
            receiver: receiver,
            content: content
        }));
    }
};

export const disconnect = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
};
