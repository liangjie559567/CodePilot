export enum TaskType {
  CODE_EMBEDDING = 'code_embedding',
  CODE_COMPLETION = 'code_completion',
  CODE_SUMMARY = 'code_summary',
}

export enum ModelTier {
  FAST = 'fast',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface ModelConfig {
  id: string;
  name: string;
  path: string;
  taskTypes: TaskType[];
  tier: ModelTier;
  inputShape: number[];
  outputShape: number[];
  quantized: boolean;
  maxTokens: number;
  huggingfaceRepo?: string;
}

export interface InferenceRequest {
  taskType: TaskType;
  input: string | number[];
  options?: {
    maxLength?: number;
    temperature?: number;
    latencyBudget?: number;
  };
}

export interface RoutingStrategy {
  taskType: TaskType;
  codeLength: number;
  latencyBudget?: number;
}

export interface ModelDownloadStatus {
  modelId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface InferenceResult {
  output: number[] | string;
  latency: number;
  cached: boolean;
}

export interface CacheEntry {
  result: InferenceResult;
  timestamp: number;
}
