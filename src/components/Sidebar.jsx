import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./Sidebar.css";

function Sidebar({ selectedServer, setSelectedServer, selectedChannel, setSelectedChannel }) {
  const { currentUser, logout } = useAuth();
  const [servers, setServers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [showNewServerModal, setShowNewServerModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newChannelName, setNewChannelName] = useState("");

  // Fetch servers
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "servers"),
      where("members", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Servers snapshot size:', snapshot.size);
      const serverData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Servers snapshot data:', serverData);
      setServers(serverData);
      
      // Auto-select first server if none selected
      if (!selectedServer && serverData.length > 0) {
        setSelectedServer(serverData[0]);
      }
    }, (err) => {
      console.error("Servers snapshot listener error:", err);
    });

    return unsubscribe;
  }, [currentUser, selectedServer, setSelectedServer]);

  // Fetch channels for selected server
  useEffect(() => {
    if (!selectedServer) return;

    const q = query(
      collection(db, "channels"),
      where("serverId", "==", selectedServer.id),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Channels snapshot size for server', selectedServer?.id, ':', snapshot.size);
      const channelData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Channels snapshot data:', channelData);
      setChannels(channelData);
      
      // Auto-select first text channel if none selected
      if (!selectedChannel && channelData.length > 0) {
        const firstTextChannel = channelData.find(ch => ch.type === "text");
        if (firstTextChannel) {
          setSelectedChannel(firstTextChannel);
        }
      }
    }, (err) => {
      console.error("Channels snapshot listener error:", err);
    });

    return unsubscribe;
  }, [selectedServer, selectedChannel, setSelectedChannel]);

  const createServer = async (e) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    if (!currentUser) {
      console.error("createServer: no currentUser (not authenticated)");
      return;
    }
    try {
      const serverRef = await addDoc(collection(db, "servers"), {
        name: newServerName,
        ownerId: currentUser.uid,
        members: [currentUser.uid],
        mutedMembers: [],
        createdAt: serverTimestamp()
      });

      // Create a default general channel
      const channelRef = await addDoc(collection(db, "channels"), {
        name: "general",
        serverId: serverRef.id,
        type: "text",
        createdAt: serverTimestamp()
      });
      console.log('Created default channel:', channelRef.id);

      setNewServerName("");
      setShowNewServerModal(false);
    } catch (error) {
      console.error("Error creating server:", error);
    }
  };

  const createChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    if (!selectedServer) {
      console.error("createChannel: no selected server. Select a server first.");
      alert("Please select a server before creating a channel.");
      return;
    }

    if (!currentUser) {
      console.error("createChannel: no currentUser (not authenticated)");
      return;
    }
    try {
      await addDoc(collection(db, "channels"), {
        name: newChannelName,
        serverId: selectedServer.id,
        type: "text",
        createdAt: serverTimestamp()
      });
      console.log('Created channel under server', selectedServer.id, 'name:', newChannelName);

      setNewChannelName("");
      setShowNewChannelModal(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const deleteServer = async (serverId) => {
    if (!window.confirm("Are you sure you want to delete this server? This will also delete all channels and messages.")) {
      return;
    }

    try {
      const channelsSnapshot = await getDocs(query(
        collection(db, "channels"),
        where("serverId", "==", serverId)
      ));

      for (const channelDoc of channelsSnapshot.docs) {
        const messagesSnapshot = await getDocs(query(
          collection(db, "messages"),
          where("channelId", "==", channelDoc.id)
        ));
        for (const messageDoc of messagesSnapshot.docs) {
          await deleteDoc(doc(db, "messages", messageDoc.id));
        }
        await deleteDoc(doc(db, "channels", channelDoc.id));
      }

      await deleteDoc(doc(db, "servers", serverId));
      console.log('Deleted server:', serverId);

      if (selectedServer?.id === serverId) {
        setSelectedServer(null);
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error deleting server:", error);
      alert("Failed to delete server.");
    }
  };

  const deleteChannel = async (channelId) => {
    if (!window.confirm("Are you sure you want to delete this channel? This will also delete all messages.")) {
      return;
    }

    try {
      const messagesSnapshot = await getDocs(query(
        collection(db, "messages"),
        where("channelId", "==", channelId)
      ));
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(doc(db, "messages", messageDoc.id));
      }

      await deleteDoc(doc(db, "channels", channelId));
      console.log('Deleted channel:', channelId);

      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
      alert("Failed to delete channel.");
    }
  };

  return (
    <div className="sidebar">
      <div className="server-list">
        <div className="server-icon discord-icon">D</div>
        {servers.map((server) => (
          <div key={server.id} className="server-item">
            <div 
              className={`server-icon ${selectedServer?.id === server.id ? 'active' : ''}`}
              onClick={() => setSelectedServer(server)}
              title={server.name}
            >
              {server.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteServer(server.id);
              }}
              className="delete-btn"
              title="Delete server"
            >
              ✕
            </button>
          </div>
        ))}
        <div 
          className="server-icon add-server" 
          onClick={() => setShowNewServerModal(true)}
          title="Add a Server"
        >
          +
        </div>
      </div>
      
      <div className="channels-panel">
        <div className="server-header">
          <h3>{selectedServer?.name || "No Server Selected"}</h3>
          <span className="dropdown-arrow">⌄</span>
        </div>
        
        <div className="channels-section">
          <div className="channel-category">
            <span className="category-arrow">▼</span>
            <span className="category-name">TEXT CHANNELS</span>
            <span 
              className="add-channel-btn" 
              onClick={() => setShowNewChannelModal(true)}
              title="Create Channel"
            >
              +
            </span>
          </div>
          
          {channels
            .filter((channel) => channel.type === "text")
            .map((channel) => (
              <div 
                key={channel.id} 
                className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                onClick={() => setSelectedChannel(channel)}
              >
                <div className="channel-content">
                  <span className="channel-icon">#</span>
                  <span className="channel-name">{channel.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChannel(channel.id);
                  }}
                  className="delete-channel-btn"
                  title="Delete channel"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
        
        <div className="user-panel">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="username">{currentUser.displayName || currentUser.email}</span>
              <span className="user-status">Online</span>
            </div>
          </div>
          <div className="user-controls">
            <span className="control-icon" onClick={logout} title="Logout">
              🚪
            </span>
          </div>
        </div>
      </div>

      {/* New Server Modal */}
      {showNewServerModal && (
        <div className="modal-overlay" onClick={() => setShowNewServerModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a Server</h2>
            <form onSubmit={createServer}>
              <input
                type="text"
                  id="new-server-name"
                  name="newServerName"
                  placeholder="Server name"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowNewServerModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <div className="modal-overlay" onClick={() => setShowNewChannelModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create a Channel</h2>
            <form onSubmit={createChannel}>
              <input
                type="text"
                  id="new-channel-name"
                  name="newChannelName"
                  placeholder="Channel name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowNewChannelModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;