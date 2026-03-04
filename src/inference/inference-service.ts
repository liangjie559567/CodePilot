import { ModelRegistry } from './model-registry';
import { ModelLoader } from './model-loader';
import { InferenceEngine } from './inference-engine';
import { TaskRouter } from './task-router';
import { ResultCache } from './result-cache';
import { modelDownloader } from './model-downloader';
import { CODET5_MODELS } from './models/codet5-config';
import { ModelConfig, InferenceRequest, InferenceResult, TaskType, ModelTier } from './types';

export class InferenceService {
  private static instance: InferenceService;
  private registry = new ModelRegistry();
  private loader = new ModelLoader();
  private engine = new InferenceEngine();
  private router = new TaskRouter(this.registry);
  private cache = new ResultCache();

  private constructor() {}

  static getInstance(): InferenceService {
    if (!InferenceService.instance) {
      InferenceService.instance = new InferenceService();
    }
    return InferenceService.instance;
  }

  registerModel(config: ModelConfig): void {
    this.registry.register(config);
  }

  async initialize(): Promise<void> {
    const fastModel: ModelConfig = {
      id: 'fast-embedding',
      name: 'Fast Embedding',
      path: 'models/onnx/code-embedding.onnx',
      taskTypes: [TaskType.CODE_EMBEDDING, TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
      tier: ModelTier.FAST,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false,
      maxTokens: 512,
    };

    const standardModel: ModelConfig = {
      id: 'codebert-base',
      name: 'CodeBERT Base',
      path: 'models/codebert/model.onnx',
      taskTypes: [TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
      tier: ModelTier.STANDARD,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false,
      maxTokens: 512,
    };

    const premiumModel: ModelConfig = {
      id: 'codebert-large',
      name: 'CodeBERT Large',
      path: 'models/codebert/model.onnx',
      taskTypes: [TaskType.CODE_COMPLETION, TaskType.CODE_SUMMARY],
      tier: ModelTier.PREMIUM,
      inputShape: [1, 512],
      outputShape: [1, 768],
      quantized: false,
      maxTokens: 512,
    };

    this.registry.register(fastModel);
    this.registry.register(standardModel);
    this.registry.register(premiumModel);
  }

  async infer(request: InferenceRequest): Promise<InferenceResult> {
    const startTime = Date.now();

    const cacheKey = this.cache.generateKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const inputStr = typeof request.input === 'string' ? request.input : '';
    const modelId = this.router.selectModel({
      taskType: request.taskType,
      codeLength: inputStr.length,
      latencyBudget: request.options?.latencyBudget,
    });

    if (!modelId) {
      throw new Error(`No model available for task: ${request.taskType}`);
    }

    const config = this.registry.get(modelId);
    if (!config) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const session = await this.loader.load(config);
    const inputTensor = this.engine.preprocess(request.input, config);
    const outputTensor = await this.engine.run(session, inputTensor, config);
    const output = this.engine.postprocess(outputTensor, config);

    const result: InferenceResult = {
      output,
      latency: Date.now() - startTime,
      cached: false
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async warmup(modelId: string): Promise<void> {
    const config = this.registry.get(modelId);
    if (!config) throw new Error(`Model not found: ${modelId}`);
    await this.loader.load(config);
  }

  unloadModel(modelId: string): void {
    this.loader.unload(modelId);
  }

  dispose(): void {
    this.cache.clear();
  }
}

export const inferenceService = InferenceService.getInstance();
