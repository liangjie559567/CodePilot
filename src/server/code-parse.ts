// Code Parse Service - 增量代码解析
import path from 'path';
import fs from 'fs';

interface ParseResult {
  file: string;
  symbols: Array<{ name: string; type: string; line: number }>;
  ast: any;
}

export class CodeParseService {
  parseIncremental(file: string, content: string): ParseResult {
    // 简化的符号提取
    const symbols: Array<{ name: string; type: string; line: number }> = [];
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.includes('function ')) {
        const match = line.match(/function\s+(\w+)/);
        if (match) symbols.push({ name: match[1], type: 'function', line: idx + 1 });
      }
      if (line.includes('class ')) {
        const match = line.match(/class\s+(\w+)/);
        if (match) symbols.push({ name: match[1], type: 'class', line: idx + 1 });
      }
    });

    return { file, symbols, ast: { type: 'Program' } };
  }
}

export const codeParseService = new CodeParseService();
