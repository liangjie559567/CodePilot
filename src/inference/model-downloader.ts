import * as fs from 'fs/promises';
import * as path from 'path';
import { ModelConfig, ModelDownloadStatus } from './types';

export class ModelDownloader {
  private downloadDir = path.join(process.cwd(), 'models');
  private statusMap = new Map<string, ModelDownloadStatus>();

  async downloadModel(config: ModelConfig): Promise<string> {
    if (!config.huggingfaceRepo) {
      throw new Error(`Model ${config.id} has no HuggingFace repo`);
    }

    const localPath = path.join(this.downloadDir, config.id, 'model.onnx');

    if (await this.fileExists(localPath)) {
      return localPath;
    }

    await fs.mkdir(path.dirname(localPath), { recursive: true });
    this.updateStatus(config.id, 'downloading', 0);

    try {
      // Download from HuggingFace using fetch
      const url = `https://huggingface.co/${config.huggingfaceRepo}/resolve/main/model.onnx`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));

      this.updateStatus(config.id, 'completed', 100);
      return localPath;
    } catch (error) {
      this.updateStatus(config.id, 'failed', 0, String(error));
      throw error;
    }
  }

  getStatus(modelId: string): ModelDownloadStatus | undefined {
    return this.statusMap.get(modelId);
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private updateStatus(
    modelId: string,
    status: ModelDownloadStatus['status'],
    progress: number,
    error?: string
  ) {
    this.statusMap.set(modelId, { modelId, status, progress, error });
  }
}

export const modelDownloader = new ModelDownloader();
