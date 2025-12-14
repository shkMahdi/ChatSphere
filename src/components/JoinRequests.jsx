import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./JoinRequests.css";

function JoinRequests({ selectedServer, onClose }) {
  const { currentUser } = useAuth();
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedServer || selectedServer.ownerId !== currentUser.uid) return;

    const q = query(
      collection(db, "joinRequests"),
      where("serverId", "==", selectedServer.id),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJoinRequests(requests);
    });

    return unsubscribe;
  }, [selectedServer, currentUser]);

  const handleRequest = async (requestId, userId, action) => {
    setLoading(true);
    
    try {
      // Update request status
      await updateDoc(doc(db, "joinRequests", requestId), {
        status: action
      });

      if (action === "approved") {
        // Add user to server members
        await updateDoc(doc(db, "servers", selectedServer.id), {
          members: arrayUnion(userId)
        });
      }

      // Remove from local state
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (selectedServer?.ownerId !== currentUser.uid) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Access Denied</h2>
          <p>Only server owners can manage join requests.</p>
          <div className="modal-buttons">
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal join-requests-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Join Requests for "{selectedServer.name}"</h2>
        
        {joinRequests.length === 0 ? (
          <div className="no-requests">
            <p>No pending join requests.</p>
          </div>
        ) : (
          <div className="requests-list">
            {joinRequests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <div className="user-avatar">
                    {request.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{request.userName}</span>
                    <span className="user-email">{request.userEmail}</span>
                    <span className="request-date">
                      {request.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="request-actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleRequest(request.id, request.userId, "approved")}
                    disabled={loading}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="deny-btn"
                    onClick={() => handleRequest(request.id, request.userId, "denied")}
                    disabled={loading}
                  >
                    ✕ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-buttons">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default JoinRequests;