# ChatSphere Chat App

A real-time chat application built with React and Firebase — inspired by Discord's server & channel model.

## Features

- **Authentication**: Email/password signup and login
- **Servers**: Create and manage multiple servers
- **Channels**: Create text channels within servers
- **Real-time Messaging**: Send/receive messages with live updates using Firestore listeners
- **Responsive UI**: Discord-like sidebar, channel list, and message feed with user avatars

## Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: CSS3
- **Language**: JavaScript/JSX

## Quick Start

### Prerequisites

- Node.js (v14+)
- npm
- Firebase account

### Setup

1. **Clone & install**:
```bash
cd discord-chat-app
npm install
```

2. **Firebase config**:
   - Go to [Firebase Console](https://console.firebase.google.com/) → Create project
   - Enable **Authentication** (Email/Password)
   - Create **Firestore database** (test mode)
   - Copy your config from Project Settings

3. **Update `src/firebase.js`** with your Firebase credentials

4. **Deploy Firestore rules & indexes**:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173`

## Usage

1. **Sign up** with email/password
2. **Create a server** (click the "+" in the server list)
3. **Create channels** (click "+" next to "TEXT CHANNELS")
4. **Send messages** in any channel
5. **Switch servers/channels** by clicking their names

## Project Structure

```
src/
  components/
    Login.jsx, Signup.jsx     # Auth screens
    Sidebar.jsx               # Servers & channels sidebar
    Chat.jsx                  # Messages & input
    *.css                     # Component styles
  contexts/
    AuthContext.jsx           # Auth state management
  firebase.js                 # Firebase config
  App.jsx                     # Main component
firestore.rules               # Security rules
firestore.indexes.json        # Firestore indexes
```

## Firestore Collections

- **servers**: { name, ownerId, members[], createdAt }
- **channels**: { name, serverId, type, createdAt }
- **messages**: { content, channelId, userId, userName, timestamp }

Required indexes:
- channels: serverId + createdAt
- messages: channelId + timestamp

## Troubleshooting

**Permission errors**: Deploy rules with `firebase deploy --only firestore:rules`

**Index errors**: Firebase will show a link to create the index, or deploy with `firebase deploy --only firestore:indexes`
