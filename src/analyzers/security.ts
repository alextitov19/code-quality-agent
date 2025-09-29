import { CodeFile, QualityIssue } from '../types';

export class SecurityAnalyzer {
    analyze(files: CodeFile[]): QualityIssue[] {
        const issues: QualityIssue[] = [];

        for (const file of files) {
            issues.push(...this.checkHardcodedSecrets(file));
            issues.push(...this.checkSQLInjection(file));
            issues.push(...this.checkXSS(file));
            issues.push(...this.checkInsecureDependencies(file));
        }

        return issues;
    }

    private checkHardcodedSecrets(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];
        const patterns = [
            /password\s*=\s*["'](?!.*\$\{)(.{3,})["']/gi,
            /api[_-]?key\s*=\s*["'](?!.*\$\{)(.{8,})["']/gi,
            /secret\s*=\s*["'](?!.*\$\{)(.{8,})["']/gi,
            /token\s*=\s*["'](?!.*\$\{)(.{8,})["']/gi,
            /aws_access_key_id\s*=\s*["'](.{16,})["']/gi,
        ];

        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            patterns.forEach(pattern => {
                if (pattern.test(line)) {
                    issues.push({
                        category: 'security',
                        severity: 'critical',
                        title: 'Hardcoded Secret Detected',
                        description: 'Potential hardcoded secret or credential found in source code',
                        location: {
                            file: file.path,
                            line: index + 1,
                            snippet: line.trim(),
                        },
                        impact: 'Exposed credentials can lead to unauthorized access and data breaches',
                        recommendation: 'Use environment variables or secure secret management services (e.g., AWS Secrets Manager, HashiCorp Vault)',
                    });
                }
            });
        });

        return issues;
    }

    private checkSQLInjection(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];

        if (['javascript', 'typescript', 'python', 'php'].includes(file.language)) {
            const patterns = [
                /execute\s*\(\s*["'`].*\+.*["'`]/gi,
                /query\s*\(\s*["'`].*\+.*["'`]/gi,
                /SELECT.*FROM.*WHERE.*\+/gi,
                /f["']SELECT.*FROM.*{/gi,
            ];

            const lines = file.content.split('\n');

            lines.forEach((line, index) => {
                patterns.forEach(pattern => {
                    if (pattern.test(line)) {
                        issues.push({
                            category: 'security',
                            severity: 'critical',
                            title: 'Potential SQL Injection Vulnerability',
                            description: 'SQL query appears to use string concatenation with user input',
                            location: {
                                file: file.path,
                                line: index + 1,
                                snippet: line.trim(),
                            },
                            impact: 'SQL injection can allow attackers to access, modify, or delete database data',
                            recommendation: 'Use parameterized queries or prepared statements instead of string concatenation',
                        });
                    }
                });
            });
        }

        return issues;
    }

    private checkXSS(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];

        if (['javascript', 'typescript'].includes(file.language)) {
            const patterns = [
                /innerHTML\s*=\s*[^"'`]/gi,
                /dangerouslySetInnerHTML/gi,
                /document\.write\s*\(/gi,
            ];

            const lines = file.content.split('\n');

            lines.forEach((line, index) => {
                patterns.forEach(pattern => {
                    if (pattern.test(line)) {
                        issues.push({
                            category: 'security',
                            severity: 'high',
                            title: 'Potential XSS Vulnerability',
                            description: 'Direct DOM manipulation detected that could allow XSS attacks',
                            location: {
                                file: file.path,
                                line: index + 1,
                                snippet: line.trim(),
                            },
                            impact: 'Cross-site scripting can allow attackers to inject malicious scripts',
                            recommendation: 'Sanitize user input and use safe DOM manipulation methods or framework-specific safe rendering',
                        });
                    }
                });
            });
        }

        return issues;
    }

    private checkInsecureDependencies(file: CodeFile): QualityIssue[] {
        const issues: QualityIssue[] = [];

        if (file.path.includes('package.json') || file.path.includes('requirements.txt')) {
            if (file.content.includes('*') || file.content.includes('^') || file.content.includes('~')) {
                issues.push({
                    category: 'security',
                    severity: 'medium',
                    title: 'Unpinned Dependencies',
                    description: 'Dependencies use version ranges instead of exact versions',
                    location: {
                        file: file.path,
                    },
                    impact: 'Version ranges can lead to unexpected breaking changes or security vulnerabilities',
                    recommendation: 'Pin dependencies to specific versions and use automated tools for updates',
                });
            }
        }

        return issues;
    }
}