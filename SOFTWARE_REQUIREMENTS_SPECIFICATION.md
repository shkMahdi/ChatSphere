# Software Requirements Specification (SRS)
## ChatSphere - Real-Time Team Communication Platform

**Version:** 1.0  
**Date:** December 2, 2024  
**Project ID:** chat-app-36a12

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for ChatSphere, a real-time team communication platform. The application enables users to create servers, organize channels, communicate in real-time, schedule messages, and collaborate through shared notes.

### 1.2 Scope
ChatSphere is a web-based chat application that provides:
- User authentication and authorization
- Server and channel management
- Real-time text messaging
- Message scheduling capabilities
- Collaborative note-taking per channel
- Member management with moderation features

### 1.3 Definitions and Acronyms
- **Server**: A community space containing multiple channels
- **Channel**: A text-based communication space within a server
- **Owner**: The user who created a server (has full administrative rights)
- **Member**: A user who has been invited to and joined a server
- **Mute**: Temporarily restricting a member's ability to send messages
- **SRS**: Software Requirements Specification
- **UI**: User Interface
- **Firebase**: Backend-as-a-Service platform (Authentication, Firestore, Hosting)

### 1.4 References
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Modern team communication platform UI/UX patterns

---

## 2. Overall Description

### 2.1 Product Perspective
ChatSphere is a standalone web application built with:
- **Frontend**: React 19.2.0, Vite
- **Backend**: Firebase (Authentication, Firestore Database)
- **Hosting**: Firebase Hosting
- **Real-time**: Firestore real-time listeners

### 2.2 Product Functions
1. User authentication (signup/login/logout)
2. Server creation and management
3. Channel creation and organization
4. Real-time text messaging
5. Message scheduling
6. Collaborative channel notes
7. Member invitation and management
8. Member moderation (mute/remove)

### 2.3 User Classes and Characteristics

#### Server Owner
- Creates and owns servers
- Full administrative control
- Can invite, mute, and remove members
- Can create and delete channels
- Can delete the entire server

#### Server Member
- Invited by server owner
- Can view and send messages (unless muted)
- Can schedule messages
- Can contribute to collaborative notes
- Can leave the server

#### Guest (Unauthenticated User)
- Can only access login/signup pages
- No access to chat features

### 2.4 Operating Environment
- **Client**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server**: Firebase Cloud Infrastructure
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication

### 2.5 Design and Implementation Constraints
- Must use Firebase free tier (Spark plan)
- No file storage capabilities (requires paid plan)
- Real-time updates limited by Firestore quotas
- Client-side rendering only
- Requires internet connection

### 2.6 Assumptions and Dependencies
- Users have stable internet connection
- Users have modern web browsers with JavaScript enabled
- Firebase services remain available
- Users provide valid email addresses for authentication

---

## 3. Functional Requirements

### 3.1 User Authentication

#### 3.1.1 User Registration
**Priority**: High  
**Description**: New users can create an account using email and password.

**Requirements**:
- FR-1.1: System shall provide a signup form with email and password fields
- FR-1.2: System shall validate email format
- FR-1.3: System shall require password minimum length of 6 characters
- FR-1.4: System shall create a user document in Firestore upon successful registration
- FR-1.5: System shall store user display name and email (lowercase)
- FR-1.6: System shall automatically log in user after successful registration

#### 3.1.2 User Login
**Priority**: High  
**Description**: Registered users can log in using their credentials.

**Requirements**:
- FR-2.1: System shall provide a login form with email and password fields
- FR-2.2: System shall authenticate users via Firebase Authentication
- FR-2.3: System shall display error messages for invalid credentials
- FR-2.4: System shall maintain user session across page refreshes
- FR-2.5: System shall redirect authenticated users to main chat interface

#### 3.1.3 User Logout
**Priority**: High  
**Description**: Authenticated users can log out of the application.

**Requirements**:
- FR-3.1: System shall provide a logout button in the user panel
- FR-3.2: System shall clear user session upon logout
- FR-3.3: System shall redirect to login page after logout

### 3.2 Server Management

#### 3.2.1 Server Creation
**Priority**: High  
**Description**: Authenticated users can create new servers.

