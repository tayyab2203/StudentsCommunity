# University Student Connection Platform - Complete Project Flow

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Next.js    │  │  Socket.IO   │  │  NextAuth    │       │
│  │   React UI   │  │   Client     │  │   Client     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │              │              │
                          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Next.js API │  │  Socket.IO   │  │  NextAuth    │       │
│  │    Routes    │  │   Server     │  │   Server    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Projects │  │ChatRooms │  │ Messages │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

### Step 1: User Signs In
1. User clicks "Sign In" button
2. NextAuth redirects to OAuth provider (Google/GitHub)
3. User authenticates with provider
4. Provider redirects back to `/api/auth/callback/[provider]`

### Step 2: User Creation/Retrieval
1. NextAuth `signIn` callback executes
2. Connects to MongoDB
3. Checks if user exists by email
4. If new user: Creates User document with:
   - name, email, image (from OAuth)
   - role: "VISITOR" (default)
   - profileCompletionPercent: 0
5. Returns `true` to allow sign-in

### Step 3: Session Creation
1. NextAuth `session` callback executes
2. Fetches user from database
3. Enriches session with:
   - user.id (MongoDB _id)
   - user.role
   - user.category, semester, availabilityStatus
4. Returns enhanced session to client

### Step 4: Client Receives Session
1. `SessionProvider` makes session available via `useSession()`
2. Components can access: `session.user.id`, `session.user.role`, etc.
3. Navbar shows user info and role-based navigation

## 👥 User Roles & Permissions

### VISITOR (Default Role)
**Capabilities:**
- ✅ Browse student profiles
- ✅ View student projects
- ✅ Send ONE anonymous first message
- ❌ Cannot be discovered in search
- ❌ Cannot receive direct messages
- ❌ Cannot create projects

**Upgrade Path:**
- Visit `/register` page
- Fill out profile form (category, semester, bio, image)
- Submit form → Role changes to "STUDENT"
- Redirected to their profile page

### STUDENT (Upgraded Role)
**Capabilities:**
- ✅ All VISITOR capabilities
- ✅ Public profile (discoverable in search)
- ✅ Create and manage projects
- ✅ Full messaging (send/receive)
- ✅ Edit own profile
- ✅ Set availability status
- ✅ View skill match scores

## 📊 Database Models & Relationships

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  image: String,
  role: "VISITOR" | "STUDENT" (default: "VISITOR"),
  category: String (department),
  semester: Number (1-8),
  bio: String,
  availabilityStatus: "Available" | "Busy",
  profileCompletionPercent: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  liveLink: String,
  studentId: ObjectId → User (required),
  createdAt: Date,
  updatedAt: Date
}
```

### ChatRoom Model
```javascript
{
  _id: ObjectId,
  participants: [ObjectId, ObjectId] → User (exactly 2),
  isAnonymous: Boolean (default: false),
  lastMessage: String,
  updatedAt: Date (indexed),
  createdAt: Date
}
```

### Message Model
```javascript
{
  _id: ObjectId,
  chatRoomId: ObjectId → ChatRoom (required),
  senderId: ObjectId → User (required),
  body: String (required),
  createdAt: Date (indexed),
  timestamps: true
}
```

## 🔄 Complete User Journeys

### Journey 1: New User → Student Registration

```
1. User visits homepage
   ↓
2. Clicks "Sign In" → OAuth (Google/GitHub)
   ↓
3. NextAuth creates User with role="VISITOR"
   ↓
4. User redirected to homepage (still VISITOR)
   ↓
5. User clicks "Register as Student" in navbar
   ↓
6. Fills out form at /register:
   - Category (department dropdown)
   - Semester (1-8)
   - Bio (textarea)
   - Image (Cloudinary upload)
   ↓
7. Form submits to PATCH /api/users/[id]
   - Updates user fields
   - Sets role="STUDENT"
   - Calculates profileCompletionPercent
   ↓
8. Redirects to /profile/[id]
```

### Journey 2: Browsing & Searching Students

```
1. User visits homepage (/)
   ↓
2. Home page loads:
   - Fetches GET /api/users?page=1&limit=12
   - API connects to MongoDB
   - Queries: { role: "STUDENT" }
   - Gets message counts for ranking
   - Applies ranking algorithm
   - Returns paginated results
   ↓
3. User sees student cards in grid
   ↓
4. User can:
   - Search by name/bio/category
   - Filter by department
   - Navigate pages
   ↓
5. User clicks student card
   ↓
6. Navigates to /profile/[id]
   - Fetches GET /api/users/[id]
   - Gets user + projects
   - Calculates skill match (if logged in)
   - Displays full profile
```

### Journey 3: Messaging Flow

```
1. User (Visitor or Student) views student profile
   ↓
2. Clicks "Message" button
   ↓
3. POST /api/chat/rooms
   - Body: { recipientId, isAnonymous: true/false }
   - Checks if room exists between users
   - If not: Creates new ChatRoom
   - Sets isAnonymous=true if sender is VISITOR
   ↓
