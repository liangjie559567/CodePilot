import { inferenceService } from '../src/inference/inference-service';
import { vectorService } from '../src/vector/vector-service';

async function main() {
  console.log('🔧 Initializing services...');
  await inferenceService.initialize();

  const codeSamples = [
    'function add(a: number, b: number) { return a + b; }',
    'const multiply = (x, y) => x * y;',
    'class Calculator { add(a, b) { return a + b; } }',
  ];

  console.log('\n📦 Adding documents to vector store...');
  const startAdd = Date.now();
  for (let i = 0; i < codeSamples.length; i++) {
    await vectorService.addDocument(codeSamples[i], `sample${i}.ts`);
  }
  console.log(`✅ Added ${codeSamples.length} documents in ${Date.now() - startAdd}ms`);

  console.log('\n🔍 Testing semantic search...');
  const query = 'addition function';
  const startSearch = Date.now();
  const results = await vectorService.search(query, 3);
  console.log(`✅ Search completed in ${Date.now() - startSearch}ms`);

  console.log('\n📊 Search Results:');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.filePath} (score: ${r.score.toFixed(4)})`);
    console.log(`   ${r.text.substring(0, 60)}...`);
  });

  console.log('\n🎉 Vector integration verified!');
}

main().catch(console.error);
