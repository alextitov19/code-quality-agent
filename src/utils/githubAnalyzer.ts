import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { CodeFile } from '../types';
import { FileParser } from './fileParser';

interface GitHubRepoInfo {
    owner: string;
    repo: string;
    branch?: string;
}

export class GitHubAnalyzer {
    private tempDir: string;
    private fileParser: FileParser;

    constructor() {
        this.tempDir = path.join(process.cwd(), 'temp-repos');
        this.fileParser = new FileParser();
    }

    /**
     * Parses a GitHub URL to extract owner, repo, and optional branch
     */
    parseGitHubUrl(url: string): GitHubRepoInfo {
        // Support various GitHub URL formats:
        // https://github.com/owner/repo
        // https://github.com/owner/repo/tree/branch
        // git@github.com:owner/repo.git
        // owner/repo

        let cleanUrl = url.trim();

        // Handle SSH format
        if (cleanUrl.startsWith('git@github.com:')) {
            cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
            cleanUrl = cleanUrl.replace('.git', '');
        }

        // Handle simple owner/repo format
        if (!cleanUrl.startsWith('http') && cleanUrl.includes('/') && !cleanUrl.includes(' ')) {
            cleanUrl = `https://github.com/${cleanUrl}`;
        }

        // Extract parts from URL
        const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/;
        const match = cleanUrl.match(regex);

        if (!match) {
            throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo or owner/repo');
        }

        const [, owner, repo, branch] = match;

        return {
            owner: owner.trim(),
            repo: repo.replace('.git', '').trim(),
            branch: branch || 'main'
        };
    }

    /**
     * Clones a GitHub repository and analyzes it
     */
    async analyzeGitHubRepo(url: string): Promise<{
        files: CodeFile[];
        repoInfo: GitHubRepoInfo;
        tempPath: string;
    }> {
        const repoInfo = this.parseGitHubUrl(url);
        const repoPath = path.join(this.tempDir, `${repoInfo.owner}-${repoInfo.repo}-${Date.now()}`);

        try {
            // Ensure temp directory exists
            await fs.ensureDir(this.tempDir);

            console.log(`📥 Cloning repository: ${repoInfo.owner}/${repoInfo.repo}`);

            // Clone the repository
            const git = simpleGit();
            const cloneUrl = `https://github.com/${repoInfo.owner}/${repoInfo.repo}.git`;

            await git.clone(cloneUrl, repoPath);

            console.log(`✅ Repository cloned to: ${repoPath}`);

            // Parse the files
            const files = await this.fileParser.parseDirectory(repoPath);

            console.log(`📁 Found ${files.length} code files in repository`);

            return {
                files,
                repoInfo,
                tempPath: repoPath
            };

        } catch (error) {
            // Clean up on error
            if (await fs.pathExists(repoPath)) {
                await fs.remove(repoPath);
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clone repository: ${errorMessage}`);
        }
    }

    /**
     * Validates that a GitHub repository exists and is accessible
     */
    async validateGitHubRepo(url: string): Promise<boolean> {
        try {
            const repoInfo = this.parseGitHubUrl(url);

            // Simple validation - try to access the GitHub API
            const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`);

            if (response.status === 404) {
                throw new Error('Repository not found or is private');
            }

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const repoData = await response.json() as { size?: number };

            // Check if the repository is too large (over 100MB)
            if (repoData.size && repoData.size > 100000) { // GitHub API returns size in KB
                console.warn(`⚠️  Large repository detected (${Math.round(repoData.size / 1024)}MB). Analysis may take longer.`);
            }

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Repository validation failed: ${errorMessage}`);
        }
    }

    /**
     * Cleans up temporary repository files
     */
    async cleanup(tempPath: string): Promise<void> {
        try {
            if (await fs.pathExists(tempPath)) {
                await fs.remove(tempPath);
                console.log(`🧹 Cleaned up temporary files: ${tempPath}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Warning: Failed to clean up temporary files: ${errorMessage}`);
        }
    }

    /**
     * Cleans up all temporary repositories older than 1 hour
     */
    async cleanupOldRepos(): Promise<void> {
        try {
            if (!(await fs.pathExists(this.tempDir))) {
                return;
            }

            const entries = await fs.readdir(this.tempDir);
            const oneHourAgo = Date.now() - (60 * 60 * 1000);

            for (const entry of entries) {
                const entryPath = path.join(this.tempDir, entry);
                const stats = await fs.stat(entryPath);

                if (stats.isDirectory() && stats.mtimeMs < oneHourAgo) {
                    await fs.remove(entryPath);
                    console.log(`🧹 Cleaned up old repository: ${entry}`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Warning: Failed to clean up old repositories: ${errorMessage}`);
        }
    }
}