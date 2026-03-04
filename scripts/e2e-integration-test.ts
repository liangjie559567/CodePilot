import { codeIntelligenceAPI } from '../src/api/code-intelligence';
import { taskScheduler } from '../src/scheduler/task-scheduler';
import { TaskPriority, TaskStatus } from '../src/scheduler/types';

async function e2eTest() {
  console.log('🚀 End-to-End Integration Test\n');

  // 1. Initialize services
  console.log('1️⃣ Initializing services...');
  await codeIntelligenceAPI.initialize();
  console.log('   ✅ Services ready\n');

  // 2. Test code analysis with scheduler
  console.log('2️⃣ Testing scheduled code analysis...');
  const codeSamples = [
    'function quickSort(arr) { /* sorting logic */ }',
    'class BinaryTree { insert(val) { /* tree logic */ } }',
    'const fibonacci = n => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);',
  ];

  let completed = 0;
  codeSamples.forEach((code, i) => {
    taskScheduler.addTask({
      id: `analyze-${i}`,
      name: `Analyze code ${i}`,
      priority: i === 0 ? TaskPriority.HIGH : TaskPriority.NORMAL,
      status: TaskStatus.PENDING,
      execute: async () => {
        await codeIntelligenceAPI.analyzeCode({ code, filePath: `test${i}.ts` });
        completed++;
      },
      createdAt: Date.now(),
    });
  });

  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`   ✅ Analyzed ${completed} files\n`);

  // 3. Test semantic search
  console.log('3️⃣ Testing semantic search...');
  const results = await codeIntelligenceAPI.searchCode({ query: 'sorting algorithm', limit: 2 });
  console.log(`   ✅ Found ${results.length} results\n`);

  // 4. System metrics
  console.log('4️⃣ System metrics:');
  const metrics = taskScheduler.getMetrics();
  console.log(`   CPU: ${metrics.cpuUsage.toFixed(2)}`);
  console.log(`   Memory: ${metrics.memoryUsage.toFixed(2)}%\n`);

  console.log('🎉 E2E test complete!');
}

e2eTest().catch(console.error);
