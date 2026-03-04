# Code Parse Service 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现增量解析、文件监听和缓存优化的完整 Code Parse Service

**Architecture:** 使用 Chokidar 监听文件变更，通过批处理队列聚合变更事件，利用 Tree-sitter 增量解析，配合 LRU 缓存提升性能

**Tech Stack:** TypeScript, Tree-sitter, Chokidar, Node.js fs

---

## Task 1: 实现 EnhancedLRUCache

**Files:**
- Create: `src/parser/enhanced-cache.ts`
- Test: `src/parser/enhanced-cache.test.ts`

**Step 1: 写失败测试**

```typescript
// src/parser/enhanced-cache.test.ts
import { describe, it, expect } from 'vitest';
import { EnhancedLRUCache } from './enhanced-cache';

describe('EnhancedLRUCache', () => {
  it('should evict oldest entry when max size reached', () => {
    const cache = new EnhancedLRUCache(2);
    cache.set('a', { data: 'a', timestamp: 1 });
    cache.set('b', { data: 'b', timestamp: 2 });
    cache.set('c', { data: 'c', timestamp: 3 });

    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);
  });
});
```

**Step 2: 运行测试验证失败**

```bash
npm test src/parser/enhanced-cache.test.ts
```
Expected: FAIL - "EnhancedLRUCache is not defined"

**Step 3: 实现最小代码**

```typescript
// src/parser/enhanced-cache.ts
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount?: number;
}

export class EnhancedLRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();

  constructor(private maxSize: number = 100) {}

  set(key: string, value: CacheEntry<T>): void {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }

  get(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.timestamp = Date.now();
      entry.accessCount = (entry.accessCount || 0) + 1;
    }
    return entry;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
```

**Step 4: 运行测试验证通过**

```bash
npm test src/parser/enhanced-cache.test.ts
```
Expected: PASS

**Step 5: 提交**

```bash
git add src/parser/enhanced-cache.ts src/parser/enhanced-cache.test.ts
git commit -m "feat(parser): add EnhancedLRUCache with eviction"
```

---

## Task 2: 实现 BatchQueue

**Files:**
- Create: `src/parser/batch-queue.ts`
- Test: `src/parser/batch-queue.test.ts`

**Step 1: 写失败测试**

```typescript
// src/parser/batch-queue.test.ts
import { describe, it, expect, vi } from 'vitest';
import { BatchQueue } from './batch-queue';

describe('BatchQueue', () => {
  it('should batch multiple enqueues within window', async () => {
    const queue = new BatchQueue(100);
    const handler = vi.fn();
    queue.on('batch', handler);

    queue.enqueue('file1.ts');
    queue.enqueue('file2.ts');
    queue.enqueue('file1.ts'); // duplicate

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(['file1.ts', 'file2.ts']);
  });
});
```

**Step 2: 实现最小代码**

```typescript
// src/parser/batch-queue.ts
import { EventEmitter } from 'events';

export class BatchQueue extends EventEmitter {
  private queue = new Set<string>();
  private timer: NodeJS.Timeout | null = null;

  constructor(private windowMs: number = 100) {
    super();
  }

  enqueue(filePath: string): void {
    this.queue.add(filePath);
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.windowMs);
    }
  }

  private flush(): void {
    if (this.queue.size > 0) {
      const files = Array.from(this.queue);
      this.queue.clear();
      this.emit('batch', files);
    }
    this.timer = null;
  }
}
```

**Step 3: 验证并提交**

```bash
npm test src/parser/batch-queue.test.ts
git add src/parser/batch-queue.ts src/parser/batch-queue.test.ts
git commit -m "feat(parser): add BatchQueue with deduplication"
```

---

## Task 3: 实现 FileWatcherService

**Files:**
- Create: `src/parser/file-watcher.ts`

**Step 1: 安装依赖**

```bash
npm install chokidar@^4.0.0
npm install -D @types/node
```

**Step 2: 实现代码**

```typescript
// src/parser/file-watcher.ts
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export interface FileWatcherConfig {
  projectRoot: string;
  ignored?: string[];
  extensions?: string[];
}

export class FileWatcherService extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;

  start(config: FileWatcherConfig): void {
    const { projectRoot, ignored = [], extensions = ['.ts', '.tsx', '.js', '.jsx', '.py'] } = config;

    this.watcher = chokidar.watch(projectRoot, {
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', ...ignored],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
    });

    this.watcher.on('change', (path: string) => {
      if (extensions.some(ext => path.endsWith(ext))) {
        this.emit('change', path);
      }
    });
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}
```

