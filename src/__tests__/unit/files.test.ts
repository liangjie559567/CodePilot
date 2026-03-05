import { describe, it, expect } from 'vitest';
import { getFileLanguage, isPathSafe } from '../../lib/files';

describe('files', () => {
  it('should detect file language', () => {
    expect(getFileLanguage('.ts')).toBe('typescript');
    expect(getFileLanguage('.js')).toBe('javascript');
    expect(getFileLanguage('.py')).toBe('python');
  });

  it('should validate path safety', () => {
    expect(isPathSafe('/base', '/base/file.txt')).toBe(true);
    expect(isPathSafe('/base', '/other/file.txt')).toBe(false);
  });
});
