/**
 * Phase 0 安全配置常量
 * 定义所有安全限制和验证规则
 */

export const SECURITY_LIMITS = {
  // Tree-sitter 限制
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AST_DEPTH: 500,
  MAX_CONCURRENT_PARSING: 5,
  PARSE_TIMEOUT: 5000, // 5秒

  // 向量检索限制
  VECTOR_DIMENSION: 768, // 标准 embedding 维度
  MAX_VECTOR_NORM: 1e6,
  MIN_VECTOR_NORM: 1e-6,

  // 路径验证
  ALLOWED_EXTENSIONS: ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'],
  BLOCKED_PATHS: ['node_modules', '.git', 'dist', 'build'],
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '文件超过 10MB 限制',
  AST_TOO_DEEP: 'AST 深度超过 500 层限制',
  PARSE_TIMEOUT: '解析超时（5秒）',
  INVALID_PATH: '路径不在白名单中',
  INVALID_VECTOR: '向量维度或范数异常',
} as const;
