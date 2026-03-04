import * as ort from 'onnxruntime-node';
import { ModelConfig } from './types';
import * as path from 'path';

export class ModelLoader {
  private sessions = new Map<string, ort.InferenceSession>();

  async load(config: ModelConfig): Promise<ort.InferenceSession> {
    const existing = this.sessions.get(config.id);
    if (existing) return existing;

    const modelPath = path.resolve(config.path);
    const session = await ort.InferenceSession.create(modelPath);
    this.sessions.set(config.id, session);

    return session;
  }

  get(modelId: string): ort.InferenceSession | undefined {
    return this.sessions.get(modelId);
  }

  unload(modelId: string): void {
    this.sessions.delete(modelId);
  }
}