4. Opens ChatModal with roomId
   ↓
5. ChatModal:
   - Fetches GET /api/chat/rooms/[id]/messages
   - Loads message history
   - Connects to Socket.IO room
   ↓
6. User types message and sends
   ↓
7. POST /api/chat/rooms/[id]/messages
   - Creates Message document
   - Updates ChatRoom.lastMessage
   - If student replies to anonymous: Sets isAnonymous=false
   ↓
8. Emits via Socket.IO:
   - socket.emit('sendMessage', { chatRoomId, message })
   ↓
9. Server broadcasts:
   - socket.to(roomId).emit('newMessage', message)
   - socket.emit('newMessage', message) (to sender)
   ↓
10. All clients in room receive real-time update
```

### Journey 4: Profile Completion Calculation

```
When user updates profile:
1. PATCH /api/users/[id]
   ↓
2. Updates user fields
   ↓
3. Calls calculateProfileCompletion(user, projectCount):
   - Name: 10%
   - Email: 10%
   - Image: 15%
   - Category: 15%
   - Semester: 15%
   - Bio: 20%
   - Projects: 15% (if count > 0)
   ↓
4. Updates user.profileCompletionPercent
   ↓
5. Saves to database
   ↓
6. Used in ranking algorithm
```

## 🎯 Smart Ranking Algorithm

### How It Works

```
1. GET /api/users (homepage)
   ↓
2. Fetches all students matching search/filter
   ↓
3. For each student, gets message count:
   - Message.countDocuments({ senderId: student._id })
   ↓
4. Applies ranking function:
   - Primary: profileCompletionPercent (50% weight)
   - Secondary: Recently active (30% weight)
     * Days since last update
     * Formula: 100 - (days * 2)
   - Tertiary: Message count (20% weight)
     * Formula: min(100, count * 5)
   ↓
5. Calculates final score:
   score = (completion * 0.5) + (recency * 0.3) + (contact * 0.2)
   ↓
6. Sorts by score (descending)
   ↓
7. Paginates results
   ↓
8. Returns to client
```

## 💬 Real-Time Messaging Architecture

### Socket.IO Setup

**Server Side (server.js):**
```
1. Creates HTTP server with Next.js
2. Attaches Socket.IO server
3. Listens for connections
4. Handles room management:
   - joinRoom: socket.join(roomId)
   - leaveRoom: socket.leave(roomId)
   - sendMessage: Broadcasts to room
```

**Client Side:**
```
1. SocketProvider wraps app
2. Connects when user has session
3. Provides socket via useSocket() hook
4. ChatModal uses socket for real-time updates
```

### Message Flow Diagram

```
User A sends message
    ↓
POST /api/chat/rooms/[id]/messages
    ↓
Message saved to MongoDB
    ↓
API returns message object
    ↓
Client emits: socket.emit('sendMessage', { chatRoomId, message })
    ↓
Server receives event
    ↓
Broadcasts: socket.to(roomId).emit('newMessage', message)
    ↓
All clients in room receive 'newMessage' event
    ↓
ChatModal updates message list in real-time
```

## 🔍 Skill Match Score Calculation

### When Viewing a Profile

```
1. GET /api/users/[id]
   ↓
2. Fetches student profile
   ↓
3. If viewer is logged in:
   - Fetches viewer's profile
   - Calls calculateSkillMatchScore(viewer, student)
   ↓
4. Calculation:
   - Category Match: 50%
     * Same category = 50%
     * Different = 0%
   - Semester Proximity: 50%
     * Formula: 50 * (1 - |viewer.semester - student.semester| / 8)
     * Closer semesters = higher score
   ↓
5. Returns combined score (0-100%)
   ↓
6. Displayed on profile page
```

## 📁 File Structure & Data Flow

### Frontend Components Flow

```
src/app/layout.js
  ├─ Providers (SessionProvider, SocketProvider)
  ├─ Navbar
  └─ Footer

src/app/page.js (Home)
  ├─ Hero Section
  ├─ Search/Filter Section
  └─ Student Cards Grid
      └─ StudentCard component
          └─ Links to /profile/[id]

src/app/profile/[id]/page.js
  ├─ Fetches user + projects
  ├─ Calculates skill match
  ├─ Shows profile details
  └─ Message button → Opens ChatModal

src/app/register/page.js
  └─ EditProfileForm (isRegister=true)
      └─ Submits to PATCH /api/users/[id]
          └─ Role upgrade: VISITOR → STUDENT
```

### API Routes Flow

```
/api/auth/[...nextauth]/route.js
  ├─ GET: OAuth callback
  └─ POST: OAuth callback

/api/users/route.js
  └─ GET: List students (with search, filter, pagination, ranking)

/api/users/[id]/route.js
  ├─ GET: Get student profile + projects + skill match
  └─ PATCH: Update user (role upgrade, profile edit)

