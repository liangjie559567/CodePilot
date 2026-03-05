import { describe, it, expect } from 'vitest';
import { codeIntelligence } from '../../lib/code-intelligence';

describe('Code Intelligence', () => {
  it('should embed code', async () => {
    const vector = await codeIntelligence.embed('function test() {}', 'test.ts');
    expect(vector).toHaveLength(128);
  });

  it('should search similar code', async () => {
    await codeIntelligence.embed('function add(a, b) { return a + b; }', 'math.ts');
    await codeIntelligence.embed('function subtract(a, b) { return a - b; }', 'math.ts');

    const results = await codeIntelligence.search('function multiply');
    expect(results.length).toBeGreaterThan(0);
  });
});
