/**
 * Parse Cache - LRU cache for parsed trees
 */

import Parser from 'tree-sitter';

export class ParseCache {
  private cache = new Map<string, { tree: Parser.Tree; timestamp: number }>();
  private maxSize = 100;

  set(filePath: string, tree: Parser.Tree): void {
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.cache.delete(oldest[0]);
    }
    this.cache.set(filePath, { tree, timestamp: Date.now() });
  }

  get(filePath: string): Parser.Tree | undefined {
    const entry = this.cache.get(filePath);
    if (entry) {
      entry.timestamp = Date.now();
      return entry.tree;
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const parseCache = new ParseCache();
