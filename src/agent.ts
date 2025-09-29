import OpenAI from 'openai';
import { CodeFile, QualityIssue, AnalysisResult } from './types';
import { SecurityAnalyzer } from './analyzers/security';
import { PerformanceAnalyzer } from './analyzers/performance';
import { ComplexityAnalyzer } from './analyzers/complexity';

export class CodeQualityAgent {
    private client: OpenAI;
    private securityAnalyzer: SecurityAnalyzer;
    private performanceAnalyzer: PerformanceAnalyzer;
    private complexityAnalyzer: ComplexityAnalyzer;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
        this.securityAnalyzer = new SecurityAnalyzer();
        this.performanceAnalyzer = new PerformanceAnalyzer();
        this.complexityAnalyzer = new ComplexityAnalyzer();
    }

    async analyzeCode(files: CodeFile[]): Promise<AnalysisResult> {
        console.log(`Analyzing ${files.length} files...`);

        const securityIssues = this.securityAnalyzer.analyze(files);
        const performanceIssues = this.performanceAnalyzer.analyze(files);
        const complexityIssues = this.complexityAnalyzer.analyze(files);

        const allIssues = [
            ...securityIssues,
            ...performanceIssues,
            ...complexityIssues,
        ];

        const enhancedIssues = await this.enhanceWithAI(files, allIssues);
        const metrics = this.calculateMetrics(allIssues);
        const languages = [...new Set(files.map(f => f.language))];

        return {
            summary: {
                totalFiles: files.length,
                totalIssues: enhancedIssues.length,
                criticalIssues: enhancedIssues.filter(i => i.severity === 'critical').length,
                languages,
                analysisDate: new Date().toISOString(),
            },
            issues: enhancedIssues,
            metrics,
        };
    }

    private async enhanceWithAI(
        files: CodeFile[],
        issues: QualityIssue[]
    ): Promise<QualityIssue[]> {
        const codeContext = files.slice(0, 5).map(f => ({
            path: f.path,
            language: f.language,
            preview: f.content.substring(0, 500),
        }));

        const prompt = `You are a code quality expert. Review the following analysis and provide additional insights.

Code Context:
${JSON.stringify(codeContext, null, 2)}

Current Issues Found:
${JSON.stringify(issues.slice(0, 10), null, 2)}

Based on this analysis, identify any additional quality concerns related to:
1. Testing gaps (missing tests, low coverage areas)
2. Documentation issues (missing comments, unclear APIs)
3. Architecture concerns (tight coupling, violations of SOLID principles)

Return your findings as a JSON array of issues following this structure:
{
  "category": "testing" | "documentation" | "complexity",
  "severity": "critical" | "high" | "medium" | "low",
  "title": "Brief title",
  "description": "Detailed description",
  "location": {"file": "path"},
  "impact": "What problems this causes",
  "recommendation": "How to fix it"
}`;

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt,
                }],
            });

            const content = response.choices[0]?.message?.content;
            if (content) {
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const aiIssues = JSON.parse(jsonMatch[0]) as QualityIssue[];
                    return [...issues, ...aiIssues];
                }
            }
        } catch (error) {
            console.error('Error enhancing with AI:', error);
        }

        return issues;
    }

    async answerQuestion(
        question: string,
        analysisResult: AnalysisResult,
        files: CodeFile[]
    ): Promise<string> {
        const context = `
Analysis Summary:
- Total Files: ${analysisResult.summary.totalFiles}
- Total Issues: ${analysisResult.summary.totalIssues}
- Critical Issues: ${analysisResult.summary.criticalIssues}
- Languages: ${analysisResult.summary.languages.join(', ')}
- Code Quality Score: ${analysisResult.metrics.codeQualityScore}/100
- Security Score: ${analysisResult.metrics.securityScore}/100

Top Issues:
${analysisResult.issues.slice(0, 5).map(issue =>
            `- [${issue.severity.toUpperCase()}] ${issue.title} in ${issue.location.file}`
        ).join('\n')}

Files Overview:
${files.slice(0, 3).map(f => `- ${f.path} (${f.language}, ${f.size} bytes)`).join('\n')}
`;

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `You are a helpful code quality assistant. Answer the following question about the codebase analysis.

Context:
${context}

Question: ${question}

Provide a clear, conversational answer that helps the developer understand the codebase better.`,
            }],
        });

        const content = response.choices[0]?.message?.content;
        return content || 'Unable to generate response';
    }

    private calculateMetrics(issues: QualityIssue[]): {
        codeQualityScore: number;
        securityScore: number;
        maintainabilityScore: number;
    } {
        const severityWeights = {
            critical: 10,
            high: 5,
            medium: 2,
            low: 1,
        };

        const totalWeight = issues.reduce(
            (sum, issue) => sum + severityWeights[issue.severity],
            0
        );

        const baseScore = 100;
        const codeQualityScore = Math.max(0, baseScore - totalWeight);

        const securityIssues = issues.filter(i => i.category === 'security');
        const securityWeight = securityIssues.reduce(
            (sum, issue) => sum + severityWeights[issue.severity],
            0
        );
        const securityScore = Math.max(0, baseScore - securityWeight * 2);

        const complexityIssues = issues.filter(i => i.category === 'complexity');
        const complexityWeight = complexityIssues.reduce(
            (sum, issue) => sum + severityWeights[issue.severity],
            0
        );
        const maintainabilityScore = Math.max(0, baseScore - complexityWeight * 1.5);

        return {
            codeQualityScore: Math.round(codeQualityScore),
            securityScore: Math.round(securityScore),
            maintainabilityScore: Math.round(maintainabilityScore),
        };
    }
}