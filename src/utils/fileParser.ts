import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { CodeFile } from '../types';

export class FileParser {
    private supportedExtensions: { [key: string]: string } = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.cs': 'csharp',
        '.go': 'go',
        '.rb': 'ruby',
        '.php': 'php',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.rs': 'rust',
    };

    private ignorePaths = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.next/**',
        '**/vendor/**',
    ];

    async parseDirectory(directoryPath: string): Promise<CodeFile[]> {
        const files: CodeFile[] = [];

        const pattern = '**/*';
        const foundFiles = await glob(pattern, {
            cwd: directoryPath,
            ignore: this.ignorePaths,
            nodir: true,
            absolute: true,
        });

        for (const filePath of foundFiles) {
            const ext = path.extname(filePath);
            const language = this.supportedExtensions[ext];

            if (language) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const stats = await fs.stat(filePath);

                    // Skip very large files (>1MB)
                    if (stats.size > 1024 * 1024) {
                        console.log(`Skipping large file: ${filePath}`);
                        continue;
                    }

                    files.push({
                        path: path.relative(directoryPath, filePath),
                        content,
                        language,
                        size: stats.size,
                    });
                } catch (error) {
                    console.error(`Error reading file ${filePath}:`, error);
                }
            }
        }

        return files;
    }

    async parseFiles(filePaths: string[]): Promise<CodeFile[]> {
        const files: CodeFile[] = [];

        for (const filePath of filePaths) {
            const ext = path.extname(filePath);
            const language = this.supportedExtensions[ext];

            if (language) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const stats = await fs.stat(filePath);

                    files.push({
                        path: path.basename(filePath),
                        content,
                        language,
                        size: stats.size,
                    });
                } catch (error) {
                    console.error(`Error reading file ${filePath}:`, error);
                }
            }
        }

        return files;
    }

    getLanguageFromExtension(extension: string): string | undefined {
        return this.supportedExtensions[extension];
    }
}