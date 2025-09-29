import fs from 'fs-extra';
import path from 'path';
import { AnalysisResult } from '../types';

export class ReportGenerator {
    async generateHTMLReport(
        result: AnalysisResult,
        outputPath: string
    ): Promise<void> {
        const html = this.createHTMLReport(result);
        await fs.writeFile(outputPath, html, 'utf-8');
        console.log(`Report generated: ${outputPath}`);
    }

    async generateMarkdownReport(
        result: AnalysisResult,
        outputPath: string
    ): Promise<void> {
        const markdown = this.createMarkdownReport(result);
        await fs.writeFile(outputPath, markdown, 'utf-8');
        console.log(`Report generated: ${outputPath}`);
    }

    private createHTMLReport(result: AnalysisResult): string {
        const { summary, issues, metrics } = result;
        const issuesByCategory = this.groupIssuesByCategory(issues);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Quality Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h3 {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .card .value { font-size: 2em; font-weight: bold; color: #333; }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric h3 { margin-bottom: 10px; color: #555; }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
        }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .score-high { background: linear-gradient(90deg, #4caf50, #8bc34a); }
        .score-medium { background: linear-gradient(90deg, #ff9800, #ffc107); }
        .score-low { background: linear-gradient(90deg, #f44336, #e91e63); }
        .issues-section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .issue {
            border-left: 4px solid #ccc;
            padding: 15px;
            margin-bottom: 20px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .issue.critical { border-left-color: #d32f2f; }
        .issue.high { border-left-color: #f57c00; }
        .issue.medium { border-left-color: #fbc02d; }
        .issue.low { border-left-color: #388e3c; }
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .issue-title { font-size: 1.2em; font-weight: bold; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge.critical { background: #ffebee; color: #c62828; }
        .badge.high { background: #fff3e0; color: #e65100; }
        .badge.medium { background: #fffde7; color: #f57f17; }
        .badge.low { background: #e8f5e9; color: #2e7d32; }
        .issue-location {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        .issue-description { margin-bottom: 10px; }
        .issue-impact {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .issue-recommendation {
            background: #d1ecf1;
            padding: 10px;
            border-radius: 4px;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .snippet {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📊 Code Quality Report</h1>
            <p>Generated on ${new Date(summary.analysisDate).toLocaleString()}</p>
        </header>
        <div class="summary">
            <div class="card">
                <h3>Total Files</h3>
                <div class="value">${summary.totalFiles}</div>
            </div>
            <div class="card">
                <h3>Total Issues</h3>
                <div class="value">${summary.totalIssues}</div>
            </div>
            <div class="card">
                <h3>Critical Issues</h3>
                <div class="value" style="color: #d32f2f;">${summary.criticalIssues}</div>
            </div>
            <div class="card">
                <h3>Languages</h3>
                <div class="value" style="font-size: 1.2em;">${summary.languages.join(', ')}</div>
            </div>
        </div>
        <div class="metrics">
            <div class="metric">
                <h3>Code Quality Score</h3>
                <div style="font-size: 2em; font-weight: bold;">${metrics.codeQualityScore}/100</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(metrics.codeQualityScore)}" 
                         style="width: ${metrics.codeQualityScore}%"></div>
                </div>
            </div>
            <div class="metric">
                <h3>Security Score</h3>
                <div style="font-size: 2em; font-weight: bold;">${metrics.securityScore}/100</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(metrics.securityScore)}" 
                         style="width: ${metrics.securityScore}%"></div>
                </div>
            </div>
            <div class="metric">
                <h3>Maintainability Score</h3>
                <div style="font-size: 2em; font-weight: bold;">${metrics.maintainabilityScore}/100</div>
                <div class="progress-bar">
                    <div class="progress-fill ${this.getScoreClass(metrics.maintainabilityScore)}" 
                         style="width: ${metrics.maintainabilityScore}%"></div>
                </div>
            </div>
        </div>
        <div class="issues-section">
            <h2 style="margin-bottom: 20px;">🔍 Issues Found</h2>
            ${Object.entries(issuesByCategory).map(([category, categoryIssues]) => `
                <h3 style="margin-top: 30px; margin-bottom: 15px; text-transform: capitalize;">
                    ${this.getCategoryIcon(category)} ${category} (${categoryIssues.length})
                </h3>
                ${categoryIssues.map(issue => `
                    <div class="issue ${issue.severity}">
                        <div class="issue-header">
                            <div class="issue-title">${issue.title}</div>
                            <span class="badge ${issue.severity}">${issue.severity}</span>
                        </div>
                        <div class="issue-location">
                            📁 ${issue.location.file}${issue.location.line ? ` : Line ${issue.location.line}` : ''}
                        </div>
                        <div class="issue-description">${issue.description}</div>
                        ${issue.location.snippet ? `
                            <div class="snippet"><code>${this.escapeHtml(issue.location.snippet)}</code></div>
                        ` : ''}
                        <div class="issue-impact">
                            <strong>💥 Impact:</strong> ${issue.impact}
                        </div>
                        <div class="issue-recommendation">
                            <strong>💡 Recommendation:</strong> ${issue.recommendation}
                        </div>
                    </div>
                `).join('')}
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    private createMarkdownReport(result: AnalysisResult): string {
        const { summary, issues, metrics } = result;

        return `# 📊 Code Quality Report

**Generated:** ${new Date(summary.analysisDate).toLocaleString()}

## Summary

- **Total Files:** ${summary.totalFiles}
- **Total Issues:** ${summary.totalIssues}
- **Critical Issues:** ${summary.criticalIssues}
- **Languages:** ${summary.languages.join(', ')}

## Metrics

| Metric | Score |
|--------|-------|
| Code Quality | ${metrics.codeQualityScore}/100 |
| Security | ${metrics.securityScore}/100 |
| Maintainability | ${metrics.maintainabilityScore}/100 |

## Issues

${issues.map(issue => `
### ${issue.title}

**Severity:** ${issue.severity.toUpperCase()}  
**Category:** ${issue.category}  
**Location:** ${issue.location.file}${issue.location.line ? `:${issue.location.line}` : ''}

**Description:** ${issue.description}

${issue.location.snippet ? `\`\`\`\n${issue.location.snippet}\n\`\`\`` : ''}

**Impact:** ${issue.impact}

**Recommendation:** ${issue.recommendation}

---
`).join('\n')}`;
    }

    private groupIssuesByCategory(issues: any[]): { [key: string]: any[] } {
        return issues.reduce((acc, issue) => {
            if (!acc[issue.category]) acc[issue.category] = [];
            acc[issue.category].push(issue);
            return acc;
        }, {});
    }

    private getScoreClass(score: number): string {
        if (score >= 70) return 'score-high';
        if (score >= 40) return 'score-medium';
        return 'score-low';
    }

    private getCategoryIcon(category: string): string {
        const icons: { [key: string]: string } = {
            security: '🔒',
            performance: '⚡',
            complexity: '🔄',
            testing: '🧪',
            documentation: '📝',
            duplication: '📋',
        };
        return icons[category] || '📌';
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}