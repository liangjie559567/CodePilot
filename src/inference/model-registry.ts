import { ModelConfig, TaskType } from './types';

export class ModelRegistry {
  private models = new Map<string, ModelConfig>();

  register(config: ModelConfig): void {
    this.models.set(config.id, config);
  }

  get(modelId: string): ModelConfig | undefined {
    return this.models.get(modelId);
  }

  listModels(): ModelConfig[] {
    return Array.from(this.models.values());
  }
}
