import * as ort from 'onnxruntime-node';
import { ModelConfig, TaskType } from './types';

export class InferenceEngine {
  async run(
    session: ort.InferenceSession,
    input: ort.Tensor,
    config: ModelConfig
  ): Promise<ort.Tensor> {
    const feeds: Record<string, ort.Tensor> = {};

    if (config.id.includes('codebert')) {
      feeds['input_ids'] = input;
      const mask = new ort.Tensor('int64', new BigInt64Array(input.size).fill(1n), input.dims);
      feeds['attention_mask'] = mask;
    } else {
      feeds['input'] = input;
    }

    const results = await session.run(feeds);
    return results[Object.keys(results)[0]];
  }

  preprocess(input: string | number[], config: ModelConfig): ort.Tensor {
    if (typeof input === 'string') {
      const tokens = this.tokenize(input, config.maxTokens);
      const padded = new Array(config.maxTokens).fill(0);
      tokens.forEach((t, i) => padded[i] = t);

      if (config.id.includes('codebert')) {
        return new ort.Tensor('int64', BigInt64Array.from(padded.map(t => BigInt(t))), [1, config.maxTokens]);
      }
      return new ort.Tensor('float32', new Float32Array(padded), [1, config.maxTokens]);
    }
    return new ort.Tensor('float32', new Float32Array(input), config.inputShape);
  }

  postprocess(output: ort.Tensor, config: ModelConfig): number[] | string {
    const data = Array.from(output.data as Float32Array);

    if (config.taskTypes.includes(TaskType.CODE_EMBEDDING)) {
      return data;
    }

    if (config.taskTypes.includes(TaskType.CODE_COMPLETION) ||
        config.taskTypes.includes(TaskType.CODE_SUMMARY)) {
      return this.detokenize(data);
    }

    return data;
  }

  private tokenize(text: string, maxTokens: number): number[] {
    return text.split('').map(c => c.charCodeAt(0)).slice(0, maxTokens);
  }

  private detokenize(tokens: number[]): string {
    return tokens.filter(t => t > 0 && t < 128).map(t => String.fromCharCode(t)).join('');
  }
}
