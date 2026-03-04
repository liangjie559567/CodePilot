# Code Parse Service 集成设计文档

## 目标
将已完成的 Code Parse Service 集成到 CodePilot 主应用，为 AI 对话提供实时代码上下文。

## 架构方案：轻量级集成（方案 A）

### 核心设计

```
Next.js Server Startup
    ↓
CodeParseManager (singleton)
    ↓
Monitor session working directories
    ↓
Parse results → SQLite
    ↓
Chat API → Query context → Attach to Claude
```

### 组件设计

#### 1. CodeParseManager (`src/lib/code-parse-manager.ts`)
- 单例模式管理多项目解析服务
- 为每个工作目录维护独立的 CodeParseService 实例
- 生命周期管理（启动/停止/清理）

#### 2. 数据库扩展 (`src/lib/db.ts`)
新增表：`code_parse_results`
```sql
CREATE TABLE code_parse_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  project_root TEXT NOT NULL,
  symbols TEXT,
  ast_summary TEXT,
  last_parsed INTEGER NOT NULL,
  session_id TEXT,
  UNIQUE(file_path, project_root)
);
```

#### 3. 上下文注入 (`src/app/api/chat/route.ts`)
- 在发送消息前查询相关代码
- 附加到 systemPromptAppend
- 限制上下文大小（最多 5 个文件）

### 数据流

```
File Change → Chokidar → BatchQueue → Parser
                ↓
            SQLite Storage
                ↓
User Message → Query relevant files → Attach context → Claude
```

### 性能考虑
- 仅解析变更文件（增量）
- 缓存解析结果（LRU）
- 批处理减少 I/O
- 上下文大小限制

---

## 实施计划概览

1. 创建 CodeParseManager 服务层
2. 扩展数据库 schema
3. 修改 chat API 注入上下文
4. 在服务器启动时初始化
5. 测试和验证
