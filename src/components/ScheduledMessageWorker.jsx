import { useEffect } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

function ScheduledMessageWorker({ currentUser }) {
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const processDueMessages = async () => {
      try {
        const now = Timestamp.now();
        const q = query(
          collection(db, "scheduledMessages"),
          where("status", "==", "pending"),
          where("authorId", "==", currentUser.uid),
          where("scheduledFor", "<=", now),
          orderBy("scheduledFor", "asc"),
          limit(10)
        );
        const snapshot = await getDocs(q);

        const tasks = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          try {
            const messagePayload = {
              content: data.content,
              channelId: data.channelId,
              userId: data.authorId,
              userName: data.authorName,
              timestamp: serverTimestamp(),
            };
            await addDoc(collection(db, "messages"), messagePayload);
            await updateDoc(doc(db, "scheduledMessages", docSnap.id), {
              status: "sent",
              sentAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.error("Error processing scheduled message:", err);
          }
        });

        await Promise.all(tasks);
      } catch (err) {
        console.error("Scheduled message worker error:", err);
      }
    };

    // Kick off immediately and every 60s
    processDueMessages();
    const interval = setInterval(() => {
      if (isMounted) {
        processDueMessages();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUser]);

  return null;
}

export default ScheduledMessageWorker;

