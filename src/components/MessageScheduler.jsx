import React, { useState } from "react";
import { Timestamp, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function MessageScheduler({ selectedChannel, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!selectedChannel || !currentUser) {
    return null;
  }

  const resetForm = () => {
    setContent("");
    setScheduledFor("");
    setError("");
    setLoading(false);
  };

  const handleSchedule = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");

    if (!content.trim()) {
      setError("Message content is required.");
      return;
    }
    if (!scheduledFor) {
      setError("Please select a date and time.");
      return;
    }

    const scheduledDate = new Date(scheduledFor);
    if (Number.isNaN(scheduledDate.getTime())) {
      setError("Invalid date selected.");
      return;
    }
    if (scheduledDate <= new Date()) {
      setError("Please select a future time.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "scheduledMessages"), {
        serverId: selectedChannel.serverId,
        channelId: selectedChannel.id,
        content: content.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        scheduledFor: Timestamp.fromDate(scheduledDate),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess("Message scheduled!");
      setTimeout(() => setSuccess(""), 2000);
      resetForm();
    } catch (err) {
      console.error("Error scheduling message:", err);
      setError("Failed to schedule message. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scheduler">
      <button
        type="button"
        className="scheduler-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        🕒 Schedule
      </button>

      {isOpen && (
        <div className="scheduler-panel">
          <textarea
            rows="3"
            placeholder="Message to schedule"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <label>
            Send at
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </label>
          {error && <p className="scheduler-error">{error}</p>}
          {success && <p className="scheduler-success">{success}</p>}
          <div className="scheduler-actions">
            <button
              type="button"
              className="scheduler-cancel"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
            >
              Cancel
            </button>
            <button type="button" disabled={loading} onClick={handleSchedule}>
              {loading ? "Scheduling..." : "Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageScheduler;

