# CodeT5+ 模型获取指南

## 方案 A: 使用转换脚本（推荐用于生产）

### 前置要求
```bash
pip install torch transformers onnx
```

### 执行转换
```bash
cd scripts
python convert-codet5-to-onnx.py
```

这将下载并转换：
- `Salesforce/codet5-base` (220M 参数) → `models/codet5-base/model.onnx`
- `Salesforce/codet5-large` (770M 参数) → `models/codet5-large/model.onnx`

**注意**: 首次运行需要下载 ~4GB 模型文件，耗时 10-30 分钟。

---

## 方案 B: 使用简化模型验证架构（快速测试）

暂时使用现有的 `fast-embedding` 模型验证三层架构：

```typescript
// 在 inference-service.ts 中
async initialize(): Promise<void> {
  // Fast 层 - 使用现有模型
  const fastModel: ModelConfig = {
    id: 'fast-embedding',
    taskTypes: [TaskType.CODE_EMBEDDING, TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
    tier: ModelTier.FAST,
  };

  // Standard 和 Premium 层暂时也使用 fast-embedding
  const standardModel = { ...fastModel, id: 'standard-mock', tier: ModelTier.STANDARD };
  const premiumModel = { ...fastModel, id: 'premium-mock', tier: ModelTier.PREMIUM };

  this.registry.register(fastModel);
  this.registry.register(standardModel);
  this.registry.register(premiumModel);
}
```

这样可以：
- ✅ 立即运行集成测试
- ✅ 验证路由逻辑正确性
- ✅ 验证多任务支持
- ⚠️ 性能指标不真实（所有层延迟相同）

---

## 方案 C: 从 ONNX Model Zoo 下载预转换模型

搜索社区已转换的 CodeT5 ONNX 模型：
