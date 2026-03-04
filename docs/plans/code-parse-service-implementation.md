# Code Parse Service 实现方案

## 文档信息
- **版本**: 1.0.0
- **日期**: 2026-03-04
- **状态**: Draft
- **方案**: 方案 A - 轻量级 Chokidar + 批处理队列

---

## 1. 设计目标

### 1.1 功能目标
- ✅ 增量解析：复用旧 AST，仅解析变更部分
- ✅ 文件监听：监听整个项目目录，自动触发解析
- ✅ 缓存优化：纯内存 LRU 缓存，100 条目上限

### 1.2 性能目标
- 增量解析延迟: < 100ms
- 批处理窗口: 100ms
- 吞吐量优先: 支持批量文件解析
- 缓存命中率: > 80%

---

## 2. 架构设计

### 2.1 核心组件

```
┌─────────────────────────────────────────┐
│   FileWatcherService                    │
│   - chokidar 监听项目目录               │
│   - 过滤代码文件 (.ts/.js/.py 等)      │
│   - 发送变更事件到批处理队列            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   BatchQueue                            │
│   - 100ms 窗口聚合变更                  │
│   - 去重相同文件                        │
│   - 批量触发解析                        │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   IncrementalParser                     │
│   - 复用旧 AST 树 (tree-sitter)        │
│   - 计算变更范围                        │
│   - 更新符号索引                        │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│   EnhancedLRUCache                      │
│   - 最大 100 个文件                     │
│   - 自动淘汰最久未用                    │
│   - 提供快速查询 API                    │
└─────────────────────────────────────────┘
```

### 2.2 接口设计

#### FileWatcherService
```typescript
interface FileWatcherConfig {
  projectRoot: string;
  ignored: string[];
  extensions: string[];
}

class FileWatcherService {
  start(config: FileWatcherConfig): void;
  stop(): void;
  on(event: 'change', handler: (path: string) => void): void;
}
```

#### BatchQueue
```typescript
interface BatchQueueConfig {
  windowMs: number;
  maxBatchSize: number;
}

class BatchQueue {
  enqueue(filePath: string): void;
  on(event: 'batch', handler: (files: string[]) => void): void;
}
```

#### IncrementalParser
```typescript
interface ParseResult {
  tree: Parser.Tree;
  symbols: Symbol[];
  changedRanges: Range[];
  parseTime: number;
}

class IncrementalParser {
  parse(filePath: string, oldTree?: Parser.Tree): Promise<ParseResult>;
  parseBatch(files: string[]): Promise<Map<string, ParseResult>>;
}
```

#### EnhancedLRUCache
```typescript
interface CacheEntry {
  tree: Parser.Tree;
  symbols: Symbol[];
  timestamp: number;
  accessCount: number;
}

class EnhancedLRUCache {
  set(key: string, value: CacheEntry): void;
  get(key: string): CacheEntry | undefined;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  size(): number;
}
```

---

## 3. 实现细节

### 3.1 文件监听实现

**依赖**: `chokidar@^4.0.0`

**配置**:
```typescript
const watcherConfig = {
  ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50
  }
};
```

**关键点**:
- `ignoreInitial: true` - 启动时不触发已存在文件的事件
- `awaitWriteFinish` - 等待文件写入完成，避免读取不完整内容
- 仅监听 `change` 事件，忽略 `add`/`unlink`

### 3.2 批处理队列实现

**核心逻辑**:
```typescript
class BatchQueue {
  private queue = new Set<string>();
  private timer: NodeJS.Timeout | null = null;

  enqueue(filePath: string) {
    this.queue.add(filePath);
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 100);
    }
  }

  private flush() {
    const files = Array.from(this.queue);
    this.queue.clear();
    this.timer = null;
    this.emit('batch', files);
  }
}
```

**优势**:
- 自动去重（Set 数据结构）
- 100ms 窗口聚合多次保存
- 提升吞吐量

### 3.3 增量解析实现

**核心逻辑**:
```typescript
async function incrementalParse(filePath: string): Promise<ParseResult> {
  const oldTree = cache.get(filePath)?.tree;
  const content = await fs.readFile(filePath, 'utf8');
  const parser = getParser(filePath);

  const tree = parser.parse(content, oldTree);
  const symbols = extractSymbols(tree);
  const changedRanges = oldTree ? tree.getChangedRanges(oldTree) : [];

  cache.set(filePath, { tree, symbols, timestamp: Date.now() });
  return { tree, symbols, changedRanges, parseTime: Date.now() };
}
```

**关键优化**:
- 复用 `oldTree` 参数实现增量解析
- Tree-sitter 自动计算变更范围
- 仅重新解析变更部分

### 3.4 缓存优化实现

**LRU 缓存**:
```typescript
class EnhancedLRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;

  set(key: string, value: CacheEntry) {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.findOldest();
      this.cache.delete(oldest);
    }
    this.cache.set(key, value);
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      entry.timestamp = Date.now();
      entry.accessCount++;
    }
    return entry;
  }

  private findOldest() {
    return Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
  }
}
```

**优势**:
- 纯内存，访问速度快
- 自动淘汰冷文件
- 访问计数支持热度分析

---

## 4. 实施计划

### 4.1 文件结构
```
src/parser/
├── file-watcher.ts          # 文件监听服务
├── batch-queue.ts           # 批处理队列
├── incremental-parser.ts    # 增量解析器
├── enhanced-cache.ts        # 增强缓存
└── index.ts                 # 统一导出
```

### 4.2 依赖安装
```bash
npm install chokidar@^4.0.0
```

### 4.3 实施步骤
1. 实现 EnhancedLRUCache（1h）
2. 实现 BatchQueue（1h）
3. 实现 FileWatcherService（2h）
4. 实现 IncrementalParser（2h）
5. 集成测试（2h）

**总计**: 8 小时

---

## 5. 测试策略

### 5.1 单元测试
- EnhancedLRUCache: 测试淘汰策略
- BatchQueue: 测试去重和窗口聚合
- IncrementalParser: 测试增量解析正确性

### 5.2 集成测试
- 文件保存触发解析流程
- 批量文件变更处理
- 缓存命中率验证

### 5.3 性能测试
- 解析延迟 < 100ms
- 批处理吞吐量 > 50 files/batch
- 缓存命中率 > 80%

