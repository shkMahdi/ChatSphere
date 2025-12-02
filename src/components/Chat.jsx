import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import MessageScheduler from "./MessageScheduler";
import ScheduledMessagesPanel from "./ScheduledMessagesPanel";
import CollaborativeNote from "./CollaborativeNote";
import "./Chat.css";

function Chat({ selectedChannel }) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showScheduledPanel, setShowScheduledPanel] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteHasContent, setNoteHasContent] = useState(false);
  const [currentServer, setCurrentServer] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch server info to check mute status
  useEffect(() => {
    if (!selectedChannel) {
      setCurrentServer(null);
      setIsMuted(false);
      return;
    }

    const fetchServer = async () => {
      try {
        const channelDoc = await getDocs(query(
          collection(db, "channels"),
          where("__name__", "==", selectedChannel.id)
        ));

        if (channelDoc.docs.length > 0) {
          const channelData = channelDoc.docs[0].data();
          const serverId = channelData.serverId;

          const serverQuery = query(
            collection(db, "servers"),
            where("__name__", "==", serverId)
          );

          const unsubscribe = onSnapshot(serverQuery, (snapshot) => {
            if (snapshot.docs.length > 0) {
              const serverData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
              setCurrentServer(serverData);
              setIsMuted(serverData.mutedMembers?.includes(currentUser.uid) || false);
            }
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error("Error fetching server:", error);
      }
    };

    fetchServer();
  }, [selectedChannel, currentUser]);

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
    if (isMuted) {
      alert("You are muted in this server and cannot send messages.");
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

  useEffect(() => {
    if (!selectedChannel) {
      setNoteHasContent(false);
      return;
    }

    const noteRef = doc(db, "channelNotes", selectedChannel.id);
    const unsubscribe = onSnapshot(
      noteRef,
      (snapshot) => {
        const hasContent = Boolean(snapshot.data()?.content?.trim());
        setNoteHasContent(hasContent);
      },
      (err) => console.error("Channel note watcher error:", err)
    );

    return unsubscribe;
  }, [selectedChannel]);

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
        <div className="chat-header-controls">
          <button
            className={`notes-toggle ${showNotes ? "active" : ""}`}
            onClick={() => setShowNotes((prev) => !prev)}
          >
            📝 Notes
            {noteHasContent && <span className="notes-badge" />}
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="notes-panel">
          <CollaborativeNote
            selectedChannel={selectedChannel}
            currentUser={currentUser}
          />
        </div>
      )}

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
        {isMuted && (
          <div className="muted-warning">
            🔇 You are muted in this server and cannot send messages.
          </div>
        )}
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            className="message-input"
            placeholder={isMuted ? "You are muted" : `Message #${selectedChannel.name}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isMuted}
          />
          <div className="message-form-controls">
            <button type="submit" className="send-btn" disabled={isMuted}>
              Send
            </button>
            <MessageScheduler selectedChannel={selectedChannel} currentUser={currentUser} disabled={isMuted} />
            <button
              type="button"
              className={`scheduled-toggle ${showScheduledPanel ? "active" : ""}`}
              onClick={() => setShowScheduledPanel((prev) => !prev)}
            >
              📋 Scheduled
            </button>
          </div>
        </form>
        {showScheduledPanel && (
          <ScheduledMessagesPanel selectedChannel={selectedChannel} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}

export default Chat;