/api/users/me/route.js
  └─ GET: Get current user

/api/projects/route.js
  ├─ GET: Get projects by studentId
  └─ POST: Create project

/api/projects/[id]/route.js
  ├─ PATCH: Update project
  └─ DELETE: Delete project

/api/chat/rooms/route.js
  ├─ GET: Get user's chat rooms
  └─ POST: Create/find chat room

/api/chat/rooms/[id]/messages/route.js
  ├─ GET: Get messages for room
  └─ POST: Send message

/api/upload/route.js
  └─ POST: Upload image to Cloudinary
```

## 🎨 UI Component Hierarchy

```
RootLayout
  ├─ Providers
  │   ├─ SessionProvider (NextAuth)
  │   └─ SocketProvider (Socket.IO)
  ├─ Navbar
  │   ├─ Logo
  │   ├─ Navigation Links
  │   └─ Auth Section
  ├─ Main Content
  │   ├─ Home Page
  │   │   ├─ Hero Section
  │   │   ├─ Search Section
  │   │   └─ Student Cards
  │   ├─ Profile Page
  │   │   ├─ Profile Header
  │   │   ├─ Projects Section
  │   │   └─ Message Button → ChatModal
  │   └─ Other Pages...
  └─ Footer
```

## 🔄 State Management

### Client-Side State
- **React Hooks**: useState, useEffect for local component state
- **NextAuth Session**: Global session via SessionProvider
- **Socket.IO**: Global socket connection via SocketProvider
- **No Redux/Context**: Simple prop drilling and hooks

### Server-Side State
- **MongoDB**: Single source of truth
- **Session**: Stored in cookies (NextAuth)
- **Socket Rooms**: Managed by Socket.IO server

## 🚀 Key Features Explained

### 1. Profile Completion Meter
- **Trigger**: Every profile update
- **Calculation**: `calculateProfileCompletion()` in `src/lib/profileCompletion.js`
- **Display**: Progress bar on cards and profile pages
- **Impact**: Used in ranking algorithm

### 2. Anonymous First Message
- **How it works**:
  1. VISITOR sends message → `isAnonymous: true` on ChatRoom
  2. Message shows "Anonymous" as sender
  3. When STUDENT replies → `isAnonymous: false`
  4. Identity revealed for future messages

### 3. Smart Ranking
- **Location**: `src/lib/ranking.js`
- **Applied**: In `/api/users` GET endpoint
- **Factors**: Completion %, recency, message count
- **Result**: Best profiles appear first

### 4. Skill Match Score
- **Location**: `src/lib/skillMatch.js`
- **Trigger**: When viewing a profile (if logged in)
- **Factors**: Category match + semester proximity
- **Display**: On profile page for logged-in students

## 🔒 Security & Access Control

### Route Protection (proxy.js)
- Checks for session token cookie
- Protects `/chat` and `/profile/edit` routes
- Redirects unauthenticated users

### API Protection
- All API routes check `getServerSession()`
- User can only update own profile
- Chat rooms: Only participants can access
- Projects: Only owner can edit/delete

### Role-Based UI
- Components check `session.user.role`
- Different UI for VISITOR vs STUDENT
- Conditional rendering based on permissions

## 📦 Data Flow Examples

### Example 1: Creating a Project

```
1. Student visits /profile/edit
2. Fills project form
3. POST /api/projects
   - Validates: user.role === 'STUDENT'
   - Creates Project document
   - Recalculates profileCompletionPercent
   - Updates User document
4. Project appears on profile
```

### Example 2: Sending a Message

```
1. User clicks "Message" on profile
2. POST /api/chat/rooms
   - Creates/finds ChatRoom
   - Returns roomId
3. Opens ChatModal
4. User types message
5. POST /api/chat/rooms/[id]/messages
   - Saves to MongoDB
   - Updates ChatRoom.lastMessage
6. Emits via Socket.IO
7. Real-time update to all participants
```

## 🎯 Performance Optimizations

1. **MongoDB Connection Caching**: Reuses connection across requests
2. **Socket.IO Room Management**: Only connects when needed
3. **Dynamic Imports**: BackgroundAnimation loaded client-side only
4. **Image Optimization**: Next.js Image component + Cloudinary
5. **Pagination**: Limits results to 12 per page
6. **Indexed Queries**: MongoDB indexes on frequently queried fields

## 🔄 Complete Request Cycle

### Example: Loading Homepage

```
Browser Request
    ↓
Next.js Server
    ↓
GET /api/users?page=1&limit=12
    ↓
connectDB() → MongoDB (cached connection)
    ↓
User.find({ role: 'STUDENT' })
    ↓
For each user: Message.countDocuments()
    ↓
sortUsersByRanking(users, messageCounts)
    ↓
Paginate results
    ↓
Return JSON
    ↓
Client renders StudentCard components
```

This is the complete flow of your University Student Connection Platform! 🎓

