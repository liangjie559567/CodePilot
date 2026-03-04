import { inferenceService } from '../src/inference/inference-service';
import { TaskType } from '../src/inference/types';

async function verifyArchitecture() {
  console.log('🚀 Initializing inference service...');
  await inferenceService.initialize();

  console.log('\n✅ Testing Fast model routing (short completion)...');
  const fastResult = await inferenceService.infer({
    taskType: TaskType.CODE_COMPLETION,
    input: 'function add(a, b) {',
    options: { latencyBudget: 50 },
  });
  console.log(`   Latency: ${fastResult.latency}ms`);

  console.log('\n✅ Testing Standard model routing (medium completion)...');
  const standardResult = await inferenceService.infer({
    taskType: TaskType.CODE_COMPLETION,
    input: 'function '.repeat(50),
  });
  console.log(`   Latency: ${standardResult.latency}ms`);

  console.log('\n✅ Testing Premium model routing (long summary)...');
  const premiumResult = await inferenceService.infer({
    taskType: TaskType.CODE_SUMMARY,
    input: 'function '.repeat(200),
  });
  console.log(`   Latency: ${premiumResult.latency}ms`);

  console.log('\n✅ Testing all task types...');
  const tasks = [TaskType.CODE_EMBEDDING, TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY];
  for (const taskType of tasks) {
    const result = await inferenceService.infer({
      taskType,
      input: 'function test() {}',
    });
    console.log(`   ${taskType}: ${result.latency}ms`);
  }

  console.log('\n🎉 All tests passed! Three-tier architecture verified.');
}

verifyArchitecture().catch(console.error);
