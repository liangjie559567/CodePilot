import { ModelRegistry } from './model-registry';
import { TaskType, ModelTier, RoutingStrategy } from './types';

export class TaskRouter {
  constructor(private registry: ModelRegistry) {}

  selectModel(strategy: RoutingStrategy): string | null {
    const { taskType, codeLength, latencyBudget } = strategy;

    if (latencyBudget && latencyBudget < 100) {
      return this.findModelByTier(taskType, ModelTier.FAST);
    }

    if (taskType === TaskType.CODE_COMPLETION) {
      return codeLength < 100
        ? this.findModelByTier(taskType, ModelTier.FAST)
        : this.findModelByTier(taskType, ModelTier.STANDARD);
    }

    if (taskType === TaskType.CODE_SUMMARY) {
      return codeLength > 500
        ? this.findModelByTier(taskType, ModelTier.PREMIUM)
        : this.findModelByTier(taskType, ModelTier.STANDARD);
    }

    return this.findModelByTier(taskType, ModelTier.STANDARD);
  }

  private findModelByTier(taskType: TaskType, tier: ModelTier): string | null {
    const models = this.registry.listModels();
    let model = models.find(m => m.taskTypes.includes(taskType) && m.tier === tier);

    if (!model && tier === ModelTier.PREMIUM) {
      model = models.find(m => m.taskTypes.includes(taskType) && m.tier === ModelTier.STANDARD);
    }

    if (!model && (tier === ModelTier.PREMIUM || tier === ModelTier.STANDARD)) {
      model = models.find(m => m.taskTypes.includes(taskType) && m.tier === ModelTier.FAST);
    }

    return model?.id || null;
  }
}
