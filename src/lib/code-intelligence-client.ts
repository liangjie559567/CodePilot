export interface CodeAnalysisRequest {
  code: string;
  filePath: string;
  language?: string;
}

export interface CodeSearchRequest {
  query: string;
  limit?: number;
}

export const codeIntelligenceAPI = {
  analyzeCode: (req: CodeAnalysisRequest) =>
    window.electron.ipcRenderer.invoke('code:analyze', req),

  searchCode: (req: CodeSearchRequest) =>
    window.electron.ipcRenderer.invoke('code:search', req),

  completeCode: (code: string) =>
    window.electron.ipcRenderer.invoke('code:complete', code),

  summarizeCode: (code: string) =>
    window.electron.ipcRenderer.invoke('code:summarize', code),
};
