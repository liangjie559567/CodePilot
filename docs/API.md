# CodePilot API Documentation

## Overview

CodePilot exposes REST and SSE (Server-Sent Events) APIs for chat, file management, and settings.

**Base URL**: `http://localhost:3000/api` (dev) or embedded server port (prod)

## Authentication

No authentication required (local-only app).

## Chat API

### Stream Chat

**Endpoint**: `POST /api/chat`

**Description**: Stream chat responses from Claude Agent SDK

**Request Body**:
```json
{
  "sessionId": "uuid",
  "message": "Hello Claude",
  "images": [
    {
      "name": "screenshot.png",
      "type": "image/png",
      "data": "base64..."
    }
  ]
}
```

**Response**: SSE stream

```
event: text
data: {"text": "Hello! "}

event: text
data: {"text": "How can I help?"}

event: tool_call
data: {"name": "read_file", "input": {...}}

event: done
data: {"usage": {"input": 100, "output": 50}}
```

**Events**:
- `text` - Streaming text chunk
- `tool_call` - Tool use request
- `tool_result` - Tool execution result
- `done` - Stream complete with token usage
- `error` - Error occurred

### Get Sessions

**Endpoint**: `GET /api/chat/sessions`

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "New Chat",
    "workingDir": "/path/to/project",
    "model": "claude-3-5-sonnet-20241022",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Create Session

**Endpoint**: `POST /api/chat/sessions`

**Request Body**:
```json
{
  "workingDir": "/path/to/project",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Response**:
```json
{
  "id": "uuid",
  "title": "New Chat",
  "workingDir": "/path/to/project",
  "model": "claude-3-5-sonnet-20241022"
}
```

### Get Session

**Endpoint**: `GET /api/chat/sessions/:id`

**Response**:
```json
{
  "id": "uuid",
  "title": "Project Discussion",
  "workingDir": "/path/to/project",
  "model": "claude-3-5-sonnet-20241022"
}
```

### Update Session

**Endpoint**: `PATCH /api/chat/sessions/:id`

**Request Body**:
```json
{
  "title": "Updated Title",
  "workingDir": "/new/path"
}
```

### Delete Session

**Endpoint**: `DELETE /api/chat/sessions/:id`

**Response**: `204 No Content`

### Get Messages

**Endpoint**: `GET /api/chat/sessions/:id/messages`

**Response**:
```json
[
  {
    "id": "uuid",
    "role": "user",
    "content": "Hello",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "role": "assistant",
    "content": "Hi there!",
    "createdAt": "2024-01-01T00:00:01Z"
  }
]
```

## File API

### Get File Tree

**Endpoint**: `GET /api/files?path=/project`

**Response**:
```json
{
  "name": "project",
  "path": "/project",
  "type": "directory",
  "children": [
    {
      "name": "src",
      "path": "/project/src",
      "type": "directory"
    },
    {
      "name": "README.md",
      "path": "/project/README.md",
      "type": "file",
      "size": 1024
    }
  ]
}
```

### Get File Preview

**Endpoint**: `GET /api/files/preview?path=/project/README.md`

**Response**:
```json
{
  "content": "# Project\n\nDescription...",
  "language": "markdown",
  "size": 1024
}
```

### Browse Directory

**Endpoint**: `POST /api/files/browse`

**Request Body**:
```json
{
  "defaultPath": "/home/user"
}
```

**Response**:
```json
{
  "path": "/selected/path"
}
```

## Settings API

### Get Settings

**Endpoint**: `GET /api/settings`

**Response**:
```json
{
  "theme": "dark",
  "model": "claude-3-5-sonnet-20241022",
  "permissions": {
    "mode": "ask",
    "autoAllow": []
  }
}
```

### Update Settings

**Endpoint**: `PATCH /api/settings`

**Request Body**:
```json
{
  "theme": "light",
  "model": "claude-3-opus-20240229"
}
```

## MCP API

### List MCP Servers

**Endpoint**: `GET /api/plugins/mcp`

**Response**:
```json
[
  {
    "name": "filesystem",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem"],
    "env": {},
    "disabled": false
  }
]
```

### Add MCP Server

**Endpoint**: `POST /api/plugins/mcp`

**Request Body**:
```json
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem"],
  "env": {}
}
```

### Update MCP Server

**Endpoint**: `PATCH /api/plugins/mcp/:name`

**Request Body**:
```json
{
  "disabled": true
}
```

### Delete MCP Server

**Endpoint**: `DELETE /api/plugins/mcp/:name`

**Response**: `204 No Content`

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Status Codes**:
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

No rate limiting (local-only app).

## WebSocket

Not currently supported. Use SSE for streaming.
