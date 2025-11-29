import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import "./Members.css";

function Members({ selectedServer }) {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Fetch all users for invite search
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // Fetch members for selected server
  useEffect(() => {
    if (!selectedServer) return;

    const q = query(
      collection(db, "users"),
      where("uid", "in", selectedServer.members || [])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memberData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(memberData);
    }, (err) => {
      console.error("Members snapshot listener error:", err);
    });

    return unsubscribe;
  }, [selectedServer]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    const normalizedEmail = searchEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setInviteError("Please enter an email address.");
      return;
    }

    if (!selectedServer) {
      setInviteError("No server selected.");
      return;
    }

    try {
      // Find user by email - first check in-memory, then query Firestore directly
      let userToInvite = allUsers.find(
        (u) => u.emailLowercase === normalizedEmail
      );

      // If not found in memory, query Firestore directly
      if (!userToInvite) {
        const usersSnapshot = await getDocs(query(
          collection(db, "users"),
          where("emailLowercase", "==", normalizedEmail)
        ));

        if (usersSnapshot.docs.length > 0) {
          const userDoc = usersSnapshot.docs[0];
          userToInvite = {
            id: userDoc.id,
            ...userDoc.data()
          };
        }
      }

      if (!userToInvite) {
        setInviteError("User not found. Make sure they have signed up first.");
        return;
      }

      // Check if already a member
      if (selectedServer.members.includes(userToInvite.uid)) {
        setInviteError("User is already a member of this server.");
        return;
      }

      // Only server owner can invite
      if (selectedServer.ownerId !== currentUser.uid) {
        setInviteError("Only the server owner can invite members.");
        return;
      }

      // Add user to server members
      await updateDoc(doc(db, "servers", selectedServer.id), {
        members: arrayUnion(userToInvite.uid)
      });

      setInviteSuccess(`${userToInvite.email} has been invited to the server!`);
      setSearchEmail("");
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 2000);
    } catch (error) {
      console.error("Error inviting user:", error);
      setInviteError("Failed to invite user. Please try again.");
    }
  };

  if (!selectedServer) {
    return (
      <div className="members-panel">
        <h3>Members</h3>
        <p className="no-server-message">Select a server to view members</p>
      </div>
    );
  }

  const isOwner = selectedServer.ownerId === currentUser?.uid;

  return (
    <div className="members-panel">
      <div className="members-header">
        <h3>Members ({members.length})</h3>
        {isOwner && (
          <button
            className="invite-btn"
            onClick={() => setShowInviteModal(true)}
            title="Invite members"
          >
            +
          </button>
        )}
      </div>

      <div className="members-list">
        {members.length === 0 ? (
          <p className="no-members">No members yet</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-avatar">
                {member.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="member-info">
                <span className="member-name">{member.displayName || member.email}</span>
                <span className="member-status">{member.status || "offline"}</span>
              </div>
              {member.uid === selectedServer.ownerId && (
                <span className="owner-badge">Owner</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Invite Members</h2>
            {inviteError && <div className="error-message">{inviteError}</div>}
            {inviteSuccess && <div className="success-message">{inviteSuccess}</div>}
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter user email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Show search results */}
              {searchEmail.trim() && (
                <div className="search-results">
                  {allUsers
                    .filter(u => u.emailLowercase?.includes(searchEmail.trim().toLowerCase()) && u.uid !== currentUser.uid)
                    .slice(0, 5)
                    .map(user => (
                      <div
                        key={user.id}
                        className="search-result-item"
                        onClick={() => setSearchEmail(user.email)}
                      >
                        <div className="result-avatar">
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <span className="result-name">{user.displayName || user.email}</span>
                          <span className="result-email">{user.email}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
