import { incrementalParse, ParseResult } from './tree-sitter-engine';
import { EnhancedLRUCache } from './enhanced-cache';
import Parser from 'tree-sitter';

export class IncrementalParser {
  private cache = new EnhancedLRUCache<Parser.Tree>(100);

  async parse(filePath: string): Promise<ParseResult> {
    const oldTree = this.cache.get(filePath)?.data;
    const result = await incrementalParse(filePath, oldTree);
    this.cache.set(filePath, { data: result.tree, timestamp: Date.now() });
    return result;
  }

  async parseBatch(files: string[]): Promise<Map<string, ParseResult>> {
    const results = new Map<string, ParseResult>();
    await Promise.all(
      files.map(async (file) => {
        const result = await this.parse(file);
        results.set(file, result);
      })
    );
    return results;
  }
}
