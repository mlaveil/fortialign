export interface ASTNode {
  type: 'config' | 'edit' | 'set' | 'unset' | 'comment' | 'raw';
  name?: string;
  args?: string[];
  key?: string;
  values?: string[];
  lineNumber: number;
  rawLine: string;
  indent: number;
  children?: ASTNode[];
  parent?: ASTNode;
}

export interface ParseResult {
  rootNodes: ASTNode[];
  comments: { line: number; text: string }[];
  totalLines: number;
  sections: Map<string, ASTNode[]>;
}

export class FortiOSParser {
  public parse(content: string): ParseResult {
    const lines = content.split(/\r?\n/);
    const rootNodes: ASTNode[] = [];
    const comments: { line: number; text: string }[] = [];
    const sections = new Map<string, ASTNode[]>();

    const stack: ASTNode[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        return;
      }

      // Comment
      if (trimmed.startsWith('#')) {
        comments.push({ line: lineNum, text: trimmed });
        const commentNode: ASTNode = {
          type: 'comment',
          lineNumber: lineNum,
          rawLine: line,
          indent: this.getIndent(line),
        };
        if (stack.length > 0) {
          stack[stack.length - 1].children = stack[stack.length - 1].children || [];
          stack[stack.length - 1].children!.push(commentNode);
        } else {
          rootNodes.push(commentNode);
        }
        return;
      }

      const indent = this.getIndent(line);
      const tokens = this.tokenize(trimmed);
      if (tokens.length === 0) return;

      const cmd = tokens[0].toLowerCase();

      if (cmd === 'config') {
        const sectionName = tokens.slice(1).join(' ');
        const configNode: ASTNode = {
          type: 'config',
          name: sectionName,
          args: tokens.slice(1),
          lineNumber: lineNum,
          rawLine: line,
          indent,
          children: [],
        };

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          configNode.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(configNode);
        } else {
          rootNodes.push(configNode);
          const list = sections.get(sectionName) || [];
          list.push(configNode);
          sections.set(sectionName, list);
        }

        stack.push(configNode);
      } else if (cmd === 'edit') {
        const editId = tokens.slice(1).join(' ').replace(/^"(.*)"$/, '$1');
        const editNode: ASTNode = {
          type: 'edit',
          name: editId,
          args: tokens.slice(1),
          lineNumber: lineNum,
          rawLine: line,
          indent,
          children: [],
        };

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          editNode.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(editNode);
        } else {
          rootNodes.push(editNode);
        }

        stack.push(editNode);
      } else if (cmd === 'set') {
        const key = tokens[1];
        const values = tokens.slice(2);
        const setNode: ASTNode = {
          type: 'set',
          key,
          values,
          lineNumber: lineNum,
          rawLine: line,
          indent,
        };

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          setNode.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(setNode);
        } else {
          rootNodes.push(setNode);
        }
      } else if (cmd === 'unset') {
        const key = tokens[1];
        const unsetNode: ASTNode = {
          type: 'unset',
          key,
          lineNumber: lineNum,
          rawLine: line,
          indent,
        };

        if (stack.length > 0) {
          const parent = stack[stack.length - 1];
          unsetNode.parent = parent;
          parent.children = parent.children || [];
          parent.children.push(unsetNode);
        } else {
          rootNodes.push(unsetNode);
        }
      } else if (cmd === 'next') {
        if (stack.length > 0 && stack[stack.length - 1].type === 'edit') {
          stack.pop();
        }
      } else if (cmd === 'end') {
        if (stack.length > 0 && stack[stack.length - 1].type === 'config') {
          stack.pop();
        }
      } else {
        // Raw CLI line
        const rawNode: ASTNode = {
          type: 'raw',
          lineNumber: lineNum,
          rawLine: line,
          indent,
        };
        if (stack.length > 0) {
          stack[stack.length - 1].children = stack[stack.length - 1].children || [];
          stack[stack.length - 1].children!.push(rawNode);
        } else {
          rootNodes.push(rawNode);
        }
      }
    });

    return {
      rootNodes,
      comments,
      totalLines: lines.length,
      sections,
    };
  }

  private getIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  public tokenize(line: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if ((char === '"' || char === "'") && (!inQuotes || quoteChar === char)) {
        if (inQuotes) {
          inQuotes = false;
          quoteChar = '';
        } else {
          inQuotes = true;
          quoteChar = char;
        }
        current += char;
      } else if (/\s/.test(char) && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }
}
