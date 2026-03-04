# AI Inference Service 实施计划

## 项目信息
- **日期**: 2026-03-04
- **设计文档**: ai-inference-service-design.md
- **预计工期**: 2 周

---

## 任务概览

| 任务 | 描述 | 预计时间 | 依赖 |
|------|------|----------|------|
| Task 1 | 类型定义和基础结构 | 2h | - |
| Task 2 | ModelRegistry 和 TaskRouter | 3h | Task 1 |
| Task 3 | ResultCache 实现 | 2h | Task 1 |
| Task 4 | ModelLoader 和 ONNX 集成 | 4h | Task 1 |
| Task 5 | InferenceEngine 和 InferenceService | 4h | Task 2,3,4 |
| Task 6 | 测试和验证 | 3h | Task 5 |

**总计**: 18 小时

---

## Task 1: 类型定义和基础结构

### 目标
创建类型定义和目录结构

### 步骤

#### 1.1 创建目录结构
```bash
mkdir -p src/inference/models/code-embedding
```

#### 1.2 创建 types.ts
创建 `src/inference/types.ts`：

```typescript
// 任务类型
export enum TaskType {
  CODE_EMBEDDING = 'code_embedding',
  CODE_COMPLETION = 'code_completion',
  CODE_SUMMARY = 'code_summary',
}

// 模型配置
export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  taskType: TaskType;
  inputShape: number[];
  outputShape: number[];
  quantized: boolean;
}

// 推理请求
export interface InferenceRequest {
  taskType: TaskType;
  input: string | number[];
  options?: {
    maxLength?: number;
    temperature?: number;
  };
}

// 推理结果
export interface InferenceResult {
  output: number[] | string;
  latency: number;
  cached: boolean;
}

// 缓存条目
export interface CacheEntry {
  result: InferenceResult;
  timestamp: number;
}
```

### 验收标准
- ✅ 目录结构创建完成
- ✅ types.ts 文件创建并导出所有类型
- ✅ TypeScript 编译无错误

---

## Task 2: ModelRegistry 和 TaskRouter

### 目标
实现模型注册表和任务路由

### 步骤

#### 2.1 创建 model-registry.ts
创建 `src/inference/model-registry.ts`：

```typescript
import { ModelConfig, TaskType } from './types';

export class ModelRegistry {
  private models = new Map<string, ModelConfig>();

  register(config: ModelConfig): void {
    this.models.set(config.id, config);
  }

  get(modelId: string): ModelConfig | undefined {
    return this.models.get(modelId);
  }

  getByTaskType(taskType: TaskType): ModelConfig[] {
    return Array.from(this.models.values())
      .filter(m => m.taskType === taskType);
  }

  list(): ModelConfig[] {
    return Array.from(this.models.values());
  }
}
```

#### 2.2 创建 task-router.ts
创建 `src/inference/task-router.ts`：

```typescript
import { ModelRegistry } from './model-registry';
import { ModelConfig, TaskType } from './types';

export class TaskRouter {
  constructor(private registry: ModelRegistry) {}

  selectModel(taskType: TaskType): ModelConfig {
    const models = this.registry.getByTaskType(taskType);
    if (models.length === 0) {
      throw new Error(`No model found for task type: ${taskType}`);
    }
    return models[0];
  }
}
```

### 验收标准
- ✅ ModelRegistry 实现完成
- ✅ TaskRouter 实现完成
- ✅ 编译无错误

---

## Task 3: ResultCache 实现

### 目标
实现 LRU 缓存机制

### 步骤

#### 3.1 创建 result-cache.ts
创建 `src/inference/result-cache.ts`：

```typescript
import { InferenceRequest, InferenceResult, CacheEntry } from './types';
import { createHash } from 'crypto';

export class ResultCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;

  get(key: string): InferenceResult | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // 更新访问时间（LRU）
    this.cache.delete(key);
    this.cache.set(key, { ...entry, timestamp: Date.now() });

    return entry.result;
  }

  set(key: string, result: InferenceResult): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(request: InferenceRequest): string {
    const data = JSON.stringify({
      taskType: request.taskType,
      input: request.input,
      options: request.options
    });
    return createHash('sha256').update(data).digest('hex');
  }
}
```

