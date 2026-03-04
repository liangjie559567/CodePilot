# Phase 0: 安全加固与设计 - Rough PRD

## 目标
完成 CodePilot vNext Phase 0 的安全加固、POC 验证和 UX 设计，为后续实施奠定基础。

## 范围

### Week 1-2: 安全加固
1. 修复 5 个 P0 安全漏洞
2. 实现 Tree-sitter 安全限制
3. 实现向量验证机制

### Week 2-3: UX 设计 + POC
1. 设计加载状态、错误提示、性能感知 UI
2. 设计轻量协作 UI（代码片段分享 + 评论）
3. Tree-sitter POC 验证（10K/50K/100K 文件）
4. FAISS 内存占用测试

## 验收标准
- 所有 P0 安全漏洞修复完成
- POC 验证通过（性能达标）
- UX 设计文档完成（Figma/文档）
- 安全测试通过

## 技术约束
- 使用现有 CodePilot 代码库
- 最小化代码改动
- 保持向后兼容
