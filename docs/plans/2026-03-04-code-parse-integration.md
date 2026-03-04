# Code Parse Service 集成实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 Code Parse Service 集成到 CodePilot，为 AI 对话提供实时代码上下文

**Architecture:** 单例 CodeParseManager 管理多项目解析服务，解析结果存储到 SQLite，chat API 自动附加代码上下文到 systemPromptAppend

**Tech Stack:** TypeScript, SQLite (better-sqlite3), CodeParseService, Next.js API Routes

---

## Task 1: 扩展数据库 Schema

**Files:**
- Modify: `src/lib/db.ts`

**Step 1: 添加 code_parse_results 表定义**

在 `db.ts` 中找到表创建部分，添加新表：

```typescript
db.exec(`
  CREATE TABLE IF NOT EXISTS code_parse_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    project_root TEXT NOT NULL,
    symbols TEXT,
    ast_summary TEXT,
    last_parsed INTEGER NOT NULL,
    session_id TEXT,
    UNIQUE(file_path, project_root)
  )
`);
```

**Step 2: 添加数据库操作函数**

```typescript
export function saveParseResult(
  filePath: string,
  projectRoot: string,
  symbols: string,
  astSummary: string,
  sessionId?: string
): void {
  db.prepare(`
    INSERT OR REPLACE INTO code_parse_results
    (file_path, project_root, symbols, ast_summary, last_parsed, session_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(filePath, projectRoot, symbols, astSummary, Date.now(), sessionId);
}

export function getParseResults(projectRoot: string, limit = 5): Array<{
  file_path: string;
  symbols: string;
  ast_summary: string;
}> {
  return db.prepare(`
    SELECT file_path, symbols, ast_summary
    FROM code_parse_results
    WHERE project_root = ?
    ORDER BY last_parsed DESC
    LIMIT ?
  `).all(projectRoot, limit) as any[];
}

export function clearParseResults(projectRoot: string): void {
  db.prepare('DELETE FROM code_parse_results WHERE project_root = ?').run(projectRoot);
}
```

**Step 3: 提交**

```bash
git add src/lib/db.ts
git commit -m "feat: add code_parse_results table and operations"
```

---

## Task 2: 创建 CodeParseManager

**Files:**
- Create: `src/lib/code-parse-manager.ts`

**Step 1: 创建单例管理器**

```typescript
import { CodeParseService } from '@/parser';
import { saveParseResult } from './db';

class CodeParseManager {
  private static instance: CodeParseManager;
  private services = new Map<string, CodeParseService>();

  private constructor() {}

  static getInstance(): CodeParseManager {
    if (!CodeParseManager.instance) {
      CodeParseManager.instance = new CodeParseManager();
    }
    return CodeParseManager.instance;
  }

  startMonitoring(projectRoot: string, sessionId?: string): void {
    if (this.services.has(projectRoot)) return;

    const service = new CodeParseService();

    service.on('parsed', (files: string[]) => {
      files.forEach(file => {
        saveParseResult(
          file,
          projectRoot,
          JSON.stringify([]), // symbols placeholder
          'AST parsed', // summary placeholder
          sessionId
        );
      });
    });

    service.start(projectRoot);
    this.services.set(projectRoot, service);
  }

  stopMonitoring(projectRoot: string): void {
    const service = this.services.get(projectRoot);
    if (service) {
      service.stop();
      this.services.delete(projectRoot);
    }
  }

  stopAll(): void {
    this.services.forEach(service => service.stop());
    this.services.clear();
  }
}

