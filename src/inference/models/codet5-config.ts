import { ModelConfig, TaskType, ModelTier } from '../types';

export const CODET5_MODELS: ModelConfig[] = [
  {
    id: 'codet5-base',
    name: 'CodeT5 Base',
    path: '',
    taskTypes: [TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
    tier: ModelTier.STANDARD,
    inputShape: [1, 512],
    outputShape: [1, 512],
    quantized: false,
    maxTokens: 512,
    huggingfaceRepo: 'Salesforce/codet5-base',
  },
  {
    id: 'codet5-large',
    name: 'CodeT5 Large',
    path: '',
    taskTypes: [TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
    tier: ModelTier.PREMIUM,
    inputShape: [1, 512],
    outputShape: [1, 512],
    quantized: false,
    maxTokens: 512,
    huggingfaceRepo: 'Salesforce/codet5-large',
  },
];
