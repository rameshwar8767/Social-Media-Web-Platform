
# MeetUp - Social Media Application

A modern social media platform built with React, Tailwind CSS, and Clerk authentication.

## 📋 Table of Contents

- [Project Setup](#project-setup)
- [Component Documentation](#component-documentation)
- [Features](#features)

## 🚀 Project Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file and add Clerk credentials
VITE_CLERK_PUBLISHABLE_KEY=your_key_here

# Start development server
npm run dev
```

## 📦 Component Documentation

### **Layout.jsx**
Main wrapper component that manages the overall page structure.

**Features:**
- Sidebar toggle for mobile devices
- Menu hamburger button
- Outlet for nested routes

**Usage:**
```jsx
<Layout> // Wraps all authenticated pages
    <Outlet /> // Renders child routes
</Layout>
```

---

### **SideBar.jsx**
Left navigation sidebar with user profile and menu items.

**Features:**
- Logo navigation
- Menu items (dynamically loaded)
- User profile section
- Create Post button
- Logout functionality

**Props:**
- `sideBarOpen` (boolean) - Controls sidebar visibility
- `setSideBarOpen` (function) - Toggle sidebar

---

### **MenuItems.jsx**
Reusable navigation menu with active route highlighting.

**Features:**
- Dynamic menu items from assets
- Active state styling
- Icon support with lucide-react
- Close sidebar on mobile after selection

**Props:**
- `setSideBarOpen` (function) - Close sidebar after navigation

---

### **Feed.jsx**
Main feed page displaying posts and stories.

**Features:**
- Stories section
- Post list (placeholder)
- Right sidebar (Sponsored, Messages)
- Loading state
- Responsive layout

**Data:**
- Uses `dummyPostsData` from assets

---

### **Loading.jsx**
Spinner component for async operations.

**Features:**
- Customizable height
- Animated spinner
- Centered alignment

**Props:**
- `height` (string) - Default: "100vh"

**Usage:**
```jsx
<Loading height="300px" />
```

---

### **StoriesBar.jsx**
Stories section (empty - ready for implementation).

**Purpose:** Display user stories in feed.

---

### **CreatePost.jsx**
Create new post page (empty - ready for implementation).

**Purpose:** Form to create and publish new posts.

---

### **Login.jsx**
Authentication page with Clerk integration.

**Features:**
- Branding section
- User testimonial (5-star rating)
- SignIn form via Clerk
- Responsive design

---

### **ChatBox.jsx**
Direct messaging interface (referenced in routes).

---

### **Connections.jsx**
User connections/friends page (referenced in routes).

---

### **Messages.jsx**
Messages list page (referenced in routes).

---

### **Discover.jsx**
Discovery page for finding content (referenced in routes).

---

### **Profile.jsx**
User profile page with dynamic profile support.

---

## 🎨 App.jsx - Routing Structure

```
/ (Layout)
├── / (Feed) - Default
├── /messages (Messages)
├── /messages/:userId (ChatBox)
├── /connections (Connections)
├── /discover (Discover)
├── /profile (Profile)
├── /profile/:profileId (Profile - specific user)
└── /create-post (CreatePost)
```

## 📱 Styling

- **Tailwind CSS** for utility-first styling
- **Lucide React** for icons
- Custom scrollbar hiding class: `no-scrollbar`
- Gradient buttons and backgrounds

## 🔐 Authentication

Uses **Clerk** for secure authentication with `UserButton` component.

## 🎯 Key Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light mode ready
- ✅ Protected routes
- ✅ User authentication
- ✅ Dynamic navigation


## 🎬 StoriesBar.jsx
Displays user stories in a horizontal scrollable section at the top of the feed.

**Features:**
- "Create Story" button with plus icon
- Horizontal scrollable story cards
- Story user profile picture
- Story content preview
- Timestamp display
- Hover and active animations
- Mobile responsive

**How it works:**
- Fetches dummy stories data on component mount
- Maps through stories array and displays each story
- Each story shows user avatar, content text, and time
- Users can click to view full story

**Data displayed:**
- `story.user.profile_picture` - User's avatar
- `story.content` - Story text
- `story.createdAt` - When story was created

**Styling:**
- Indigo gradient buttons
- Shadow effects on hover
- Smooth transitions
- Responsive width for all devices

---

## 📝 Getting Started for Users

### First Time Setup
1. Clone the project and install dependencies
2. Add your Clerk authentication keys to `.env.local`
3. Run `npm run dev` to start the application
4. Log in with your account

### Main Sections

**Feed Page** - Your main dashboard showing:
- Stories from friends at the top
- Posts from your network in the middle
- Sponsored content and messages on the right

**Create Post** - Share new content with your network

**Messages** - Direct messaging with other users

**Connections** - View and manage your friends list

**Discover** - Find new content and people to follow

**Profile** - View and edit your profile information

### Mobile Experience
- Tap the hamburger menu to show/hide sidebar
- Swipe horizontally through stories
- All features work on mobile devices


### **StoryModel.jsx**
Modal component for creating stories with rich text and media support.

**Features:**
- Text mode with drag-and-drop positioning
- Media upload (images and videos)
- Background gradient picker (18 presets)
- Text color customization
- Font family selection (sans, serif, mono)
- Bold and italic text styling
- Font size adjustment (16-64px)
- Emoji picker integration
- Music/audio upload
- Real-time canvas preview
- Mouse wheel zoom for text

**State:**
- `mode` - Current creation mode (text/media)
- `text` - Story text content
- `textColor` - Selected text color
- `fontSize` - Dynamic font size
- `fontFamily` - Typography style
- `bold/italic` - Text formatting
- `background` - Gradient background
- `media` - Uploaded image/video file
- `song` - Uploaded audio file
- `position` - Text position on canvas

**Interactions:**
- Drag text to reposition on canvas
- Scroll wheel to zoom text
- Click emoji button to add emojis
- Upload media to switch to media mode
- Background and color pickers for customization

**Props:**
- `setShowModel` (function) - Close modal
- `fetchStories` (function) - Refresh stories after creation

