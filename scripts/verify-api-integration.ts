import { codeIntelligenceAPI } from '../src/api/code-intelligence';

async function main() {
  console.log('🚀 Initializing Code Intelligence API...');
  await codeIntelligenceAPI.initialize();

  const testCode = 'function fibonacci(n: number): number { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }';

  console.log('\n📊 Testing code analysis...');
  const analysis = await codeIntelligenceAPI.analyzeCode({
    code: testCode,
    filePath: 'test.ts',
  });
  console.log(`✅ Embedding dim: ${Array.isArray(analysis.embedding) ? analysis.embedding.length : 'N/A'}`);

  console.log('\n🔍 Testing semantic search...');
  const results = await codeIntelligenceAPI.searchCode({ query: 'recursive function', limit: 1 });
  console.log(`✅ Found ${results.length} results`);

  console.log('\n🎉 API integration complete!');
}

main().catch(console.error);