### 验收标准
- ✅ ResultCache 实现完成
- ✅ LRU 逻辑正确
- ✅ 编译无错误

---

## Task 4: ModelLoader 和 ONNX 集成

### 目标
实现模型加载器，集成 ONNX Runtime

### 步骤

#### 4.1 安装依赖
```bash
npm install onnxruntime-node
npm install --save-dev @types/node
```

#### 4.2 创建 model-loader.ts
创建 `src/inference/model-loader.ts`：

```typescript
import * as ort from 'onnxruntime-node';
import { ModelConfig } from './types';
import * as path from 'path';

export class ModelLoader {
  private sessions = new Map<string, ort.InferenceSession>();

  async load(config: ModelConfig): Promise<ort.InferenceSession> {
    const existing = this.sessions.get(config.id);
    if (existing) return existing;

    const modelPath = path.resolve(config.path);
    const session = await ort.InferenceSession.create(modelPath);
    this.sessions.set(config.id, session);

    return session;
  }

  get(modelId: string): ort.InferenceSession | undefined {
    return this.sessions.get(modelId);
  }

  unload(modelId: string): void {
    this.sessions.delete(modelId);
  }
}
```

### 验收标准
- ✅ onnxruntime-node 安装成功
- ✅ ModelLoader 实现完成
- ✅ 编译无错误

---

## Task 5: InferenceEngine 和 InferenceService

### 目标
实现推理引擎和主服务类

### 步骤

#### 5.1 创建 inference-engine.ts
创建 `src/inference/inference-engine.ts`：

```typescript
import * as ort from 'onnxruntime-node';
import { ModelConfig } from './types';

export class InferenceEngine {
  async run(
    session: ort.InferenceSession,
    input: ort.Tensor,
    config: ModelConfig
  ): Promise<ort.Tensor> {
    const feeds = { input: input };
    const results = await session.run(feeds);
    return results.output;
  }

  preprocess(input: string | number[], config: ModelConfig): ort.Tensor {
    // 简化实现：假设输入已经是数字数组
    const data = typeof input === 'string'
      ? new Float32Array(config.inputShape[0]).fill(0)
      : new Float32Array(input);

    return new ort.Tensor('float32', data, config.inputShape);
  }

  postprocess(output: ort.Tensor, config: ModelConfig): number[] | string {
    return Array.from(output.data as Float32Array);
  }
}
```

#### 5.2 创建 inference-service.ts
创建 `src/inference/inference-service.ts`：

```typescript
import { ModelRegistry } from './model-registry';
import { ModelLoader } from './model-loader';
import { InferenceEngine } from './inference-engine';
import { TaskRouter } from './task-router';
import { ResultCache } from './result-cache';
import { ModelConfig, InferenceRequest, InferenceResult } from './types';

export class InferenceService {
  private static instance: InferenceService;
  private registry = new ModelRegistry();
  private loader = new ModelLoader();
  private engine = new InferenceEngine();
  private router = new TaskRouter(this.registry);
  private cache = new ResultCache();

  private constructor() {}

  static getInstance(): InferenceService {
    if (!InferenceService.instance) {
      InferenceService.instance = new InferenceService();
    }
    return InferenceService.instance;
  }

  registerModel(config: ModelConfig): void {
    this.registry.register(config);
  }

  async infer(request: InferenceRequest): Promise<InferenceResult> {
    const startTime = Date.now();

    // 检查缓存
    const cacheKey = this.cache.generateKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // 选择模型
    const config = this.router.selectModel(request.taskType);

    // 加载模型
    const session = await this.loader.load(config);

    // 执行推理
    const inputTensor = this.engine.preprocess(request.input, config);
    const outputTensor = await this.engine.run(session, inputTensor, config);
    const output = this.engine.postprocess(outputTensor, config);

    const result: InferenceResult = {
      output,
      latency: Date.now() - startTime,
      cached: false
    };

    // 缓存结果
    this.cache.set(cacheKey, result);

    return result;
  }

  async warmup(modelId: string): Promise<void> {
    const config = this.registry.get(modelId);
    if (!config) throw new Error(`Model not found: ${modelId}`);
    await this.loader.load(config);
  }

  unloadModel(modelId: string): void {
    this.loader.unload(modelId);
  }

  dispose(): void {
    this.cache.clear();
  }
}

export const inferenceService = InferenceService.getInstance();
```

