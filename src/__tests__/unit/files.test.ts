import { describe, it, expect } from 'vitest';
import { getFileTree, getFilePreview, isTextFile } from '@/lib/files';
import * as fs from 'fs';
import * as path from 'path';

describe('files', () => {
  describe('isTextFile', () => {
    it('should identify text files', () => {
      expect(isTextFile('test.txt')).toBe(true);
      expect(isTextFile('test.js')).toBe(true);
      expect(isTextFile('test.ts')).toBe(true);
      expect(isTextFile('test.json')).toBe(true);
      expect(isTextFile('test.md')).toBe(true);
    });

    it('should identify binary files', () => {
      expect(isTextFile('test.png')).toBe(false);
      expect(isTextFile('test.jpg')).toBe(false);
      expect(isTextFile('test.pdf')).toBe(false);
      expect(isTextFile('test.zip')).toBe(false);
    });
  });

  describe('getFileTree', () => {
    it('should return directory structure', async () => {
      const tree = await getFileTree(__dirname);

      expect(tree).toBeDefined();
      expect(tree.type).toBe('directory');
      expect(tree.children).toBeDefined();
      expect(Array.isArray(tree.children)).toBe(true);
    });

    it('should filter hidden files', async () => {
      const tree = await getFileTree(__dirname);

      const hasHidden = tree.children?.some(
        child => child.name.startsWith('.')
      );
      expect(hasHidden).toBe(false);
    });
  });

  describe('getFilePreview', () => {
    it('should read text file content', async () => {
      const testFile = path.join(__dirname, 'permission-registry.test.ts');
      const preview = await getFilePreview(testFile);

      expect(preview.content).toBeDefined();
      expect(preview.language).toBe('typescript');
      expect(preview.size).toBeGreaterThan(0);
    });

    it('should handle non-existent files', async () => {
      await expect(
        getFilePreview('/non/existent/file.txt')
      ).rejects.toThrow();
    });
  });
});
