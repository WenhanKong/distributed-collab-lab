# Collaborative Workspace - CRDT Learning Project

A distributed systems learning project focused on understanding **Conflict-free Replicated Data Types (CRDTs)** and eventual consistency patterns through building real-time collaborative applications.

## 🎯 Project Purpose

This is **NOT** a production application - it's a **learning playground** for distributed system algorithms:

- **Primary Goal**: Understand how CRDTs handle conflict-free data replication
- **Secondary Goal**: Learn eventual consistency and conflict resolution patterns
- **NOT About**: Network protocols, WebSocket plumbing, or deployment optimization

**Learning Philosophy**: Start with working libraries (Yjs/Hocuspocus) as "black boxes", observe CRDT behavior, understand patterns, then later implement custom CRDTs once concepts are internalized.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐  
│                    Browser Client 1                    │   
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐      │  
│  │   Document   │  │   Chat   │  │   Calendar   │      │  
│  │   (Y.Text)   │  │ (Y.Array)│  │   (Y.Map)    │      │  
│  └──────────────┘  └──────────┘  └──────────────┘      │  
│         │                │                │            │  
│         └────────────────┴────────────────┘            │  
│                   Y.Doc (One shared document)          │  
│                          │                             │  
│                   HocuspocusProvider                   │  
│                          │                             │  
└──────────────────────────┼─────────────────────────────┘  
                           │ WebSocket  
                           ▼    
                  ┌─────────────────┐   
                  │ Signaling Server│   
                  │  (Hocuspocus)   │   
                  │                 │   
                  │  Port: 3000     │   
                  └─────────────────┘   
                           │    
                    File Persistence    
                  (storage/yjs-docs/)   
```
### Key Design Decisions

- **One Workspace Room**: All features share one Y.Doc with multiple shared types
- **Hybrid Persistence**: 
  - Client: IndexedDB (offline-first)
  - Server: Filesystem snapshots (backup/recovery)
- **P2P with Signaling**: Server is minimal relay, clients do CRDT merging
- **Local-Only**: No cloud services, runs entirely on localhost

---

## 🧩 Three Learning Vehicles

Each feature demonstrates a different CRDT data structure:

### 1. 📝 Document Editor (Y.Text)
**Status**: ⏳ In Progress  
**CRDT Type**: `Y.Text` - collaborative string/rich-text  
**Learning Goals**:
- Text insertion/deletion with position tracking
- Formatting (bold, italic, etc.) as metadata
- Cursor positions and selections (awareness)
- Undo/redo with collaborative history

### 2. 💬 Chat (Y.Array)
**Status**: ❌ Not Started  
**CRDT Type**: `Y.Array` - append-only log  
**Learning Goals**:
- Timestamp-based ordering
- Append operations (never delete/reorder)
- Message integrity in distributed environment

### 3. 📅 Calendar (Y.Map)
**Status**: ❌ Not Started  
**CRDT Type**: `Y.Map` - key-value store  
**Learning Goals**:
- Last-write-wins semantics
- Concurrent updates to different keys
- Conflict resolution strategies for same-key updates

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Module System**: ES Modules (`"type": "module"`)
- **WebSocket Server**: [@hocuspocus/server](https://tiptap.dev/hocuspocus/introduction) 3.4.0
- **CRDT Library**: [Yjs](https://docs.yjs.dev/) 13.6.27
- **Persistence**: Node.js `fs` module (local filesystem)

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Rich Text Editor**: [TipTap](https://tiptap.dev/) 3.9.0
- **CRDT Library**: Yjs 13.6.27
- **WebSocket Client**: [@hocuspocus/provider](https://tiptap.dev/hocuspocus/provider) 3.4.0
- **Local Storage**: IndexedDB (via browser APIs)

### Why These Choices?
- **Yjs**: Industry-standard CRDT implementation, well-documented
- **Hocuspocus**: Minimal server for Yjs, focuses on data sync not infrastructure
- **TipTap**: Built on ProseMirror, integrates seamlessly with Yjs
- **Local-only**: Removes cloud complexity, focuses on CRDT algorithms

---

## 📦 Project Structure
```
collab/
├── README.md # This file
├── backend/
│ ├── package.json
│ ├── tsconfig.json
│ ├── src/
│ │ ├── server.ts # Hocuspocus WebSocket server
│ │ ├── config.ts # Port, storage paths
│ │ └── persistence.ts # File save/load (TODO)
│ └── storage/
│ └── yjs-docs/ # Document snapshots
└── frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
├── App.tsx # Main workspace container
├── App.css # ProseMirror + collaboration styles
├── main.tsx # React entry point
└── components/
├── DocumentEditor.tsx # Rich text editor (Y.Text)
├── Chat.tsx # Chat component (Y.Array) - TODO
└── Calendar.tsx # Calendar (Y.Map) - TODO
```
---

## 🚀 Getting Started

### Prerequisites

1. **Node.js 20+** and **npm 10+**
   ```bash
   node --version  # Should be v20.x.x or higher
   npm --version   # Should be v10.x.x or higher
   ```

2. **Basic understanding of**:
   - JavaScript/TypeScript basics (variables, functions, async/await)
   - React concepts (components, hooks like `useState`, `useEffect`)
   - Terminal/command line navigation

### Installation

1. **Clone and navigate**:
   ```bash
   cd /path/to/collab
   ```

2. **Install backend dependencies**:

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:

   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

**You need TWO terminal windows running simultaneously:**

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```
You should see:
```
🚀 Hocuspocus server running
   Port: 3000
   WebSocket: ws://localhost:3000
```

