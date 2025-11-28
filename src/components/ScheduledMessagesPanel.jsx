import React, { useEffect, useMemo, useState } from "react";
import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

function ScheduledMessagesPanel({ selectedChannel, currentUser }) {
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChannel || !currentUser) {
      setScheduledMessages([]);
      return;
    }

    const q = query(
      collection(db, "scheduledMessages"),
      where("channelId", "==", selectedChannel.id),
      where("authorId", "==", currentUser.uid),
      where("status", "==", "pending"),
      orderBy("scheduledFor", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setScheduledMessages(data);
      },
      (err) => console.error("Scheduled messages listener error:", err)
    );

    return unsubscribe;
  }, [selectedChannel, currentUser]);

  const formatDatetimeLocal = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const iso = date.toISOString();
    return iso.slice(0, 16);
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
    setEditDate(formatDatetimeLocal(msg.scheduledFor));
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditDate("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingId) return;
    if (!editContent.trim()) {
      setError("Content is required.");
      return;
    }
    if (!editDate) {
      setError("Please pick a future date.");
      return;
    }
    const newDate = new Date(editDate);
    if (newDate <= new Date()) {
      setError("Schedule time must be in the future.");
      return;
    }

    try {
      const ref = doc(db, "scheduledMessages", editingId);
      await updateDoc(ref, {
        content: editContent.trim(),
        scheduledFor: Timestamp.fromDate(newDate),
        updatedAt: Timestamp.now(),
      });
      cancelEdit();
    } catch (err) {
      console.error("Error updating scheduled message:", err);
      setError("Failed to update message.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await updateDoc(doc(db, "scheduledMessages", id), {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
      if (editingId === id) {
        cancelEdit();
      }
    } catch (err) {
      console.error("Error cancelling scheduled message:", err);
    }
  };

  const hasItems = useMemo(() => scheduledMessages.length > 0, [scheduledMessages]);

  if (!hasItems) {
    return (
      <div className="scheduled-panel">
        <p className="scheduled-empty">No scheduled messages</p>
      </div>
    );
  }

  return (
    <div className="scheduled-panel">
      <h4>Scheduled Messages</h4>
      <ul>
        {scheduledMessages.map((msg) => (
          <li key={msg.id} className="scheduled-item">
            {editingId === msg.id ? (
              <form onSubmit={handleUpdate} className="scheduled-edit-form">
                <textarea
                  rows="2"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
                {error && <p className="scheduled-error">{error}</p>}
                <div className="scheduled-actions">
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button type="submit">Save</button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <p>{msg.content}</p>
                  <span className="scheduled-time">
                    Sends at{" "}
                    {msg.scheduledFor?.toDate
                      ? msg.scheduledFor.toDate().toLocaleString()
                      : ""}
                  </span>
                </div>
                <div className="scheduled-controls">
                  <button onClick={() => startEdit(msg)}>Edit</button>
                  <button className="danger" onClick={() => handleCancel(msg.id)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduledMessagesPanel;