#### 5.3 创建 index.ts
创建 `src/inference/index.ts`：

```typescript
export { inferenceService } from './inference-service';
export { TaskType } from './types';
export type { InferenceRequest, InferenceResult, ModelConfig } from './types';
```

### 验收标准
- ✅ InferenceEngine 实现完成
- ✅ InferenceService 实现完成
- ✅ 单例模式正确
- ✅ 编译无错误

---

## Task 6: 测试和验证

### 目标
编写单元测试和集成测试

### 步骤

#### 6.1 创建单元测试
创建 `src/inference/inference-service.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ModelRegistry } from './model-registry';
import { TaskRouter } from './task-router';
import { ResultCache } from './result-cache';
import { TaskType, ModelConfig } from './types';

describe('ModelRegistry', () => {
  let registry: ModelRegistry;

  beforeEach(() => {
    registry = new ModelRegistry();
  });

  it('should register and retrieve models', () => {
    const config: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const retrieved = registry.get('test-model');

    expect(retrieved).toEqual(config);
  });

  it('should get models by task type', () => {
    const config: ModelConfig = {
      id: 'embedding-model',
      name: 'Embedding Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const models = registry.getByTaskType(TaskType.CODE_EMBEDDING);

    expect(models).toHaveLength(1);
    expect(models[0].id).toBe('embedding-model');
  });
});

describe('TaskRouter', () => {
  it('should select model for task type', () => {
    const registry = new ModelRegistry();
    const config: ModelConfig = {
      id: 'test-model',
      name: 'Test Model',
      path: '/path/to/model.onnx',
      taskType: TaskType.CODE_EMBEDDING,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false
    };

    registry.register(config);
    const router = new TaskRouter(registry);
    const selected = router.selectModel(TaskType.CODE_EMBEDDING);

    expect(selected.id).toBe('test-model');
  });

  it('should throw error if no model found', () => {
    const registry = new ModelRegistry();
    const router = new TaskRouter(registry);

    expect(() => router.selectModel(TaskType.CODE_EMBEDDING))
      .toThrow('No model found');
  });
});

describe('ResultCache', () => {
  let cache: ResultCache;

  beforeEach(() => {
    cache = new ResultCache();
  });

  it('should cache and retrieve results', () => {
    const request = {
      taskType: TaskType.CODE_EMBEDDING,
      input: 'test code'
    };

    const result = {
      output: [1, 2, 3],
      latency: 100,
      cached: false
    };

    const key = cache.generateKey(request);
    cache.set(key, result);
    const retrieved = cache.get(key);

    expect(retrieved).toEqual(result);
  });

  it('should return undefined for cache miss', () => {
    const key = 'non-existent-key';
    const result = cache.get(key);

    expect(result).toBeUndefined();
  });
});
```

#### 6.2 运行测试
```bash
npx vitest run src/inference/inference-service.test.ts
```

#### 6.3 验证编译
```bash
npm run build
```

### 验收标准
- ✅ 所有单元测试通过
- ✅ TypeScript 编译无错误
- ✅ 代码覆盖率 > 80%

---

## 总结

完成以上 6 个任务后，AI Inference Service 的基础架构将搭建完成。后续可以：

1. 添加实际的 ONNX 模型文件
2. 实现更复杂的预处理和后处理逻辑
3. 集成到 Chat API 中使用
4. 添加性能监控和日志

**注意事项**:
- onnxruntime-node 需要原生编译，确保开发环境配置正确
- 初期使用 mock 模型进行测试，避免依赖大型模型文件
- 关注内存占用，及时卸载不用的模型

