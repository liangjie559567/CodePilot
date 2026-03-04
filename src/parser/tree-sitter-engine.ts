/**
 * Tree-sitter Incremental Parsing Engine
 */

import Parser from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import JavaScript from 'tree-sitter-javascript';
import Python from 'tree-sitter-python';
import * as fs from 'fs';
import { validateFileForParsing, validateASTDepth, parsingQueue } from './security-validator';

const parsers = new Map<string, Parser>();

function getParser(language: string): Parser {
  if (!parsers.has(language)) {
    const parser = new Parser();
    switch (language) {
      case 'typescript':
        parser.setLanguage(TypeScript.typescript);
        break;
      case 'tsx':
        parser.setLanguage(TypeScript.tsx);
        break;
      case 'javascript':
        parser.setLanguage(JavaScript);
        break;
      case 'python':
        parser.setLanguage(Python);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
    parsers.set(language, parser);
  }
  return parsers.get(language)!;
}

const treeCache = new Map<string, Parser.Tree>();

export async function parseFile(filePath: string, oldTree?: Parser.Tree): Promise<Parser.Tree> {
  validateFileForParsing(filePath);
  await parsingQueue.acquire();

  try {
    const ext = filePath.split('.').pop()!;
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
    };
    const language = langMap[ext] || 'typescript';
    const parser = getParser(language);
    const code = fs.readFileSync(filePath, 'utf8');
    const tree = parser.parse(code, oldTree);
    validateASTDepth(tree.rootNode);
    treeCache.set(filePath, tree);
    return tree;
  } finally {
    parsingQueue.release();
  }
}

export function getCachedTree(filePath: string): Parser.Tree | undefined {
  return treeCache.get(filePath);
}

export interface ParseResult {
  tree: Parser.Tree;
  changedRanges: Parser.Range[];
  parseTime: number;
}

export async function incrementalParse(
  filePath: string,
  oldTree?: Parser.Tree
): Promise<ParseResult> {
  const startTime = Date.now();
  const tree = await parseFile(filePath, oldTree);
  const changedRanges = oldTree ? tree.getChangedRanges(oldTree) : [];

  return {
    tree,
    changedRanges,
    parseTime: Date.now() - startTime
  };
}
