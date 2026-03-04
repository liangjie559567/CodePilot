import { codeIntelligenceAPI } from '../src/lib/code-intelligence-client';

// Mock Electron IPC
(global as any).window = {
  electron: {
    ipcRenderer: {
      invoke: async (channel: string, ...args: any[]) => {
        console.log(`[Mock IPC] ${channel}`, args);

        // Simulate responses
        if (channel === 'code:analyze') {
          return { embedding: new Array(768).fill(0.1) };
        }
        if (channel === 'code:search') {
          return [{ filePath: 'test.ts', text: 'sample code', score: 0.95 }];
        }
        return { output: 'mock result' };
      },
    },
  },
};

async function main() {
  console.log('🧪 Testing Code Intelligence Client...\n');

  console.log('1️⃣ Testing code analysis...');
  const analysis = await codeIntelligenceAPI.analyzeCode({
    code: 'const x = 1;',
    filePath: 'test.ts',
  });
  console.log(`✅ Embedding: ${Array.isArray(analysis.embedding) ? analysis.embedding.length : 'N/A'}`);

  console.log('\n2️⃣ Testing code search...');
  const results = await codeIntelligenceAPI.searchCode({ query: 'test', limit: 5 });
  console.log(`✅ Found ${results.length} results`);

  console.log('\n🎉 Client integration test passed!');
}

main().catch(console.error);
