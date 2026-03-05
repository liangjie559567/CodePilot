/**
 * Security Validator for Tree-sitter Parser
 * Implements P0 security limits to prevent DoS and resource exhaustion
 */

import * as fs from 'fs';
import * as path from 'path';

// Security limits from Phase 0 security config
export const SECURITY_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AST_DEPTH: 500,
  MAX_CONCURRENT_PARSING: 5,
  PARSE_TIMEOUT: 5000, // 5 seconds
  VECTOR_DIMENSION: 768,
  MAX_VECTOR_NORM: 1e6,
  MIN_VECTOR_NORM: 1e-6,
  ALLOWED_EXTENSIONS: ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java'],
  BLOCKED_PATHS: ['node_modules', '.git', 'dist', 'build', 'out', '.next'],
} as const;

export class SecurityValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SecurityValidationError';
  }
}

/**
 * Validates file size before parsing
 */
export function validateFileSize(filePath: string): void {
  const stats = fs.statSync(filePath);
  if (stats.size > SECURITY_LIMITS.MAX_FILE_SIZE) {
    throw new SecurityValidationError(
      `File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds limit of ${SECURITY_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
      'FILE_TOO_LARGE',
      { filePath, size: stats.size, limit: SECURITY_LIMITS.MAX_FILE_SIZE }
    );
  }
}

/**
 * Validates file path against blocked paths
 */
export function validateFilePath(filePath: string): void {
  const normalized = path.normalize(filePath).replace(/\\/g, '/');

  for (const blocked of SECURITY_LIMITS.BLOCKED_PATHS) {
    if (normalized.includes(`/${blocked}/`) || normalized.endsWith(`/${blocked}`)) {
      throw new SecurityValidationError(
        `Path contains blocked directory: ${blocked}`,
        'BLOCKED_PATH',
        { filePath, blockedPath: blocked }
      );
    }
  }

  const ext = path.extname(filePath);
  if (ext && !SECURITY_LIMITS.ALLOWED_EXTENSIONS.includes(ext as any)) {
    throw new SecurityValidationError(
      `File extension ${ext} is not allowed`,
      'INVALID_EXTENSION',
      { filePath, extension: ext, allowed: SECURITY_LIMITS.ALLOWED_EXTENSIONS }
    );
  }
}

/**
 * Validates AST depth during parsing
 */
export function validateASTDepth(node: any, currentDepth = 0): void {
  if (currentDepth > SECURITY_LIMITS.MAX_AST_DEPTH) {
    throw new SecurityValidationError(
      `AST depth ${currentDepth} exceeds limit of ${SECURITY_LIMITS.MAX_AST_DEPTH}`,
      'AST_TOO_DEEP',
      { depth: currentDepth, limit: SECURITY_LIMITS.MAX_AST_DEPTH }
    );
  }

  if (node.children) {
    for (const child of node.children) {
      validateASTDepth(child, currentDepth + 1);
    }
  }
}

/**
 * Parsing queue rate limiter
 */
class ParsingQueue {
  private activeCount = 0;

  async acquire(): Promise<void> {
    while (this.activeCount >= SECURITY_LIMITS.MAX_CONCURRENT_PARSING) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.activeCount++;
  }

  release(): void {
    this.activeCount--;
  }

  getActiveCount(): number {
    return this.activeCount;
  }
}

export const parsingQueue = new ParsingQueue();

/**
 * Validates vector dimensions and norm
 */
export function validateVector(vector: number[]): void {
  if (vector.length !== SECURITY_LIMITS.VECTOR_DIMENSION) {
    throw new SecurityValidationError(
      `Vector dimension ${vector.length} does not match expected ${SECURITY_LIMITS.VECTOR_DIMENSION}`,
      'INVALID_VECTOR_DIMENSION',
      { actual: vector.length, expected: SECURITY_LIMITS.VECTOR_DIMENSION }
    );
  }

  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > SECURITY_LIMITS.MAX_VECTOR_NORM || norm < SECURITY_LIMITS.MIN_VECTOR_NORM) {
    throw new SecurityValidationError(
      `Vector norm ${norm.toExponential(2)} is outside valid range [${SECURITY_LIMITS.MIN_VECTOR_NORM}, ${SECURITY_LIMITS.MAX_VECTOR_NORM}]`,
      'INVALID_VECTOR_NORM',
      { norm, min: SECURITY_LIMITS.MIN_VECTOR_NORM, max: SECURITY_LIMITS.MAX_VECTOR_NORM }
    );
  }
}

/**
 * Validates file before parsing (combines size and path checks)
 */
export function validateFileForParsing(filePath: string): void {
  validateFilePath(filePath);
  validateFileSize(filePath);
}
