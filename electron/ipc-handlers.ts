import { ipcMain } from 'electron';
import { codeIntelligenceAPI } from '../src/api/code-intelligence';

export function registerCodeIntelligenceHandlers() {
  ipcMain.handle('code:analyze', async (_, req) => {
    return codeIntelligenceAPI.analyzeCode(req);
  });

  ipcMain.handle('code:search', async (_, req) => {
    return codeIntelligenceAPI.searchCode(req);
  });

  ipcMain.handle('code:complete', async (_, code: string) => {
    return codeIntelligenceAPI.completeCode(code);
  });

  ipcMain.handle('code:summarize', async (_, code: string) => {
    return codeIntelligenceAPI.summarizeCode(code);
  });
}

export async function initializeCodeIntelligence() {
  await codeIntelligenceAPI.initialize();
}
