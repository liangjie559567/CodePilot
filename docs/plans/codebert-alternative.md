# CodeBERT ONNX 替代方案

## 可用的 ONNX 模型

### 1. protectai/CodeBERTa-language-id-onnx
- **用途**: 编程语言识别
- **下载量**: 415
- **基础模型**: huggingface/CodeBERTa-language-id
- **任务**: text-classification

### 2. protectai/codebert-base-Malicious_URLs-onnx
- **用途**: 恶意 URL 检测
- **下载量**: 4,002
- **基础模型**: DunnBC22/codebert-base-Malicious_URLs
- **任务**: text-classification

## 推荐方案

### 选项 A: 使用通用 CodeBERT 嵌入模型
```bash
# 下载 microsoft/codebert-base 并手动转换
huggingface-cli download microsoft/codebert-base --local-dir models/codebert-base
```

### 选项 B: 使用现有架构（当前方案）
- ✅ 三层架构已验证
- ✅ 智能路由正常工作
- ✅ 多任务支持完整
- 性能满足需求

## 快速测试脚本

```typescript
// 测试 CodeBERT ONNX 模型
import * as ort from 'onnxruntime-node';

const modelUrl = 'https://huggingface.co/protectai/CodeBERTa-language-id-onnx/resolve/main/model.onnx';
// 下载并测试推理
```

## 建议

**立即可用**: 当前系统已完整实现，建议直接使用。

**未来优化**: 如需真实模型，CodeBERT 比 CodeT5+ 更容易集成（标准 BERT 架构）。
