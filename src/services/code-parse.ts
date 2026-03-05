interface ParseRequest {
  filePath: string;
  content: string;
  language: string;
  previousTreeId?: string;
}

interface ParseResponse {
  treeId: string;
  ast: any;
  symbols: Array<{ name: string; kind: string; range: [number, number] }>;
  changedRanges: Array<[number, number]>;
  parseTime: number;
}

class CodeParseService {
  private cache = new Map<string, ParseResponse>();

  async parseIncremental(req: ParseRequest): Promise<ParseResponse> {
    const start = Date.now();
    const treeId = `tree_${Date.now()}`;

    const symbols = this.extractSymbols(req.content, req.language);
    const ast = { type: 'Program', body: symbols };

    const result: ParseResponse = {
      treeId,
      ast,
      symbols,
      changedRanges: req.previousTreeId ? [[0, req.content.length]] : [],
      parseTime: Date.now() - start,
    };

    this.cache.set(req.filePath, result);
    return result;
  }

  private extractSymbols(content: string, language: string) {
    const symbols: Array<{ name: string; kind: string; range: [number, number] }> = [];

    const funcRegex = /(?:function|const|let|var)\s+(\w+)\s*[=\(]/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      symbols.push({
        name: match[1],
        kind: 'function',
        range: [match.index, match.index + match[0].length],
      });
    }

    const classRegex = /class\s+(\w+)/g;
    while ((match = classRegex.exec(content)) !== null) {
      symbols.push({
        name: match[1],
        kind: 'class',
        range: [match.index, match.index + match[0].length],
      });
    }

    return symbols;
  }

  async parseBatch(files: ParseRequest[]): Promise<ParseResponse[]> {
    return Promise.all(files.map(f => this.parseIncremental(f)));
  }
}

export const codeParseService = new CodeParseService();
