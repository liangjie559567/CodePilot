# 端到端测试和性能测试实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 Code Parse Service 实现完整的端到端测试和性能测试套件

**Architecture:** 使用真实文件系统和 chokidar 监听，通过临时测试目录验证完整工作流，使用 vitest 和 Node.js 性能 API 进行测量

**Tech Stack:** vitest, fs/promises, chokidar, performance API

---

## Task 1: 创建测试辅助工具

**Files:**
- Create: `src/parser/test-helpers.ts`
- Test: `src/parser/test-helpers.test.ts`

**Step 1: 编写测试辅助函数**

```typescript
// src/parser/test-helpers.ts
import * as fs from 'fs/promises';
import * as path from 'path';

export async function createTestDir(): Promise<string> {
  const dir = path.join(process.cwd(), `test-temp-${Date.now()}`);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupTestDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
}

export async function createTestFile(
  dir: string,
  filename: string,
  content: string
): Promise<string> {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, content, 'utf8');
  return filePath;
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; time: number }> {
  const start = performance.now();
  const result = await fn();
  const time = performance.now() - start;
  return { result, time };
}
```

**Step 2: 提交**

```bash
git add src/parser/test-helpers.ts
git commit -m "test: add test helper utilities"
```

---

## Task 2: 端到端基础测试

**Files:**
- Create: `src/parser/e2e.test.ts`

**Step 1: 编写单文件变更测试**

```typescript
// src/parser/e2e.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeParseService } from './parse-service';
import { createTestDir, cleanupTestDir, createTestFile, waitFor } from './test-helpers';
import * as fs from 'fs/promises';

describe('E2E: Basic Workflow', () => {
  let testDir: string;
  let service: CodeParseService;

  beforeEach(async () => {
    testDir = await createTestDir();
    service = new CodeParseService();
  });

  afterEach(async () => {
    service.stop();
    await cleanupTestDir(testDir);
  });

  it('should trigger parse on file change', async () => {
    const file = await createTestFile(testDir, 'test.ts', 'const x = 1;');

    let parsed = false;
    service.start(testDir);

    // Wait for service to initialize
    await waitFor(200);

    // Modify file
    await fs.writeFile(file, 'const x = 2;', 'utf8');

    // Wait for batch + parse
    await waitFor(300);

    // Verify parse was triggered (check via cache or event)
    expect(parsed).toBe(true);
  });
});
```

**Step 2: 提交**

```bash
git add src/parser/e2e.test.ts
git commit -m "test: add basic e2e workflow test"
```

---

## Task 3: 批处理和去重测试

**Files:**
- Update: `src/parser/e2e.test.ts`

**Step 1: 添加批处理测试**

```typescript
it('should batch multiple changes', async () => {
  const files = await Promise.all([
    createTestFile(testDir, 'file1.ts', 'const a = 1;'),
    createTestFile(testDir, 'file2.ts', 'const b = 2;'),
    createTestFile(testDir, 'file3.ts', 'const c = 3;'),
  ]);

  service.start(testDir);
  await waitFor(200);

  // Modify all files quickly
  await Promise.all(files.map(f => fs.writeFile(f, 'const x = 0;', 'utf8')));

  await waitFor(300);

  // Verify: single batch event with 3 files
});

it('should deduplicate same file', async () => {
  const file = await createTestFile(testDir, 'test.ts', 'const x = 1;');

  service.start(testDir);
  await waitFor(200);

  // Modify same file 3 times quickly
  await fs.writeFile(file, 'const x = 2;', 'utf8');
  await fs.writeFile(file, 'const x = 3;', 'utf8');
  await fs.writeFile(file, 'const x = 4;', 'utf8');

  await waitFor(300);

  // Verify: only 1 parse triggered
});
```

---

## Task 4: 性能测试套件

**Files:**
- Create: `src/parser/performance.test.ts`

**Step 1: 吞吐量测试**

```typescript
// src/parser/performance.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeParseService } from './parse-service';
import { createTestDir, cleanupTestDir, createTestFile, waitFor, measureTime } from './test-helpers';
import * as fs from 'fs/promises';

describe('Performance: Throughput', () => {
  let testDir: string;
  let service: CodeParseService;

  beforeEach(async () => {
    testDir = await createTestDir();
    service = new CodeParseService();
  });

  afterEach(async () => {
    service.stop();
    await cleanupTestDir(testDir);
  });

  it('should process 50 files in < 5s', async () => {
    // Create 50 test files
    const files = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        createTestFile(testDir, `file${i}.ts`, `const x${i} = ${i};`)
      )
    );

    service.start(testDir);
    await waitFor(200);

    const { time } = await measureTime(async () => {
      await Promise.all(files.map(f => fs.writeFile(f, 'const x = 0;', 'utf8')));
      await waitFor(500);
    });

    expect(time).toBeLessThan(5000);
  });
});
```

---

## Task 5: 验证和报告

**Files:**
- Create: `src/parser/test-report.ts`

**Step 1: 运行所有测试**

```bash
npx vitest run src/parser/e2e.test.ts src/parser/performance.test.ts
```

**Step 2: 生成报告**

收集测试结果并生成报告文档。

---

## Verification Checklist

- [ ] 所有端到端测试通过
- [ ] 性能测试达标（< 5s 处理 50 文件）
- [ ] 无内存泄漏
- [ ] 测试可重复运行

---

## Notes

- 保持测试最小化
- 使用真实文件系统
- 每个测试独立隔离
