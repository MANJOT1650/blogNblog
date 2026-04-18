import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, sendMessage, disconnect } from '../services/socketService';
import axios from 'axios';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [receiver, setReceiver] = useState(null);
    const [following, setFollowing] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const currentUsername = localStorage.getItem('username');
    const scrollRef = useRef();

    const fetchFollowing = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/users/me/following', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowing(res.data);
        } catch (err) {
            console.error('Failed to fetch following users');
        }
    }, []);

    const fetchHistory = useCallback(async (user) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/messages/${user}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
            setReceiver(user);
        } catch (err) {
            console.error('Failed to fetch history');
        }
    }, []);

    useEffect(() => {
        fetchFollowing();
        connect((msg) => {
            // Isolation Filter: Only add if message belongs to active conversation
            setMessages((prev) => {
                const isRelevant = 
                    (msg.sender.username === currentUsername && msg.receiver.username === receiver) ||
                    (msg.sender.username === receiver && msg.receiver.username === currentUsername);
                
                return isRelevant ? [...prev, msg] : prev;
            });
        });
        return () => disconnect();
    }, [receiver, currentUsername, fetchFollowing]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && receiver) {
            sendMessage(receiver, input);
            setInput('');
        }
    };

    const handleSelectUser = (user) => {
        fetchHistory(user);
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h3>{currentUsername}</h3>
                </div>
                <div className="user-search">
                    <input 
                        type="text" 
                        placeholder="Search user..." 
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSelectUser(searchUser)}
                    />
                </div>
                <div className="recent-chats">
                    <div className="section-title">Following</div>
                    {following.map((u) => (
                        <div 
                            key={u.id} 
                            className={`chat-item ${receiver === u.username ? 'active' : ''}`}
                            onClick={() => handleSelectUser(u.username)}
                        >
                            <div className="avatar small">
                                {u.profilePicture ? (
                                    <img src={`http://localhost:8080${u.profilePicture}`} alt={u.username} />
                                ) : (
                                    u.username[0].toUpperCase()
                                )}
                            </div>
                            <span>{u.username}</span>
                        </div>
                    ))}
                    {searchUser && !following.find(f => f.username === searchUser) && (
                        <div className="chat-item" onClick={() => handleSelectUser(searchUser)}>
                             <div className="avatar small">?</div>
                             <span>{searchUser} (Search)</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="chat-window">
                {receiver ? (
                    <>
                        <div className="chat-header">
                            <div className="user-info">
                                <div className="avatar"> {receiver[0].toUpperCase()} </div>
                                <h2>{receiver}</h2>
                            </div>
                        </div>
                        <div className="message-list" ref={scrollRef}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`message-wrapper ${msg.sender.username === currentUsername ? 'sent' : 'received'}`}>
                                    <div className="message-bubble">
                                        {msg.content}
                                    </div>
                                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input 
                                type="text" 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                            />
                            <button onClick={handleSend} className={input ? 'active' : ''}>
                                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="icon">💬</div>
                        <h2>Your Messages</h2>
                        <p>Send private photos and messages to a friend.</p>
                        <button onClick={() => setFollowing([...following])}>Select a User</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
