# CodePilot vNext - Phase 2: 详细设计与接口定义

## 文档信息
- **版本**: 1.0.0
- **日期**: 2026-03-04
- **状态**: Draft
- **负责团队**: 核心算法组、基础设施组、前端工程组

---

## 1. 核心微服务架构

### 1.1 服务拆分

```
┌─────────────────────────────────────────────────────┐
│                  API Gateway Layer                  │
│              (Next.js API Routes)                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────┬────────────────┐
│  Code Parse  │  AI Inference│  Vector DB   │  Task Scheduler│
│   Service    │   Service    │   Service    │    Service     │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### 1.2 服务职责

**Code Parse Service (代码解析服务)**
- 增量解析代码文件
- 生成 AST 和符号表
- 缓存解析结果
- 监听文件变更

**AI Inference Service (AI 推理服务)**
- 模型加载和量化
- 推理请求处理
- 结果缓存
- 批处理优化

**Vector DB Service (向量数据库服务)**
- 向量索引构建
- 相似度检索
- 增量更新索引
- 持久化管理

**Task Scheduler Service (任务调度服务)**
- 资源监控
- 任务队列管理
- 优先级调度
- 负载均衡


---

## 2. API 接口定义

### 2.1 Code Parse Service API

#### 2.1.1 增量解析接口

**POST /api/parse/incremental**

请求体:
```typescript
interface IncrementalParseRequest {
  filePath: string;
  content: string;
  language: string;
  previousTreeId?: string;  // 用于增量解析
}
```

响应:
```typescript
interface IncrementalParseResponse {
  treeId: string;
  ast: ASTNode;
  symbols: Symbol[];
  changedRanges: Range[];
  parseTime: number;
}
```

#### 2.1.2 批量解析接口

**POST /api/parse/batch**

请求体:
```typescript
interface BatchParseRequest {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  priority: number;
}
```

响应:
```typescript
interface BatchParseResponse {
  results: IncrementalParseResponse[];
  totalTime: number;
  cacheHits: number;
}
```


### 2.2 AI Inference Service API

#### 2.2.1 模型推理接口

**POST /api/inference/complete**

请求体:
```typescript
interface InferenceRequest {
  prompt: string;
  context: string[];
  modelId: string;
  maxTokens: number;
  temperature: number;
}
```

响应:
```typescript
interface InferenceResponse {
  completion: string;
  tokens: number;
  latency: number;
  cached: boolean;
}
```

#### 2.2.2 批量推理接口

**POST /api/inference/batch**

请求体:
```typescript
interface BatchInferenceRequest {
  requests: InferenceRequest[];
  priority: number;
}
```


### 2.3 Vector DB Service API

#### 2.3.1 向量索引构建

**POST /api/vector/index/build**

```typescript
interface BuildIndexRequest {
  vectors: Array<{
    id: string;
    vector: number[];
    metadata: Record<string, any>;
  }>;
  indexType: 'HNSW' | 'IVF' | 'Flat';
  dimension: number;
}

interface BuildIndexResponse {
  indexId: string;
  vectorCount: number;
  buildTime: number;
}
```

#### 2.3.2 相似度检索

**POST /api/vector/search**

```typescript
interface VectorSearchRequest {
  query: number[];
  k: number;
  indexId: string;
  filters?: Record<string, any>;
}

interface VectorSearchResponse {
  results: Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  searchTime: number;
}
```


### 2.4 Task Scheduler Service API

#### 2.4.1 任务提交

**POST /api/scheduler/submit**

```typescript
interface TaskSubmitRequest {
  type: 'parse' | 'inference' | 'index' | 'search';
  priority: number;
  payload: any;
  estimatedCost: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
}

interface TaskSubmitResponse {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  queuePosition: number;
}
```

#### 2.4.2 任务状态查询

**GET /api/scheduler/status/:taskId**

```typescript
interface TaskStatusResponse {
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}
```


---

## 3. 数据流设计

### 3.1 增量解析数据流

```
文件变更事件
    ↓
文件监听器 (Chokidar)
    ↓
变更检测 (diff)
    ↓
Tree-sitter 增量解析
    ↓
AST 缓存更新
    ↓
符号表更新
    ↓
向量索引增量更新
```

### 3.2 AI 推理数据流

```
用户输入
    ↓
上下文收集 (向量检索)
    ↓
Prompt 构建
    ↓
缓存查询
    ↓ (miss)
模型推理 (ONNX Runtime)
    ↓
结果缓存
    ↓
流式返回
```


### 3.3 缓存策略设计

#### 3.3.1 多层缓存架构

```
L1: 内存缓存 (LRU)
├─ AST 缓存 (最近访问的 100 个文件)
├─ 推理结果缓存 (最近 1000 个请求)
└─ 向量缓存 (热点查询结果)

L2: 磁盘缓存 (SQLite)
├─ 完整 AST 持久化
├─ 向量索引持久化
└─ 推理历史记录