**Step 3: 提交**

```bash
git add src/parser/file-watcher.ts package.json package-lock.json
git commit -m "feat(parser): add FileWatcherService with chokidar"
```

---

## Task 4: 实现 IncrementalParser

**Files:**
- Update: `src/parser/tree-sitter-engine.ts`
- Create: `src/parser/incremental-parser.ts`

**Step 1: 增强 tree-sitter-engine**

```typescript
// src/parser/tree-sitter-engine.ts (追加)
export interface ParseResult {
  tree: Parser.Tree;
  symbols: Symbol[];
  changedRanges: Parser.Range[];
  parseTime: number;
}

export async function incrementalParse(
  filePath: string,
  oldTree?: Parser.Tree
): Promise<ParseResult> {
  const startTime = Date.now();
  const tree = await parseFile(filePath, oldTree);
  const symbolIndex = new SymbolIndex();
  const symbols = symbolIndex.extractSymbols(tree, filePath);
  const changedRanges = oldTree ? tree.getChangedRanges(oldTree) : [];

  return {
    tree,
    symbols,
    changedRanges,
    parseTime: Date.now() - startTime
  };
}
```

**Step 2: 创建 IncrementalParser**

```typescript
// src/parser/incremental-parser.ts
import { incrementalParse, ParseResult } from './tree-sitter-engine';
import { EnhancedLRUCache } from './enhanced-cache';
import Parser from 'tree-sitter';

export class IncrementalParser {
  private cache = new EnhancedLRUCache<Parser.Tree>(100);

  async parse(filePath: string): Promise<ParseResult> {
    const oldTree = this.cache.get(filePath)?.data;
    const result = await incrementalParse(filePath, oldTree);
    this.cache.set(filePath, { data: result.tree, timestamp: Date.now() });
    return result;
  }

  async parseBatch(files: string[]): Promise<Map<string, ParseResult>> {
    const results = new Map<string, ParseResult>();
    await Promise.all(
      files.map(async (file) => {
        const result = await this.parse(file);
        results.set(file, result);
      })
    );
    return results;
  }
}
```

**Step 3: 提交**

```bash
git add src/parser/tree-sitter-engine.ts src/parser/incremental-parser.ts
git commit -m "feat(parser): add IncrementalParser with batch support"
```

---

## Task 5: 集成所有组件

**Files:**
- Create: `src/parser/index.ts`
- Create: `src/parser/parse-service.ts`

**Step 1: 创建统一服务**

```typescript
// src/parser/parse-service.ts
import { FileWatcherService } from './file-watcher';
import { BatchQueue } from './batch-queue';
import { IncrementalParser } from './incremental-parser';

export class CodeParseService {
  private watcher = new FileWatcherService();
  private queue = new BatchQueue(100);
  private parser = new IncrementalParser();

  start(projectRoot: string): void {
    this.watcher.start({ projectRoot });

    this.watcher.on('change', (path) => {
      this.queue.enqueue(path);
    });

    this.queue.on('batch', async (files) => {
      await this.parser.parseBatch(files);
    });
  }

  stop(): void {
    this.watcher.stop();
  }
}
```

**Step 2: 导出接口**

```typescript
// src/parser/index.ts
export { CodeParseService } from './parse-service';
export { EnhancedLRUCache } from './enhanced-cache';
export { IncrementalParser } from './incremental-parser';
export { FileWatcherService } from './file-watcher';
export { BatchQueue } from './batch-queue';
```

**Step 3: 集成测试**

```typescript
// src/tests/integration.test.ts (更新)
import { CodeParseService } from '../parser';

it('should handle file changes end-to-end', async () => {
  const service = new CodeParseService();
  service.start(process.cwd());

  // 模拟文件变更
  await fs.writeFile('test.ts', 'const x = 1;');
  await new Promise(resolve => setTimeout(resolve, 200));

  service.stop();
});
```

**Step 4: 提交**

```bash
npm test
git add src/parser/index.ts src/parser/parse-service.ts src/tests/integration.test.ts
git commit -m "feat(parser): integrate all components into CodeParseService"
```

---

## Verification Checklist

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] 增量解析延迟 < 100ms
- [ ] 批处理正确去重
- [ ] 缓存淘汰策略正确
- [ ] 文件监听正常工作
- [ ] 无内存泄漏

---

## Notes

- 使用 TDD 方法，先写测试再实现
- 每个 Task 独立提交
- 保持代码最小化，避免过度设计
- 性能测试在所有功能完成后进行

