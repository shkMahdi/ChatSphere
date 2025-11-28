import React, { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const SAVE_DEBOUNCE = 1500;

function CollaborativeNote({ selectedChannel, currentUser }) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [lastEditedAt, setLastEditedAt] = useState(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    if (!selectedChannel) {
      setContent("");
      setContributors([]);
      setLastEditedAt(null);
      return;
    }

    const noteRef = doc(db, "channelNotes", selectedChannel.id);
    const unsubscribe = onSnapshot(
      noteRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const nextContent = data.content || "";
          setContent(nextContent);
          setContributors(data.contributors || []);
          setLastEditedAt(data.lastEditedAt);
        } else {
          setContent("");
          setContributors([]);
          setLastEditedAt(null);
        }
      },
      (err) => console.error("Collaborative note listener error:", err)
    );

    return () => {
      unsubscribe();
      setContent("");
    };
  }, [selectedChannel]);

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  const saveNote = async (nextContent) => {
    if (!selectedChannel || !currentUser) return;

    try {
      setIsSaving(true);
      const noteRef = doc(db, "channelNotes", selectedChannel.id);
      await setDoc(
        noteRef,
        {
          channelId: selectedChannel.id,
          content: nextContent,
          lastEditedBy: currentUser.uid,
          lastEditedAt: serverTimestamp(),
          contributors: arrayUnion({
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email,
          }),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving collaborative note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const nextValue = e.target.value;
    setContent(nextValue);
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => saveNote(nextValue), SAVE_DEBOUNCE);
  };

  return (
    <div className="collab-note">
      <div className="collab-note-header">
        <h4>Channel Notes</h4>
        <div className="collab-note-meta">
          {isSaving ? <span>Saving...</span> : lastEditedAt && (
            <span>
              Updated{" "}
              {lastEditedAt?.toDate
                ? lastEditedAt.toDate().toLocaleString()
                : ""}
            </span>
          )}
        </div>
      </div>
      <textarea
        rows="8"
        value={content}
        onChange={handleChange}
        placeholder="Share reference notes with your channel..."
      />
      {contributors.length > 0 && (
        <div className="collab-contributors">
          <span>Contributors:</span>
          <div className="collab-contributor-list">
            {contributors.map((contributor) => (
              <div key={contributor.uid} className="collab-contributor">
                <div className="collab-avatar">
                  {contributor.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span>{contributor.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CollaborativeNote;

