import { ModelConfig, InferenceRequest, InferenceResult, TaskType, ModelTier } from './types';

export class InferenceService {
  private static instance: InferenceService;
  private initialized = false;
  private registry: any;
  private loader: any;
  private engine: any;
  private router: any;
  private cache: any;

  private constructor() {}

  static getInstance(): InferenceService {
    if (!InferenceService.instance) {
      InferenceService.instance = new InferenceService();
    }
    return InferenceService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const { ModelRegistry } = await import('./model-registry');
      const { ModelLoader } = await import('./model-loader');
      const { InferenceEngine } = await import('./inference-engine');
      const { TaskRouter } = await import('./task-router');
      const { ResultCache } = await import('./result-cache');

      this.registry = new ModelRegistry();
      this.loader = new ModelLoader();
      this.engine = new InferenceEngine();
      this.router = new TaskRouter(this.registry);
      this.cache = new ResultCache();

      const fastModel: ModelConfig = {
        id: 'fast-embedding',
        name: 'Fast Embedding',
        path: 'models/onnx/code-embedding.onnx',
        taskTypes: [TaskType.CODE_EMBEDDING],
        tier: ModelTier.FAST,
        inputShape: [1, 512],
        outputShape: [1, 768],
        quantized: false,
        maxTokens: 512,
      };

      this.registry.register(fastModel);
      this.initialized = true;
    } catch (error) {
      console.warn('Code intelligence features unavailable:', error);
    }
  }

  async infer(request: InferenceRequest): Promise<InferenceResult> {
    if (!this.initialized) {
      throw new Error('Inference service not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    const cacheKey = this.cache.generateKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) return { ...cached, cached: true };

    const inputStr = typeof request.input === 'string' ? request.input : '';
    const modelId = this.router.selectModel({
      taskType: request.taskType,
      codeLength: inputStr.length,
      latencyBudget: request.options?.latencyBudget,
    });

    if (!modelId) throw new Error(`No model available for task: ${request.taskType}`);

    const config = this.registry.get(modelId);
    if (!config) throw new Error(`Model not found: ${modelId}`);

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

  dispose(): void {
    if (this.cache) this.cache.clear();
  }
}

export const inferenceService = InferenceService.getInstance();
