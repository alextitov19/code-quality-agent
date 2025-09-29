export interface CodeFile {
    path: string;
    content: string;
    language: string;
    size: number;
}

export interface QualityIssue {
    category: 'security' | 'performance' | 'complexity' | 'duplication' | 'testing' | 'documentation';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    location: {
        file: string;
        line?: number;
        snippet?: string;
    };
    impact: string;
    recommendation: string;
}

export interface AnalysisResult {
    summary: {
        totalFiles: number;
        totalIssues: number;
        criticalIssues: number;
        languages: string[];
        analysisDate: string;
    };
    issues: QualityIssue[];
    metrics: {
        codeQualityScore: number;
        securityScore: number;
        maintainabilityScore: number;
    };
}

export interface AnalyzerConfig {
    maxFileSize: number;
    supportedLanguages: string[];
    ignorePaths: string[];
}