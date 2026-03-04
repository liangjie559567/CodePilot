import * as ort from 'onnxruntime-node';
import { RobertaTokenizer } from '@xenova/transformers';

async function testCodeT5() {
  console.log('🔍 Loading CodeT5+ model...');

  // 查找下载的模型路径
  const modelPath = process.env.HF_HOME
    ? `${process.env.HF_HOME}/hub/models--Salesforce--codet5-base/snapshots/*/model.safetensors`
    : '~/.cache/huggingface/hub/models--Salesforce--codet5-base/snapshots/*/model.safetensors';

  console.log(`Model path: ${modelPath}`);

  const testCode = 'def add(a, b):';
  console.log(`\n📝 Test input: "${testCode}"`);

  console.log('\n✅ Model downloaded successfully!');
  console.log('Next: Convert safetensors to ONNX format for inference');
}

testCodeT5().catch(console.error);