**Requirements**:
- FR-4.1: System shall provide a "+" button to create new servers
- FR-4.2: System shall display a modal for server name input
- FR-4.3: System shall create server with owner ID, member list, and muted members list
- FR-4.4: System shall automatically add creator as first member
- FR-4.5: System shall create a default "general" channel upon server creation
- FR-4.6: System shall display server icon with first letter of server name

#### 3.2.2 Server Selection
**Priority**: High  
**Description**: Users can switch between servers they are members of.

**Requirements**:
- FR-5.1: System shall display all servers user is a member of in left sidebar
- FR-5.2: System shall highlight currently selected server
- FR-5.3: System shall load channels for selected server
- FR-5.4: System shall auto-select first server on login

#### 3.2.3 Server Deletion
**Priority**: Medium  
**Description**: Server owners can delete their servers.

**Requirements**:
- FR-6.1: System shall provide delete button on server icons (visible on hover)
- FR-6.2: System shall display confirmation dialog before deletion
- FR-6.3: System shall delete all associated channels and messages
- FR-6.4: System shall only allow server owner to delete server
- FR-6.5: System shall remove server from all members' server lists

### 3.3 Channel Management

#### 3.3.1 Channel Creation
**Priority**: High  
**Description**: Users can create new text channels within a server.

**Requirements**:
- FR-7.1: System shall provide "+" button next to "TEXT CHANNELS" category
- FR-7.2: System shall display modal for channel name input
- FR-7.3: System shall create channel associated with current server
- FR-7.4: System shall display channels in creation order
- FR-7.5: System shall prefix channel names with "#" symbol

#### 3.3.2 Channel Selection
**Priority**: High  
**Description**: Users can switch between channels within a server.

**Requirements**:
- FR-8.1: System shall display all channels for selected server
- FR-8.2: System shall highlight currently selected channel
- FR-8.3: System shall load messages for selected channel
- FR-8.4: System shall auto-select first channel when server is selected

#### 3.3.3 Channel Deletion
**Priority**: Medium  
**Description**: Users can delete channels.

**Requirements**:
- FR-9.1: System shall provide delete button on channels (visible on hover)
- FR-9.2: System shall display confirmation dialog before deletion
- FR-9.3: System shall delete all messages in the channel
- FR-9.4: System shall deselect channel if currently selected

### 3.4 Messaging

#### 3.4.1 Send Messages
**Priority**: High  
**Description**: Users can send text messages in channels.

**Requirements**:
- FR-10.1: System shall provide message input field at bottom of chat
- FR-10.2: System shall send message on Enter key or Send button click
- FR-10.3: System shall include user ID, username, timestamp, and channel ID
- FR-10.4: System shall clear input field after successful send
- FR-10.5: System shall prevent empty messages from being sent
- FR-10.6: System shall prevent muted users from sending messages

#### 3.4.2 Display Messages
**Priority**: High  
**Description**: Users can view messages in real-time.

**Requirements**:
- FR-11.1: System shall display messages in chronological order
- FR-11.2: System shall show user avatar (first letter of username)
- FR-11.3: System shall display username and timestamp for each message
- FR-11.4: System shall auto-scroll to newest message
- FR-11.5: System shall update in real-time when new messages arrive
- FR-11.6: System shall format timestamps (e.g., "Just now", "5 minutes ago")

#### 3.4.3 Message Scheduling
**Priority**: Medium  
**Description**: Users can schedule messages to be sent at a future time.

**Requirements**:
- FR-12.1: System shall provide "🕒 Schedule" button in message controls
- FR-12.2: System shall display scheduling panel with message and datetime inputs
- FR-12.3: System shall validate scheduled time is in the future
- FR-12.4: System shall store scheduled messages with "pending" status
- FR-12.5: System shall automatically send scheduled messages at specified time
- FR-12.6: System shall allow users to view their scheduled messages
- FR-12.7: System shall allow users to edit scheduled messages
- FR-12.8: System shall allow users to delete scheduled messages
- FR-12.9: System shall prevent muted users from scheduling messages

### 3.5 Collaborative Notes

#### 3.5.1 Channel Notes
**Priority**: Medium  
**Description**: Each channel has a shared note that all members can edit.

**Requirements**:
- FR-13.1: System shall provide "📝 Notes" toggle button in chat header
- FR-13.2: System shall display note panel above messages when toggled
- FR-13.3: System shall show badge indicator when note has content
- FR-13.4: System shall allow all members to edit note content
- FR-13.5: System shall save note changes automatically (debounced)
- FR-13.6: System shall track and display contributors
- FR-13.7: System shall show last updated timestamp
- FR-13.8: System shall persist notes per channel

