/**
 * Unit tests for security validator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  validateFileSize,
  validateFilePath,
  validateASTDepth,
  validateVector,
  validateFileForParsing,
  parsingQueue,
  SecurityValidationError,
  SECURITY_LIMITS,
} from './security-validator';

describe('Security Validator', () => {
  const testDir = path.join(__dirname, '__test_files__');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('validateFileSize', () => {
    it('should pass for files under 10MB', () => {
      const filePath = path.join(testDir, 'small.ts');
      fs.writeFileSync(filePath, 'const x = 1;');
      expect(() => validateFileSize(filePath)).not.toThrow();
    });

    it('should throw for files over 10MB', () => {
      const filePath = path.join(testDir, 'large.ts');
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      fs.writeFileSync(filePath, largeContent);

      expect(() => validateFileSize(filePath)).toThrow(SecurityValidationError);
      expect(() => validateFileSize(filePath)).toThrow('FILE_TOO_LARGE');
    });
  });

  describe('validateFilePath', () => {
    it('should pass for allowed extensions', () => {
      expect(() => validateFilePath('/src/test.ts')).not.toThrow();
      expect(() => validateFilePath('/src/test.tsx')).not.toThrow();
      expect(() => validateFilePath('/src/test.js')).not.toThrow();
    });

    it('should throw for blocked paths', () => {
      expect(() => validateFilePath('/node_modules/pkg/index.js')).toThrow('BLOCKED_PATH');
      expect(() => validateFilePath('/src/.git/config')).toThrow('BLOCKED_PATH');
      expect(() => validateFilePath('/dist/bundle.js')).toThrow('BLOCKED_PATH');
    });

    it('should throw for disallowed extensions', () => {
      expect(() => validateFilePath('/src/test.exe')).toThrow('INVALID_EXTENSION');
      expect(() => validateFilePath('/src/test.dll')).toThrow('INVALID_EXTENSION');
    });
  });

  describe('validateASTDepth', () => {
    it('should pass for shallow AST', () => {
      const ast = { type: 'root', children: [{ type: 'child' }] };
      expect(() => validateASTDepth(ast)).not.toThrow();
    });

    it('should throw for AST exceeding 500 layers', () => {
      let deepAST: any = { type: 'root' };
      let current = deepAST;
      for (let i = 0; i < 501; i++) {
        current.children = [{ type: `node${i}` }];
        current = current.children[0];
      }
      expect(() => validateASTDepth(deepAST)).toThrow('AST_TOO_DEEP');
    });
  });

  describe('validateVector', () => {
    it('should pass for valid 768-dim vector', () => {
      const vector = new Array(768).fill(0.1);
      expect(() => validateVector(vector)).not.toThrow();
    });

    it('should throw for wrong dimension', () => {
      const vector = new Array(512).fill(0.1);
      expect(() => validateVector(vector)).toThrow('INVALID_VECTOR_DIMENSION');
    });

    it('should throw for invalid norm', () => {
      const vector = new Array(768).fill(1e7);
      expect(() => validateVector(vector)).toThrow('INVALID_VECTOR_NORM');
    });
  });

  describe('parsingQueue', () => {
    it('should limit concurrent parsing to 5', async () => {
      const tasks = [];
      for (let i = 0; i < 10; i++) {
        tasks.push(parsingQueue.acquire());
      }
      await Promise.all(tasks.slice(0, 5));
      expect(parsingQueue.getActiveCount()).toBe(5);
    });
  });
});
