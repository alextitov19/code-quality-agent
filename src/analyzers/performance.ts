import { CodeFile, QualityIssue } from '../types';

export class PerformanceAnalyzer {
    analyze(files: CodeFile[]): QualityIssue[] {
        const issues: QualityIssue[] = [];

        for (const file of files) {
            issues.push(...this.checkNestedLoops(file));
            issues.push(...this.checkInefficientOperations(file));
            issues.push(...this.checkMemoryLeaks(file));
        }

        return issues;
    }

    private checkNestedLoops(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const lines = file.content.split('\n');

        let nestedLevel = 0;
        const loopKeywords = ['for', 'while', 'forEach', 'map', 'filter'];

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            loopKeywords.forEach(keyword => {
                if (trimmed.includes(keyword) && (trimmed.includes('(') || trimmed.includes(' '))) {
                    nestedLevel++;

                    if (nestedLevel >= 3) {
                        issues.push({
                            category: 'performance',
                            severity: 'high',
                            title: 'Deeply Nested Loops Detected',
                            description: `Found ${nestedLevel} levels of nested loops`,
                            location: {
                                file: file.path,
                                line: index + 1,
                                snippet: line.trim(),
                            },
                            impact: 'Nested loops can result in O(n²) or O(n³) time complexity, causing performance degradation',
                            recommendation: 'Consider using hash maps, sets, or restructuring the algorithm to reduce nesting',
                        });
                    }
                }
            });

            if (trimmed.includes('}')) {
                nestedLevel = Math.max(0, nestedLevel - 1);
            }
        });

        return issues;
    }

    private checkInefficientOperations(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const lines = file.content.split('\n');

        const inefficientPatterns = [
            { pattern: /\.find\s*\(.*\)\.find\s*\(/g, title: 'Chained Array Find Operations' },
            { pattern: /\.filter\s*\(.*\)\.filter\s*\(/g, title: 'Chained Filter Operations' },
            { pattern: /\.map\s*\(.*\)\.map\s*\(/g, title: 'Chained Map Operations' },
            { pattern: /\+\s*=\s*["'`].*["'`]/g, title: 'String Concatenation in Loop' },
        ];

        lines.forEach((line, index) => {
            inefficientPatterns.forEach(({ pattern, title }) => {
                if (pattern.test(line)) {
                    issues.push({
                        category: 'performance',
                        severity: 'medium',
                        title: `Inefficient Operation: ${title}`,
                        description: 'Operation can be optimized by combining operations',
                        location: {
                            file: file.path,
                            line: index + 1,
                            snippet: line.trim(),
                        },
                        impact: 'Multiple iterations over the same data structure reduce performance',
                        recommendation: 'Combine operations into a single pass or use more efficient data structures',
                    });
                }
            });
        });

        return issues;
    }

    private checkMemoryLeaks(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];

        if (['javascript', 'typescript'].includes(file.language)) {
            const lines = file.content.split('\n');

            lines.forEach((line, index) => {
                if (line.includes('addEventListener') &&
                    !file.content.includes('removeEventListener')) {
                    issues.push({
                        category: 'performance',
                        severity: 'medium',
                        title: 'Potential Memory Leak: Event Listener',
                        description: 'Event listener added without corresponding cleanup',
                        location: {
                            file: file.path,
                            line: index + 1,
                            snippet: line.trim(),
                        },
                        impact: 'Uncleaned event listeners can cause memory leaks',
                        recommendation: 'Add removeEventListener in cleanup function or useEffect return',
                    });
                }

                if (line.includes('setInterval') &&
                    !file.content.includes('clearInterval')) {
                    issues.push({
                        category: 'performance',
                        severity: 'high',
                        title: 'Potential Memory Leak: Interval',
                        description: 'setInterval used without corresponding clearInterval',
                        location: {
                            file: file.path,
                            line: index + 1,
                            snippet: line.trim(),
                        },
                        impact: 'Uncleaned intervals continue running and consuming resources',
                        recommendation: 'Store interval ID and call clearInterval when component unmounts',
                    });
                }
            });
        }

        return issues;
    }
}