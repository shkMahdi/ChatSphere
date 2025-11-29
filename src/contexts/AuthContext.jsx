import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const ensureUserDocument = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snapshot = await getDoc(userRef);
        const baseData = {
          uid: currentUser.uid,
          email: currentUser.email,
          emailLowercase: currentUser.email?.toLowerCase() || "",
          displayName: currentUser.displayName || currentUser.email,
          createdAt: new Date().toISOString(),
          status: "online",
        };

        if (!snapshot.exists()) {
          await setDoc(userRef, baseData);
        } else {
          const updates = {};
          const existing = snapshot.data();
          if (!existing.emailLowercase && currentUser.email) {
            updates.emailLowercase = currentUser.email.toLowerCase();
          }
          if (!existing.displayName && currentUser.displayName) {
            updates.displayName = currentUser.displayName;
          }
          if (Object.keys(updates).length > 0) {
            await setDoc(userRef, updates, { merge: true });
          }
        }
      } catch (err) {
        console.error("Failed to ensure user document:", err);
      }
    };

    ensureUserDocument();
  }, [currentUser]);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
