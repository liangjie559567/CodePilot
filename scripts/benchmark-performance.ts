import { codeIntelligenceAPI } from '../src/api/code-intelligence';

async function benchmark() {
  console.log('🚀 Performance Benchmark\n');

  await codeIntelligenceAPI.initialize();

  const testCode = 'function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }';

  console.log('1️⃣ First analysis (cold start)...');
  const start1 = Date.now();
  await codeIntelligenceAPI.analyzeCode({ code: testCode, filePath: 'test1.ts' });
  console.log(`   ✅ ${Date.now() - start1}ms\n`);

  console.log('2️⃣ Second analysis (warm cache)...');
  const start2 = Date.now();
  await codeIntelligenceAPI.analyzeCode({ code: testCode, filePath: 'test2.ts' });
  console.log(`   ✅ ${Date.now() - start2}ms\n`);

  console.log('3️⃣ Search performance...');
  const start3 = Date.now();
  await codeIntelligenceAPI.searchCode({ query: 'array sum', limit: 5 });
  console.log(`   ✅ ${Date.now() - start3}ms\n`);

  console.log('🎉 Benchmark complete!');
}

benchmark().catch(console.error);
