# AI Inference Service 设计文档

## 1. 概述

基于 ONNX Runtime Node.js 的通用 AI 推理服务，支持多模型注册、动态加载、结果缓存和批处理优化。

---

## 2. 架构设计

### 2.1 核心架构

```
InferenceService (单例)
  ├─ ModelRegistry (模型注册表)
  │   └─ Map<modelId, ModelConfig>
  ├─ ModelLoader (模型加载器)
  │   └─ 使用 onnxruntime-node
  ├─ InferenceEngine (推理引擎)
  │   ├─ preprocess (预处理)
  │   ├─ inference (推理)
  │   └─ postprocess (后处理)
  ├─ TaskRouter (任务路由)
  │   └─ 根据任务类型选择模型
  └─ ResultCache (结果缓存)
      └─ LRU 缓存，基于输入哈希
```

### 2.2 数据流

```
用户请求 → TaskRouter → 选择模型 → ResultCache 检查
  → (缓存未命中) → ModelLoader → InferenceEngine
  → preprocess → inference → postprocess → 缓存结果 → 返回
```

---

## 3. 数据模型

### 3.1 核心类型

```typescript
// 模型配置
interface ModelConfig {
  id: string;              // 模型唯一标识
  name: string;            // 显示名称
  path: string;            // ONNX 模型文件路径
  taskType: TaskType;      // 支持的任务类型
  inputShape: number[];    // 输入张量形状
  outputShape: number[];   // 输出张量形状
  quantized: boolean;      // 是否量化
}

// 任务类型
enum TaskType {
  CODE_EMBEDDING = 'code_embedding',    // 代码向量化
  CODE_COMPLETION = 'code_completion',  // 代码补全
  CODE_SUMMARY = 'code_summary',        // 代码摘要
}

// 推理请求
interface InferenceRequest {
  taskType: TaskType;
  input: string | number[];
  options?: {
    maxLength?: number;
    temperature?: number;
  };
}

// 推理结果
interface InferenceResult {
  output: number[] | string;
  latency: number;
  cached: boolean;
}
```

---

## 4. 目录结构

```
src/inference/
  ├─ index.ts              # 导出接口
  ├─ inference-service.ts  # 主服务类
  ├─ model-registry.ts     # 模型注册表
  ├─ model-loader.ts       # 模型加载器
  ├─ inference-engine.ts   # 推理引擎
  ├─ task-router.ts        # 任务路由
  ├─ result-cache.ts       # 结果缓存
  ├─ types.ts              # 类型定义
  └─ models/               # 内置模型目录
      └─ code-embedding/
          ├─ model.onnx
          └─ config.json
```

---

## 5. 核心组件设计

### 5.1 InferenceService (主服务)

**职责**: 统一入口，协调各组件

**接口**:
```typescript
class InferenceService {
  private static instance: InferenceService;

  static getInstance(): InferenceService;

  // 注册模型
  registerModel(config: ModelConfig): void;

  // 执行推理
  async infer(request: InferenceRequest): Promise<InferenceResult>;

  // 预热模型
  async warmup(modelId: string): Promise<void>;

  // 卸载模型
  unloadModel(modelId: string): void;

  // 清理资源
  dispose(): void;
}
```

### 5.2 ModelRegistry (模型注册表)

**职责**: 管理模型配置

**接口**:
```typescript
class ModelRegistry {
  private models = new Map<string, ModelConfig>();

  register(config: ModelConfig): void;
  get(modelId: string): ModelConfig | undefined;
  getByTaskType(taskType: TaskType): ModelConfig[];
  list(): ModelConfig[];
}
```

### 5.3 ModelLoader (模型加载器)

**职责**: 加载和管理 ONNX 模型

**接口**:
```typescript
class ModelLoader {
  private sessions = new Map<string, InferenceSession>();

  async load(config: ModelConfig): Promise<InferenceSession>;
  get(modelId: string): InferenceSession | undefined;
  unload(modelId: string): void;
}
```

### 5.4 InferenceEngine (推理引擎)

**职责**: 执行推理计算

**接口**:
```typescript
class InferenceEngine {
  async run(
    session: InferenceSession,
    input: Tensor,
    config: ModelConfig
  ): Promise<Tensor>;

  preprocess(input: string | number[], config: ModelConfig): Tensor;
  postprocess(output: Tensor, config: ModelConfig): number[] | string;
}
```

### 5.5 TaskRouter (任务路由)

**职责**: 根据任务类型选择模型

**接口**:
```typescript
class TaskRouter {
  constructor(private registry: ModelRegistry);

  selectModel(taskType: TaskType): ModelConfig;
}
```

### 5.6 ResultCache (结果缓存)

**职责**: 缓存推理结果

**接口**:
```typescript
class ResultCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;

  get(key: string): InferenceResult | undefined;
  set(key: string, result: InferenceResult): void;
  clear(): void;

  private generateKey(request: InferenceRequest): string;
}
```

---

## 6. 依赖管理

### 6.1 新增依赖

```json
{
  "dependencies": {
    "onnxruntime-node": "^1.17.0"
  }
}
```

### 6.2 内置模型

**初期**: 仅包含一个轻量级代码向量化模型（~50MB）

**模型来源**:
- Hugging Face 预训练模型
- 转换为 ONNX 格式
- 量化为 INT8 减小体积

---

## 7. 性能指标

### 7.1 目标指标

| 指标 | 目标值 |
|------|--------|
| 推理延迟 | < 1s |
| 内存占用 | < 300MB |
| 缓存命中率 | > 80% |
| 模型加载时间 | < 2s |

### 7.2 优化策略

1. **模型量化**: INT8 量化减少 50% 内存
2. **结果缓存**: LRU 缓存避免重复计算
3. **懒加载**: 按需加载模型
4. **批处理**: 支持批量推理（未来）

---

## 8. 集成方案

### 8.1 与现有系统集成

```typescript
// 在 Chat API 中使用
import { inferenceService } from '@/inference';

const embedding = await inferenceService.infer({
  taskType: TaskType.CODE_EMBEDDING,
  input: codeSnippet
});
```

### 8.2 初始化时机

- 应用启动时注册模型
- 首次使用时加载模型（懒加载）
- 健康检查端点触发预热

---

## 9. 测试策略

### 9.1 单元测试

- ModelRegistry 注册和查询
- ModelLoader 加载和卸载
- InferenceEngine 预处理和后处理
- ResultCache 缓存逻辑

### 9.2 集成测试

- 端到端推理流程
- 多模型并发推理
- 缓存命中率验证
- 性能基准测试

---

## 10. 风险和限制

### 10.1 技术风险

1. **原生依赖**: onnxruntime-node 需要编译，可能在某些平台失败
2. **模型体积**: 内置模型增加安装包大小
3. **内存占用**: 多模型同时加载可能超出限制

### 10.2 缓解措施

1. 提供预编译二进制文件
2. 使用量化模型减小体积
3. 实现模型卸载机制

---

## 11. 未来扩展

### 11.1 短期（1-2 个月）

- 添加代码补全模型
- 实现批处理推理
- 优化缓存策略

### 11.2 长期（3-6 个月）

- 支持用户自定义模型
- GPU 加速支持
- 分布式推理

---

## 12. 实施计划

详见 `ai-inference-service-implementation.md`
