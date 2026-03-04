/**
 * Symbol Index - Extract and index symbols from AST
 */

import Parser from 'tree-sitter';

export interface Symbol {
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface';
  range: { start: number; end: number };
  filePath: string;
}

export class SymbolIndex {
  private symbols = new Map<string, Symbol[]>();

  extractSymbols(tree: Parser.Tree, filePath: string): Symbol[] {
    const symbols: Symbol[] = [];
    const cursor = tree.walk();

    const visit = () => {
      const node = cursor.currentNode;
      const type = node.type;

      if (type === 'function_declaration' || type === 'method_definition') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            name: nameNode.text,
            type: 'function',
            range: { start: node.startIndex, end: node.endIndex },
            filePath,
          });
        }
      }

      if (type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          symbols.push({
            name: nameNode.text,
            type: 'class',
            range: { start: node.startIndex, end: node.endIndex },
            filePath,
          });
        }
      }

      if (cursor.gotoFirstChild()) {
        do { visit(); } while (cursor.gotoNextSibling());
        cursor.gotoParent();
      }
    };

    visit();
    this.symbols.set(filePath, symbols);
    return symbols;
  }

  findSymbol(name: string): Symbol[] {
    const results: Symbol[] = [];
    for (const symbols of this.symbols.values()) {
      results.push(...symbols.filter(s => s.name === name));
    }
    return results;
  }
}