#### Terminal 2: Frontend Dev Server

```bash
cd frontend
npm run dev
```
You should see:
```
VITE v7.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

### Testing Collaboration

Open **TWO browser tabs/windows**:
1. Go to `http://localhost:5173` in first tab
2. Go to `http://localhost:5173` in second tab
3. Type in one editor → see changes appear in the other instantly

---

## 🔧 Development Commands

### Backend
```bash
cd backend

npm run dev      # Development with auto-reload (uses tsx)
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run compiled JavaScript (production-like)
npm run clean    # Remove compiled files
```

### Frontend
```bash
cd frontend

npm run dev      # Development server with HMR (Hot Module Reload)
npm run build    # Production build (TypeScript + Vite)
npm run preview  # Preview production build locally
npm run lint     # Check code style with ESLint
```

---

## 📚 Key Concepts for Team Members

### What is a CRDT?

**CRDT = Conflict-free Replicated Data Type**

Imagine two people editing the same Google Doc offline:
- Person A adds "Hello" at position 0
- Person B adds "World" at position 0
- When they reconnect, what should the document say?

**Normal approach**: Last writer wins → One person's change disappears (data loss!)

**CRDT approach**: Both changes preserved → "HelloWorld" or "WorldHello" (depending on algorithm)

CRDTs use **mathematical properties** to guarantee:
1. **Convergence**: All clients eventually see the same data
2. **No conflicts**: Concurrent edits don't require manual resolution
3. **Commutativity**: Order of applying operations doesn't matter

### Y.Text Example (Document Editor)

```javascript
// Client 1 types "H" at position 0
doc.getText('document').insert(0, 'H')

// Client 2 (simultaneously) types "W" at position 0  
doc.getText('document').insert(0, 'W')

// After sync: Both see "HW" or "WH" 
// (deterministic based on client IDs, NOT random)
```

**Key insight**: Each character has a **unique ID** with timestamp and client info. The CRDT merges based on these IDs, not just positions.

### Yjs Under the Hood (Simplified)

1. **Each client has a replica** of the Y.Doc
2. **Local edits are instant** (no waiting for server)
3. **Changes encoded as operations**: `{type: 'insert', pos: 5, content: 'A', clientID: 123, clock: 42}`
4. **Operations synced via WebSocket** to other clients
5. **Each client applies operations** using CRDT merge rules
6. **Eventually consistent**: All clients converge to same state

---

## 🐛 Common Issues & Solutions

### Backend won't start
```
Error: Cannot find module '@hocuspocus/server'
```
**Solution**: 
```bash
cd backend
npm install
```

### Frontend won't connect to backend
```
WebSocket connection failed
```
**Solution**: Ensure backend is running in separate terminal:
```bash
cd backend
npm run dev
```

### Changes don't sync between tabs
**Check**:
1. Backend terminal shows: `Client connected to: workspace`
2. Frontend status indicator shows: "connected" (green dot)
3. Browser console has no errors (press F12 → Console tab)

### TypeScript errors in editor
```
Cannot find name 'Y' or 'HocuspocusProvider'
```
**Solution**:
```bash
cd frontend
npm install yjs @hocuspocus/provider
```

---

## 🎓 Learning Resources

### Understand CRDTs
- [CRDT Primer](https://crdt.tech/) - Visual explanations
- [Yjs Documentation](https://docs.yjs.dev/) - Our CRDT library
- [Designing Data-Intensive Applications](https://dataintensive.net/) - Chapter 5 (Replication)

### Understand Yjs Specifically
- [Yjs Shared Types](https://docs.yjs.dev/api/shared-types) - Y.Text, Y.Array, Y.Map
- [How Yjs Works](https://github.com/yjs/yjs#Yjs-CRDT-Algorithm) - Algorithm overview
- [Yjs Demos](https://demos.yjs.dev/) - Live examples

### React & TypeScript
- [React Docs](https://react.dev/) - Official React 19 documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - TS basics

---

## 🗺️ Roadmap

### Phase 1: Document Editor ✅ → ⏳
- [x] Basic TipTap setup
- [x] Yjs text synchronization
- [x] Connection status indicator
- [x] Toolbar with formatting
- [ ] **Collaboration cursors** (current blocker)
- [ ] File persistence (backend)
- [ ] IndexedDB persistence (frontend)

### Phase 2: Chat (Not Started)
- [ ] Y.Array setup
- [ ] Message list component
- [ ] Real-time message sync
- [ ] User identification
- [ ] Timestamp handling

### Phase 3: Calendar (Not Started)
- [ ] Y.Map setup
- [ ] Event CRUD operations
- [ ] Conflict resolution testing
- [ ] Multi-user event editing

### Phase 4: Deep Dive (Future)
- [ ] Implement custom CRDT from scratch
- [ ] Compare performance with Yjs
- [ ] Document CRDT internals learned

---