export const codeParseManager = CodeParseManager.getInstance();
```

**Step 2: 提交**

```bash
git add src/lib/code-parse-manager.ts
git commit -m "feat: add CodeParseManager singleton"
```

---

## Task 3: 集成到 Chat API

**Files:**
- Modify: `src/app/api/chat/route.ts`

**Step 1: 导入依赖**

在文件顶部添加：

```typescript
import { codeParseManager } from '@/lib/code-parse-manager';
import { getParseResults } from '@/lib/db';
```

**Step 2: 在会话开始时启动监听**

找到 `POST` 函数中获取 session 的部分，添加：

```typescript
const session = getSession(session_id);
if (!session) {
  return new Response(JSON.stringify({ error: 'Session not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Start monitoring if not already started
if (session.working_directory) {
  codeParseManager.startMonitoring(session.working_directory, session_id);
}
```

**Step 3: 附加代码上下文**

在调用 `streamClaude` 之前，添加上下文查询：

```typescript
let contextAppend = systemPromptAppend || '';

if (session.working_directory) {
  const parseResults = getParseResults(session.working_directory, 3);
  if (parseResults.length > 0) {
    contextAppend += '\n\n<code_context>\n';
    parseResults.forEach(result => {
      contextAppend += `File: ${result.file_path}\n`;
      contextAppend += `Symbols: ${result.symbols}\n`;
      contextAppend += `Summary: ${result.ast_summary}\n\n`;
    });
    contextAppend += '</code_context>';
  }
}
```

**Step 4: 传递增强的上下文**

修改 `streamClaude` 调用：

```typescript
const stream = await streamClaude({
  // ... existing params
  systemPromptAppend: contextAppend,
});
```

**Step 5: 提交**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: integrate code context into chat API"
```

---

## Task 4: 服务器启动初始化

**Files:**
- Create: `src/lib/server-init.ts`
- Modify: `src/app/api/health/route.ts` (作为初始化触发点)

**Step 1: 创建初始化模块**

```typescript
// src/lib/server-init.ts
import { codeParseManager } from './code-parse-manager';

let initialized = false;

export function initializeServices(): void {
  if (initialized) return;

  console.log('[Server Init] Initializing Code Parse Service...');
  // Manager is singleton, ready to accept monitoring requests
  initialized = true;
  console.log('[Server Init] Code Parse Service ready');
}

export function shutdownServices(): void {
  console.log('[Server Shutdown] Stopping Code Parse Service...');
  codeParseManager.stopAll();
  initialized = false;
}
```

**Step 2: 在 health 端点触发初始化**

```typescript
// src/app/api/health/route.ts
import { initializeServices } from '@/lib/server-init';

export async function GET() {
  initializeServices(); // Ensure services are initialized

  return Response.json({
    status: 'ok',
    services: {
      codeParseService: 'ready'
    }
  });
}
```

**Step 3: 提交**

```bash
git add src/lib/server-init.ts src/app/api/health/route.ts
git commit -m "feat: add server initialization for code parse service"
```

---

## Task 5: 测试和验证

**Files:**
- Create: `src/lib/code-parse-manager.test.ts`

**Step 1: 编写集成测试**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { codeParseManager } from './code-parse-manager';
import { getParseResults, clearParseResults } from './db';
import { createTestDir, cleanupTestDir, createTestFile, waitFor } from '@/parser/test-helpers';

describe('CodeParseManager Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await createTestDir();
  });

  afterEach(async () => {
    codeParseManager.stopAll();
    clearParseResults(testDir);
    await cleanupTestDir(testDir);
  });

  it('should monitor and store parse results', async () => {
    await createTestFile(testDir, 'test.ts', 'const x = 1;');

    codeParseManager.startMonitoring(testDir);
    await waitFor(500);

    const results = getParseResults(testDir);
    expect(results.length).toBeGreaterThan(0);
  });
});
```

**Step 2: 运行测试**

```bash
npx vitest run src/lib/code-parse-manager.test.ts
```

Expected: PASS

**Step 3: 手动测试 Chat API**

启动开发服务器：
```bash
npm run dev
```

创建会话，发送消息，检查日志中是否有代码上下文附加。

**Step 4: 提交**

```bash
git add src/lib/code-parse-manager.test.ts
git commit -m "test: add integration tests for code parse manager"
```

---

## Verification Checklist

- [ ] 数据库表创建成功
- [ ] CodeParseManager 单例工作正常
- [ ] Chat API 正确附加代码上下文
- [ ] 服务器启动时初始化成功
- [ ] 集成测试通过
- [ ] 手动测试验证端到端流程

---

## Notes

- 保持最小化实现
- 使用现有基础设施
- 性能开销低
- 易于扩展
