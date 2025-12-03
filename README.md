# Collaborative Workspace - CRDT Learning Project

A distributed systems learning project focused on understanding **Conflict-free Replicated Data Types (CRDTs)** and eventual consistency patterns through building real-time collaborative applications.

## 🎯 Project Purpose

This is **NOT** a production application - it's a **learning playground** for distributed system algorithms:

- **Primary Goal**: Understand how CRDTs handle conflict-free data replication
- **Secondary Goal**: Learn eventual consistency and conflict resolution patterns
- **NOT About**: Network protocols, WebSocket plumbing, or deployment optimization

**Learning Philosophy**: Start with working libraries (Yjs/Hocuspocus) as "black boxes", observe CRDT behavior, understand patterns, then later implement custom CRDTs once concepts are internalized.

---

## ✅ Distributed Systems Requirements Covered

| Requirement | Where it Appears | Notes |
| ----------- | ---------------- | ----- |
| **Replication & Consistency Protocols** | Yjs + Hocuspocus CRDT sync (`frontend/src/collab`) | The shared document, chat, agenda, and mutex queues replicate through Yjs CRDT semantics, satisfying the replication/consistency requirement. |
| **Leader Election** | Awareness-powered bully algorithm (`useLeaderElectionState`) | The client with the highest live awareness ID becomes coordinator; leader identity is surfaced beside Collaborators and gates privileged actions. |
| **Mutual Exclusion / Concurrency Control** | Lamport-style mutex queue (`useDocumentMutex`, Agenda lock) | Editing the document requires acquiring a shared Y.Array-backed lock; leaders can also reset stale locks. |

These features are not just UI demos—they drive real behavior:

- **Leader-only actions:** Only the elected coordinator can toggle agenda completion and certain room controls.
- **Mutex-enforced editing:** TipTap becomes read-only until you acquire the distributed lock, preventing concurrent writes.
- **Replication:** All of the above synchronize across peers thanks to the underlying CRDT protocol.

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

Each feature demonstrates a different distributed-systems primitive layered on top of Yjs shared types:

### 1. 📝 Document Editor (Y.Text + Mutex)
**Status**: ✅ Functional  
**Focus**: CRDT replication *and* mutual exclusion  
**Highlights**:
- Y.Text handles collaborative rich text and formatting.
- A Lamport-style mutex queue (stored in the doc) gates edit access; non-owners see the editor in read-only mode.
- Leaders can reset stale locks to recover from crashed peers.

### 2. 📋 Agenda (Y.Array + Leader Election)
**Status**: ✅ Functional  
**Focus**: Leader-governed state changes  
**Highlights**:
- Agenda items live in a shared Y.Array so they replicate instantly.
- Only the elected leader may toggle completion status, proving the coordinator role drives real behavior.
- Every client can add/remove items, but completion reflects leader authority.

### 3. 💬 Chat (Y.Array)
**Status**: ✅ Functional  
**Focus**: Append-only CRDT logs & ordering strategies  
**Highlights**:
- Messages are appended to a replicated Y.Array so ordering is retained even with concurrent writes.
- Awareness enrichment tags each entry with user identity and local/remote metadata.
- Demonstrates compatibility between CRDT state and imperative UI (scrollback, optimistic sends).

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

## 🗺️ Roadmap (Completed)

### Phase 1: Collaborative Workspace Foundations ✅
- TipTap + Yjs document editor
- Awareness-driven presence & bully-style leader election
- Lamport mutex guarding the editor with reset path
- Agenda Y.Array with leader-only completion toggles
- IndexedDB warm start for offline edits
- Backed by Hocuspocus WebSocket relay, ready for persistence experiments

### Phase 2: Realtime Chat ✅
- Shared Y.Array log, awareness-enriched messages, optimistic sends
- Manual verification steps documented in README

### Phase 3: Distributed Algorithm Experiments ✅
- Leader election surfaced in UI and gating privileged actions
- Mutex queue ensuring concurrency control for document edits
- CRDT replication across all collaborative state

### Future Explorations (Optional)
- Compare Yjs-based replication with DIY CRDTs
- Introduce gossip/signaling alternatives or distributed snapshots if desired

---

## 🔬 Verifying the Distributed Algorithms

1. **Start the app** (`npm run dev` in both `backend/` and `frontend/`), then join the same room in two browser tabs.
2. **Leader Election**: look at the Collaborators card—one name will have a “Leader” badge. Close that tab and watch leadership transfer automatically to the remaining client.
3. **Mutual Exclusion**: try typing in the editor without holding the lock—you’ll see a banner telling you to request it. Click “Request lock,” make edits, then “Release lock.” Other tabs can only edit once the lock is free.
4. **Replication & Consistency**: add agenda items or chat messages in one tab and observe the other tab update instantly; even after refreshing, state replays thanks to Yjs/IndexedDB persistence.

These manual steps double as acceptance criteria whenever you modify the collaboration stack.

---
## 🧠 Distributed Algorithm Experiments

To cover more distributed-systems topics, the frontend now includes:

1. **Leader Election (Bully-style)** – Each connected client emits heartbeats through Yjs Awareness. The client with the highest `clientId` and a fresh heartbeat becomes coordinator. This satisfies the “Leader Election” requirement. See `useLeaderElectionState` and `src/collab/algorithms/leaderElection.ts`.
2. **Mutex / Concurrency Control** – A Lamport-inspired queue stored in the shared doc (`mutex:document`) enforces exclusive edit access. Users must acquire the lock before TipTap becomes editable. This satisfies the “Mutual Exclusion / Concurrency Control” requirement. Implementation lives in `useDocumentMutex` with visualization inside `RoomShell`.
3. **Replication & Consistency via CRDTs** – All collaborative state (doc, chat, agenda, lock queues) is replicated through Yjs CRDT semantics over Hocuspocus WebSockets, fulfilling the “Replication and Consistency Protocols” requirement. Core wiring is in `frontend/src/collab`.

Both algorithms have unit tests (run `npm run test:algorithms` inside `frontend/`) that prove deterministic tie-breaking and queue ordering even when nodes fail or rejoin. Refer to `frontend/tests/*.test.ts` for documented state transitions.

---