L3: 增量更新
├─ 仅缓存变更部分
├─ 基于时间戳的失效策略
└─ 智能预加载
```

#### 3.3.2 缓存失效策略

```typescript
interface CachePolicy {
  // LRU 策略
  maxSize: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL';
  
  // TTL 策略
  ttl: {
    ast: number;        // 30 分钟
    inference: number;  // 1 小时
    vector: number;     // 永久 (手动失效)
  };
  
  // 失效触发
  invalidateOn: {
    fileChange: boolean;
    modelUpdate: boolean;
    manualClear: boolean;
  };
}
```


---

## 4. AI 推理服务详细设计

### 4.1 模型加载策略

```typescript
interface ModelLoadingStrategy {
  // 预加载策略
  preload: {
    enabled: boolean;
    models: string[];      // 启动时预加载的模型
    warmupRequests: number; // 预热请求数
  };
  
  // 懒加载策略
  lazyLoad: {
    enabled: boolean;
    timeout: number;       // 空闲卸载时间 (秒)
    maxModels: number;     // 最大同时加载模型数
  };
}
```

### 4.2 模型量化方案

```typescript
// 量化配置
const quantizationConfig = {
  // 动态量化 (推荐)
  dynamic: {
    precision: 'int8',
    calibrationSamples: 100,
    optimizationLevel: 3,
  },
  
  // 静态量化 (高性能)
  static: {
    precision: 'int8',
    calibrationDataset: './calibration.json',
    quantizeWeights: true,
    quantizeActivations: true,
  }
};
```


---

## 5. 向量数据库详细设计

### 5.1 HNSW 索引结构

```typescript
interface HNSWIndexConfig {
  // 图结构参数
  M: 16;                    // 每层最大连接数
  efConstruction: 200;      // 构建时搜索深度
  efSearch: 100;            // 查询时搜索深度
  
  // 层级参数
  maxLevel: number;         // 最大层数
  levelMultiplier: 1 / Math.log(2);
  
  // 距离度量
  metric: 'cosine' | 'l2' | 'ip';
}
```

### 5.2 索引构建流程

```
1. 初始化空图
2. 逐个插入向量
   ├─ 随机选择层级
   ├─ 从顶层开始搜索
   ├─ 找到最近邻居
   └─ 建立双向连接
3. 持久化到磁盘
```


---

## 6. 任务调度系统详细设计

### 6.1 调度算法

```typescript
// 优先级队列调度算法
class PriorityScheduler {
  // 调度决策
  selectNextTask(): Task | null {
    // 1. 检查资源可用性
    const available = this.getAvailableResources();
    
    // 2. 从优先级队列中选择
    for (const task of this.queue) {
      if (this.canExecute(task, available)) {
        return task;
      }
    }
    
    return null;
  }
  
  // 资源评估
  canExecute(task: Task, available: Resources): boolean {
    return (
      task.estimatedCost.cpu <= available.cpu &&
      task.estimatedCost.memory <= available.memory &&
      (!task.estimatedCost.gpu || task.estimatedCost.gpu <= available.gpu)
    );
  }
}
```


### 6.2 组件交互流程

```
用户请求
    ↓
API Gateway
    ↓
Task Scheduler (评估资源)
    ↓
┌─────────┬─────────┬─────────┐
│ Parse   │ Inference│ Vector  │
│ Service │ Service  │ Service │
└─────────┴─────────┴─────────┘
    ↓
结果聚合
    ↓
返回用户
```


---

## 7. UI/UX 增强功能原型

### 7.1 协作功能设计

#### 7.1.1 实时协作面板

```
┌─────────────────────────────────────┐
│  协作会话                            │
│  ┌─────────────────────────────┐   │
│  │ 👤 用户A (正在编辑 main.ts) │   │
│  │ 👤 用户B (正在查看 api.ts)  │   │
│  └─────────────────────────────┘   │
│                                     │
│  共享上下文                          │
│  ├─ 当前项目: CodePilot            │
│  ├─ 活跃文件: 3 个                 │
│  └─ 同步状态: ✅ 已同步            │
└─────────────────────────────────────┘
```


### 7.2 垂直领域功能

#### 7.2.1 前端开发模式

```
┌─────────────────────────────────────┐
│  前端开发助手                        │
│  ┌─────────────────────────────┐   │
│  │ 🎨 组件预览                 │   │
│  │ 📱 响应式测试               │   │
│  │ ♿ 无障碍检查               │   │
│  │ 🎯 性能分析                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### 7.2.2 后端开发模式

```
┌─────────────────────────────────────┐
│  后端开发助手                        │
│  ┌─────────────────────────────┐   │
│  │ 🔌 API 测试                 │   │
│  │ 🗄️ 数据库查询              │   │
│  │ 📊 性能监控                 │   │
│  │ 🔒 安全扫描                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

