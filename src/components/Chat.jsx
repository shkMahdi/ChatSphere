import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./Chat.css";

function Chat({ selectedChannel }) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages for selected channel
  useEffect(() => {
    if (!selectedChannel) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, "messages"),
      where("channelId", "==", selectedChannel.id),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Messages snapshot size for channel', selectedChannel?.id, ':', snapshot.size);
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Messages snapshot data:', messageData);
      setMessages(messageData);
    }, (err) => {
      console.error("Messages snapshot listener error:", err);
    });

    return unsubscribe;
  }, [selectedChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChannel) return;
    if (!currentUser) {
      console.error("handleSendMessage: no currentUser (not authenticated)");
      return;
    }
    try {
      await addDoc(collection(db, "messages"), {
        content: message,
        channelId: selectedChannel.id,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp()
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedChannel) {
    return (
      <div className="chat">
        <div className="no-channel-selected">
          <h2>Welcome to ChatSphere!</h2>
          <p>Select a channel from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="chat-header">
        <div className="channel-info">
          <span className="channel-icon">#</span>
          <span className="channel-name">{selectedChannel.name}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <h3>Welcome to #{selectedChannel.name}</h3>
            <p>This is the beginning of the #{selectedChannel.name} channel.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message">
              <div className="message-avatar">
                {msg.userName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-user">{msg.userName}</span>
                  <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <div className="message-text">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            className="message-input"
            placeholder={`Message #${selectedChannel.name}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

export default Chat;