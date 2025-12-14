import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./ServerSearch.css";

function ServerSearch({ onClose }) {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setMessage("");
    
    try {
      // Get all servers first (since we can't do complex queries on free tier)
      const snapshot = await getDocs(collection(db, "servers"));
      const servers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(server => 
          server.isPublic === true &&
          server.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !server.members?.includes(currentUser.uid)
        );
      
      setSearchResults(servers);
      
      if (servers.length === 0) {
        setMessage("No public servers found matching your search.");
      }
    } catch (error) {
      console.error("Error searching servers:", error);
      setMessage("Error searching servers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (server) => {
    try {
      // Check if request already exists
      const existingRequest = query(
        collection(db, "joinRequests"),
        where("serverId", "==", server.id),
        where("userId", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      
      const existingSnapshot = await getDocs(existingRequest);
      
      if (!existingSnapshot.empty) {
        setMessage("You already have a pending request for this server.");
        return;
      }

      // Create join request
      await addDoc(collection(db, "joinRequests"), {
        serverId: server.id,
        serverName: server.name,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setMessage(`Join request sent to "${server.name}"!`);
      
      // Remove server from search results
      setSearchResults(prev => prev.filter(s => s.id !== server.id));
    } catch (error) {
      console.error("Error sending join request:", error);
      setMessage("Failed to send join request. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal server-search-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Search Public Servers</h2>
        
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Enter server name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            autoFocus
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {message && (
          <div className={`search-message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="search-results">
          {searchResults.length > 0 && (
            <h3>Found {searchResults.length} server(s):</h3>
          )}
          
          {searchResults.map((server) => (
            <div key={server.id} className="search-result-item">
              <div className="server-info">
                <div className="server-avatar">
                  {server.name.charAt(0).toUpperCase()}
                </div>
                <div className="server-details">
                  <span className="server-name">{server.name}</span>
                  <span className="server-members">{server.members.length} members</span>
                </div>
              </div>
              <button 
                className="join-request-btn"
                onClick={() => handleJoinRequest(server)}
              >
                Request to Join
              </button>
            </div>
          ))}
        </div>

        <div className="modal-buttons">
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ServerSearch;