/**
 * Integration Test Suite for CodePilot vNext
 * Tests Tree-sitter + FAISS + Claude API integration
 */

import { describe, it, expect } from 'vitest';
import { parseFile } from '../parser/tree-sitter-engine';
import { SymbolIndex } from '../parser/symbol-index';
import { generateEmbedding } from '../vector/embedding-engine';
import { FAISSIndex } from '../vector/faiss-index';
import { ClaudeClient } from '../api/claude-client';
import * as fs from 'fs';
import * as path from 'path';

describe('Integration Tests', () => {
  const testFile = path.join(__dirname, 'fixtures', 'sample.ts');

  beforeAll(() => {
    fs.mkdirSync(path.dirname(testFile), { recursive: true });
    fs.writeFileSync(testFile, `
function hello(name: string): string {
  return \`Hello, \${name}!\`;
}

class Greeter {
  greet(name: string) {
    return hello(name);
  }
}
    `);
  });

  it('should parse file and extract symbols', async () => {
    const tree = await parseFile(testFile);
    expect(tree).toBeDefined();

    const symbolIndex = new SymbolIndex();
    const symbols = symbolIndex.extractSymbols(tree, testFile);
    expect(symbols.length).toBeGreaterThan(0);
    expect(symbols.some(s => s.name === 'hello')).toBe(true);
  });

  it('should generate embeddings and search', async () => {
    const text = 'function to greet users';
    const vector = await generateEmbedding(text);
    expect(vector.length).toBe(768);

    const index = new FAISSIndex();
    index.add(vector, testFile, text);
    const results = index.search(vector, 1);
    expect(results[0].text).toBe(text);
  });
});