### 3.6 Member Management

#### 3.6.1 Invite Members
**Priority**: High  
**Description**: Server owners can invite users to their servers.

**Requirements**:
- FR-14.1: System shall provide "+" button in members panel (owner only)
- FR-14.2: System shall display invite modal with email search
- FR-14.3: System shall search users by email address
- FR-14.4: System shall display search results with user info
- FR-14.5: System shall add selected user to server members list
- FR-14.6: System shall prevent duplicate invitations
- FR-14.7: System shall only allow server owner to invite members

#### 3.6.2 View Members
**Priority**: High  
**Description**: Users can view all members of a server.

**Requirements**:
- FR-15.1: System shall display members list in right sidebar
- FR-15.2: System shall show member count in header
- FR-15.3: System shall display member avatar and name
- FR-15.4: System shall show member status (online/offline)
- FR-15.5: System shall display "Owner" badge for server owner
- FR-15.6: System shall show mute indicator (🔇) for muted members

#### 3.6.3 Mute Members
**Priority**: Medium  
**Description**: Server owners can mute members to prevent them from sending messages.

**Requirements**:
- FR-16.1: System shall provide mute button on member items (owner only, hover to show)
- FR-16.2: System shall toggle mute status when button clicked
- FR-16.3: System shall add/remove member from mutedMembers array
- FR-16.4: System shall prevent muted members from sending messages
- FR-16.5: System shall prevent muted members from scheduling messages
- FR-16.6: System shall display warning banner to muted users
- FR-16.7: System shall disable message input for muted users
- FR-16.8: System shall not allow owner to mute themselves

#### 3.6.4 Remove Members
**Priority**: Medium  
**Description**: Server owners can remove members from their servers.

**Requirements**:
- FR-17.1: System shall provide remove button on member items (owner only, hover to show)
- FR-17.2: System shall display confirmation dialog before removal
- FR-17.3: System shall remove member from server members list
- FR-17.4: System shall remove member from mutedMembers list if present
- FR-17.5: System shall revoke member's access to server and channels
- FR-17.6: System shall not allow owner to remove themselves

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- NFR-1: System shall load initial page within 3 seconds on standard broadband
- NFR-2: System shall display new messages within 1 second of sending
- NFR-3: System shall support up to 50 concurrent users per server
- NFR-4: System shall handle up to 100 messages per channel efficiently

### 4.2 Security Requirements
- NFR-5: System shall encrypt all data in transit using HTTPS
- NFR-6: System shall store passwords using Firebase Authentication (bcrypt)
- NFR-7: System shall validate all user inputs on client and server side
- NFR-8: System shall enforce Firestore security rules for data access
- NFR-9: System shall prevent unauthorized access to servers and channels
- NFR-10: System shall sanitize user inputs to prevent XSS attacks

### 4.3 Usability Requirements
- NFR-11: System shall provide intuitive server-based communication interface
- NFR-12: System shall display clear error messages for user actions
- NFR-13: System shall provide visual feedback for all user interactions
- NFR-14: System shall use consistent color scheme and typography
- NFR-15: System shall be responsive to different screen sizes

### 4.4 Reliability Requirements
- NFR-16: System shall maintain 99% uptime (dependent on Firebase)
- NFR-17: System shall handle network disconnections gracefully
- NFR-18: System shall retry failed operations automatically
- NFR-19: System shall preserve user session across page refreshes

### 4.5 Maintainability Requirements
- NFR-20: System shall use modular component architecture
- NFR-21: System shall follow React best practices
- NFR-22: System shall include error logging for debugging
- NFR-23: System shall use consistent code formatting

### 4.6 Scalability Requirements
- NFR-24: System shall support adding new features without major refactoring
- NFR-25: System shall handle increasing number of servers per user
- NFR-26: System shall optimize Firestore queries to minimize reads

---

## 5. System Features and Use Cases

### 5.1 User Authentication Flow
```
1. User visits application
2. System displays login page
3. User enters credentials or clicks signup
4. System authenticates/registers user
5. System redirects to main chat interface
```

