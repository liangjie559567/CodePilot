# CodePilot Architecture

## Overview

CodePilot is a desktop GUI client for Claude Code built with Electron + Next.js. It provides a visual interface for conversational coding with Claude Agent SDK.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Desktop**: Electron 40
- **UI**: Radix UI + shadcn/ui + Tailwind CSS 4
- **Database**: better-sqlite3 (embedded SQLite)
- **AI**: Claude Agent SDK + Vercel AI SDK
- **Build**: electron-builder + esbuild

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  (Window, IPC, Server Lifecycle)        │
└─────────────────┬───────────────────────┘
                  │ IPC Bridge
┌─────────────────▼───────────────────────┐
│      Next.js Standalone Server          │
│  (Embedded, Random Port, 127.0.0.1)     │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌────▼─────┐  ┌───▼────┐
│  Pages │  │ API      │  │ Static │
│        │  │ Routes   │  │ Assets │
└────────┘  └──────────┘  └────────┘
```

## Core Modules

### 1. Electron Layer (`electron/`)

**main.ts**
- Creates BrowserWindow with hidden title bar
- Forks Next.js standalone server
- Manages app lifecycle and graceful shutdown
- Handles auto-updates

**preload.ts**
- Context bridge for secure IPC
- Exposes `electronAPI` to renderer
- Provides shell, updater, and version APIs

**ipc-handlers.ts**
- IPC message handlers
- File system operations
- Shell integration

### 2. Next.js App (`src/app/`)

**Pages**
- `/` - New chat page
- `/chat/[id]` - Session page with chat + file tree
- `/extensions` - Skills + MCP server management
- `/settings` - Settings editor
- `/gallery` - Media gallery
- `/plugins` - Plugin management

**API Routes** (`src/app/api/`)
- `/api/chat` - SSE streaming endpoint
- `/api/chat/sessions` - Session CRUD
- `/api/chat/messages` - Message history
- `/api/files` - File tree + preview
- `/api/plugins/mcp` - MCP server management
- `/api/skills` - Skill CRUD
- `/api/settings` - Settings read/write

### 3. Components (`src/components/`)

**ai-elements/**
- `MessageBubble` - User/assistant message rendering
- `CodeBlock` - Syntax-highlighted code with copy button
- `ToolCall` - Tool use visualization
- `StreamingText` - Real-time text streaming

**chat/**
- `ChatView` - Main chat interface
- `MessageList` - Virtualized message list
- `MessageInput` - Input with file/image attachments
- `SessionList` - Session sidebar

**layout/**
- `AppShell` - Main layout with nav rail
- `NavRail` - Left navigation
- `RightPanel` - File tree + preview
- `ResizeHandle` - Draggable panel dividers

**project/**
- `FileTree` - Recursive file tree
- `FilePreview` - Code/text preview
- `TaskList` - Active tasks display

### 4. Core Logic (`src/lib/`)

**claude-client.ts**
- Wraps Claude Agent SDK
- Handles streaming responses
- Manages tool calls and permissions
- Multimodal support (text + images)

**db.ts**
- SQLite schema and migrations
- Session/message CRUD
- Settings persistence
- WAL mode for concurrent reads

**permission-registry.ts**
- Permission request/response bridge
- Auto-allow rules
- Permission mode management

**files.ts**
- File system helpers
- Directory traversal
- File content reading

### 5. Advanced Features

**inference/** (Placeholder)
- ONNX model integration
- Code embedding generation
- Inference service

**parser/** (Placeholder)
- Tree-sitter integration
- Code parsing and AST
- Incremental parsing

**vector/** (Placeholder)
- Vector database
- Embedding search
- Similarity queries

## Data Flow

### Chat Message Flow

```
User Input
    ↓
MessageInput Component
    ↓
POST /api/chat (SSE)
    ↓
claude-client.ts
    ↓
Claude Agent SDK
    ↓
Stream Response
    ↓
MessageBubble Component
    ↓
Save to SQLite
```

### File Tree Flow

```
Session Working Dir
    ↓
GET /api/files
    ↓
files.ts (readdir)
    ↓
FileTree Component
    ↓
Click File
    ↓
GET /api/files/preview
    ↓
FilePreview Component
```

### Permission Flow

```
Tool Call Request
    ↓
permission-registry.ts
    ↓
Check Auto-Allow Rules
    ↓
If Not Auto-Allowed:
    ↓
Show Permission Dialog
    ↓
User Approve/Deny
    ↓
Send Response to SDK
```

## Database Schema

**sessions**
- id, title, working_dir, model, provider
- created_at, updated_at
- sdk_session_id (Claude SDK session)

**messages**
- id, session_id, role, content
- created_at
- tool_calls (JSON)

**settings**
- key, value (JSON)
- Global app settings

**media**
- id, session_id, file_path, type
- tags, favorite
- created_at

## Build Process

### Development
```bash
npm run dev              # Next.js dev server
npm run electron:dev     # Full Electron app
```

### Production
```bash
npm run build            # Next.js standalone build
npm run electron:build   # Electron + Next.js
```

### Build Steps
1. Next.js builds to `.next/standalone/`
2. `scripts/build-electron.mjs` compiles Electron main process
3. electron-builder packages app with standalone server
4. `scripts/after-pack.js` rebuilds native modules for Electron

## Native Modules

**Challenges**
- tree-sitter, onnxruntime-node, better-sqlite3 are native
- Must be isolated from Next.js build phase
- Must be rebuilt for Electron's Node.js version

**Solutions**
- Dynamic imports in API routes
- `npmRebuild: false` in electron-builder.yml
- Externalize in esbuild config
- Use prebuilt binaries when possible

## Security

**IPC Security**
- Context isolation enabled
- No Node.js integration in renderer
- All IPC through preload bridge

**File System**
- Sandboxed to working directory
- No arbitrary file access
- Path validation

**Database**
- Local SQLite only
- No remote connections
- Per-user database

## Performance

**Optimizations**
- SQLite WAL mode for concurrent reads
- Virtualized message list
- Lazy file tree loading
- Code splitting in Next.js

**Bottlenecks**
- Large file previews
- Deep directory trees
- Long message history

## Testing

**Unit Tests** (`src/__tests__/unit/`)
- Core logic tests
- Database operations
- Utility functions

**E2E Tests** (`src/__tests__/e2e/`)
- Playwright tests
- Full app workflows
- Screenshot comparisons

## Deployment

**CI/CD**
- GitHub Actions on tag push
- Multi-platform builds (Windows, macOS, Linux)
- Automatic release creation
- Artifact upload

**Distribution**
- GitHub Releases
- DMG (macOS)
- NSIS installer (Windows)
- AppImage, deb, rpm (Linux)

## Future Enhancements

1. **Code Intelligence**
   - Implement tree-sitter parsing
   - ONNX model inference
   - Vector search

2. **Performance**
   - Message pagination
   - File tree virtualization
   - Optimized SQLite queries

3. **Features**
   - Multi-session tabs
   - Session export/import
   - Custom themes
   - Plugin system

4. **Security**
   - Code signing certificates
   - CSP implementation
   - Dependency audits
