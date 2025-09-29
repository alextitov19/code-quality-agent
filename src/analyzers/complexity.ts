import { CodeFile, QualityIssue } from '../types';

export class ComplexityAnalyzer {
    analyze(files: CodeFile[]): QualityIssue[] {
        const issues: QualityIssue[] = [];

        for (const file of files) {
            issues.push(...this.checkCyclomaticComplexity(file));
            issues.push(...this.checkFunctionLength(file));
            issues.push(...this.checkCodeDuplication(file));
        }

        return issues;
    }

    private checkCyclomaticComplexity(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const lines = file.content.split('\n');

        let currentFunction = '';
        let complexity = 1;
        let functionStartLine = 0;
        const complexityKeywords = ['if', 'else if', 'for', 'while', 'case', '&&', '||', '?', 'catch'];

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (this.isFunctionDeclaration(trimmed)) {
                if (currentFunction && complexity > 10) {
                    issues.push({
                        category: 'complexity',
                        severity: complexity > 20 ? 'high' : 'medium',
                        title: 'High Cyclomatic Complexity',
                        description: `Function has cyclomatic complexity of ${complexity}`,
                        location: {
                            file: file.path,
                            line: functionStartLine,
                            snippet: currentFunction,
                        },
                        impact: 'High complexity makes code harder to understand, test, and maintain',
                        recommendation: 'Break down into smaller functions, reduce conditional logic, or use strategy pattern',
                    });
                }

                currentFunction = trimmed;
                complexity = 1;
                functionStartLine = index + 1;
            }

            complexityKeywords.forEach(keyword => {
                // Escape special regex characters
                const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const occurrences = (trimmed.match(new RegExp(escapedKeyword, 'g')) || []).length;
                complexity += occurrences;
            });
        });

        return issues;
    }

    private checkFunctionLength(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const lines = file.content.split('\n');

        let currentFunction = '';
        let functionStartLine = 0;
        let functionLength = 0;
        let braceCount = 0;

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            if (this.isFunctionDeclaration(trimmed)) {
                if (currentFunction && functionLength > 50) {
                    issues.push({
                        category: 'complexity',
                        severity: functionLength > 100 ? 'high' : 'medium',
                        title: 'Long Function',
                        description: `Function is ${functionLength} lines long`,
                        location: {
                            file: file.path,
                            line: functionStartLine,
                            snippet: currentFunction,
                        },
                        impact: 'Long functions are harder to understand, test, and maintain',
                        recommendation: 'Extract logical blocks into smaller, focused functions with clear responsibilities',
                    });
                }

                currentFunction = trimmed;
                functionStartLine = index + 1;
                functionLength = 0;
                braceCount = 0;
            }

            if (currentFunction) {
                functionLength++;
                braceCount += (trimmed.match(/{/g) || []).length;
                braceCount -= (trimmed.match(/}/g) || []).length;

                if (braceCount === 0 && functionLength > 1) {
                    currentFunction = '';
                }
            }
        });

        return issues;
    }

    private checkCodeDuplication(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const lines = file.content.split('\n');
        const blockSize = 5;
        const blocks = new Map<string, number[]>();

        for (let i = 0; i <= lines.length - blockSize; i++) {
            const block = lines.slice(i, i + blockSize)
                .map(l => l.trim())
                .filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('/*'))
                .join('\n');

            if (block.length > 50) {
                if (!blocks.has(block)) {
                    blocks.set(block, []);
                }
                blocks.get(block)!.push(i + 1);
            }
        }

        blocks.forEach((lineNumbers, block) => {
            if (lineNumbers.length > 1) {
                issues.push({
                    category: 'complexity',
                    severity: 'medium',
                    title: 'Code Duplication Detected',
                    description: `Similar code block found in ${lineNumbers.length} locations`,
                    location: {
                        file: file.path,
                        line: lineNumbers[0],
                        snippet: block.substring(0, 100) + '...',
                    },
                    impact: 'Duplicated code increases maintenance burden and risk of inconsistent updates',
                    recommendation: 'Extract common code into a reusable function or module',
                });
            }
        });

        return issues;
    }

    private isFunctionDeclaration(line: string): boolean {
        const patterns = [
            /function\s+\w+\s*\(/,
            /\w+\s*=\s*function\s*\(/,
            /\w+\s*=\s*\(.*\)\s*=>/,
            /async\s+function\s+\w+/,
            /def\s+\w+\s*\(/,
            /func\s+\w+\s*\(/,
            /(public|private|protected)?\s*(static)?\s*\w+\s+\w+\s*\(/,
        ];

        return patterns.some(pattern => pattern.test(line));
    }
}