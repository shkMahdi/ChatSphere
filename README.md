# Discord Chat App

A real-time chat application built with React, Firebase, and Vite - inspired by Discord's UI/UX.

## Features

✅ **Authentication**
- Email/Password signup and login
- Google OAuth integration
- User profile management

✅ **Real-time Messaging**
- Send and receive messages instantly
- Real-time message updates using Firestore listeners
- Message timestamps with smart formatting

✅ **Server & Channel Management**
- Create multiple servers
- Create multiple channels within servers
- Switch between channels seamlessly
- Server membership management

✅ **Discord-like UI**
- Server sidebar with icons
- Channel list with categories
- Message feed with user avatars
- Responsive design

## Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: CSS3
- **Language**: JavaScript/JSX

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd discord-chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Firebase Setup:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication (Email/Password and Google providers)
   - Create a Firestore database (start in test mode, we'll add rules later)
   - Copy your Firebase config from Project Settings

4. Update Firebase configuration in `src/firebase.js` with your credentials

5. Deploy Firestore rules and indexes:
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Firestore)
firebase init firestore

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### Running the App

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to the URL shown (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

### First Time Setup

1. **Sign Up**: Create an account using email/password or Google
2. **Create a Server**: Click the "+" button in the server list
3. **Create Channels**: Click the "+" next to "TEXT CHANNELS"
4. **Start Chatting**: Select a channel and send messages!

### Features Guide

- **Switch Servers**: Click on server icons in the left sidebar
- **Switch Channels**: Click on channel names in the channel list
- **Send Messages**: Type in the message input and press Enter
- **Logout**: Click the door icon (🚪) at the bottom of the sidebar

## Project Structure

```
discord-chat-app/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login component
│   │   ├── Signup.jsx         # Signup component
│   │   ├── Auth.css           # Auth styles
│   │   ├── Sidebar.jsx        # Server & channel sidebar
│   │   ├── Sidebar.css        # Sidebar styles
│   │   ├── Chat.jsx           # Message display & input
│   │   └── Chat.css           # Chat styles
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── firebase.js            # Firebase configuration
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   ├── main.jsx               # Entry point
│   └── style.css              # Global styles
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── index.html                 # HTML template
├── package.json               # Dependencies
└── README.md                  # This file
```

## Firestore Data Structure

### Collections

**users**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  createdAt: timestamp,
  status: string
}
```

**servers**
```javascript
{
  name: string,
  ownerId: string,
  members: [string],  // array of user UIDs
  createdAt: timestamp
}
```

**channels**
```javascript
{
  name: string,
  serverId: string,
  type: "text" | "voice",
  createdAt: timestamp
}
```

**messages**
```javascript
{
  content: string,
  channelId: string,
  userId: string,
  userName: string,
  timestamp: timestamp
}
```

## Future Enhancements

- 🎥 Video calling
- 📞 Voice chat
- 🖼️ Image/file uploads
- 👥 User mentions
- 😀 Emoji reactions
- 🔍 Message search
- 🌙 Dark/light theme toggle
- 📱 Mobile responsive improvements
- ✏️ Edit/delete messages
- 👁️ Read receipts
- ⌨️ Typing indicators

## Troubleshooting

### Firestore Permission Errors
If you see permission errors, make sure to:
1. Deploy the firestore.rules file: `firebase deploy --only firestore:rules`
2. Ensure you're logged in when testing

### Index Errors
If you see index-related errors:
1. Firebase will provide a link to create the index automatically, or
2. Deploy indexes: `firebase deploy --only firestore:indexes`

### Port Already in Use
If port 5173 is in use, Vite will automatically try another port (5174, etc.)

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

MIT License - feel free to use this project for learning or building your own chat app!
