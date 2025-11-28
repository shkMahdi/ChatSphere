import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import Members from "./components/Members";
import ScheduledMessageWorker from "./components/ScheduledMessageWorker";
import "./App.css";

function App() {
  const { currentUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  if (!currentUser) {
    return isLogin ? (
      <Login onToggle={() => setIsLogin(false)} />
    ) : (
      <Signup onToggle={() => setIsLogin(true)} />
    );
  }

  return (
    <div className="app">
      <ScheduledMessageWorker currentUser={currentUser} />
      <Sidebar 
        selectedServer={selectedServer}
        setSelectedServer={setSelectedServer}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
      />
      <Chat 
        selectedChannel={selectedChannel}
      />
      <Members 
        selectedServer={selectedServer}
      />
    </div>
  );
}

export default App;
