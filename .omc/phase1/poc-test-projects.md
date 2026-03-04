# POC 测试项目准备

## 测试项目规模

| 规模 | 文件数 | 用途 |
|------|--------|------|
| 小型 | 1K | 基本功能验证 |
| 中型 | 10K | 性能基准测试 |
| 大型 | 50K | 内存占用测试 |
| 超大 | 100K | 降级策略验证 |

## 推荐开源项目

### 小型项目（~1K 文件）
- **Express.js** - https://github.com/expressjs/express
- **Lodash** - https://github.com/lodash/lodash

### 中型项目（~10K 文件）
- **React** - https://github.com/facebook/react
- **Vue.js** - https://github.com/vuejs/vue

### 大型项目（~50K 文件）
- **VS Code** - https://github.com/microsoft/vscode
- **Angular** - https://github.com/angular/angular

### 超大项目（~100K 文件）
- **Chromium** (部分) - 需要筛选子目录
- **Linux Kernel** (部分) - 需要筛选子目录

## 准备步骤

1. 克隆测试项目到 `.omc/poc-test-projects/`
2. 统计实际文件数
3. 记录项目元信息