### 5.2 Server and Channel Navigation Flow
```
1. User selects server from left sidebar
2. System loads channels for selected server
3. System auto-selects first channel
4. System loads messages for selected channel
5. User can switch channels within server
```

### 5.3 Messaging Flow
```
1. User types message in input field
2. User presses Enter or clicks Send
3. System validates message (not empty, user not muted)
4. System saves message to Firestore
5. System broadcasts message to all channel members
6. System displays message in chat
```

### 5.4 Member Management Flow
```
1. Server owner clicks invite button
2. System displays invite modal
3. Owner searches for user by email
4. Owner selects user from results
5. System adds user to server members
6. User gains access to server and channels
```

---

## 6. Data Requirements

### 6.1 Database Schema

#### Users Collection
```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User email
  emailLowercase: string,   // Lowercase email for search
  displayName: string,      // Display name
  status: string,           // "online" | "offline"
  createdAt: timestamp
}
```

#### Servers Collection
```javascript
{
  id: string,               // Auto-generated
  name: string,             // Server name
  ownerId: string,          // Creator's UID
  members: string[],        // Array of member UIDs
  mutedMembers: string[],   // Array of muted member UIDs
  createdAt: timestamp
}
```

#### Channels Collection
```javascript
{
  id: string,               // Auto-generated
  name: string,             // Channel name
  serverId: string,         // Parent server ID
  type: string,             // "text"
  createdAt: timestamp
}
```

#### Messages Collection
```javascript
{
  id: string,               // Auto-generated
  content: string,          // Message text
  channelId: string,        // Parent channel ID
  userId: string,           // Sender's UID
  userName: string,         // Sender's display name
  timestamp: timestamp
}
```

#### ScheduledMessages Collection
```javascript
{
  id: string,               // Auto-generated
  serverId: string,         // Target server ID
  channelId: string,        // Target channel ID
  content: string,          // Message text
  authorId: string,         // Scheduler's UID
  authorName: string,       // Scheduler's display name
  scheduledFor: timestamp,  // When to send
  status: string,           // "pending" | "sent" | "cancelled"
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### ChannelNotes Collection
```javascript
{
  id: string,               // Channel ID (document ID)
  content: string,          // Note content
  contributors: string[],   // Array of contributor UIDs
  lastUpdatedBy: string,    // Last editor's UID
  lastUpdatedAt: timestamp
}
```

### 6.2 Data Validation Rules
- Email addresses must be valid format
- Server names must be 1-100 characters
- Channel names must be 1-100 characters
- Message content must be 1-2000 characters
- User display names must be 1-50 characters

---

## 7. External Interface Requirements

### 7.1 User Interfaces
- Login/Signup pages
- Main chat interface with three-column layout:
  - Left: Server list and channel list
  - Center: Messages and input
  - Right: Members list
- Modal dialogs for server/channel creation
- Modal dialogs for member invitation
- Scheduling panel for message scheduling
- Notes panel for collaborative notes

### 7.2 Hardware Interfaces
- Standard web browser on desktop or mobile device
- Internet connection (minimum 1 Mbps recommended)

### 7.3 Software Interfaces
- Firebase Authentication API
- Cloud Firestore API
- Firebase Hosting
- React 19.2.0
- Vite build tool

### 7.4 Communication Interfaces
- HTTPS for all client-server communication
- WebSocket connections for real-time updates (managed by Firestore)

---

## 8. Appendices

### 8.1 Technology Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.1.7
- **Language**: JavaScript (with TypeScript types)
- **Backend**: Firebase (BaaS)
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Styling**: CSS3 with CSS Variables

### 8.2 Firebase Configuration
- Project ID: chat-app-36a12
- Project Name: Chat App
- Region: Default (us-central)
- Plan: Spark (Free Tier)

### 8.3 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 8.4 Future Enhancements (Out of Scope)
- Voice and video calls
- File sharing (images, PDFs, documents)
- Direct messages between users
- User profiles and avatars
- Server roles and permissions
- Message reactions and emojis
- Message editing and deletion
- Search functionality
- Notifications
- Mobile applications (iOS/Android)
- Dark/light theme toggle
- Message threading
- Server categories and organization

---

## 9. Approval

**Document Prepared By**: Shekh Mahdi Mesbah 
**Date**: December 2, 2024  
**Version**: 1.0

This document represents the complete software requirements specification for ChatSphere as of the date above.
