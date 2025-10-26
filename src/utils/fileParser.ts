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

        console.log(`📂 Found ${foundFiles.length} total files in directory`);
        console.log(`🔍 Looking for files with extensions: ${Object.keys(this.supportedExtensions).join(', ')}`);

        for (const filePath of foundFiles) {
            const ext = path.extname(filePath);
            const language = this.supportedExtensions[ext];

            if (language) {
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const stats = await fs.stat(filePath);

                    // Skip very large files (>1MB)
                    if (stats.size > 1024 * 1024) {
                        console.log(`⏭️  Skipping large file (${Math.round(stats.size / 1024)}KB): ${path.relative(directoryPath, filePath)}`);
                        continue;
                    }

                    const relativePath = path.relative(directoryPath, filePath);
                    console.log(`✅ Added ${language} file: ${relativePath} (${stats.size} bytes)`);
                    
                    files.push({
                        path: relativePath,
                        content,
                        language,
                        size: stats.size,
                    });
                } catch (error) {
                    console.error(`❌ Error reading file ${filePath}:`, error);
                }
            }
        }

        console.log(`📊 Total code files parsed: ${files.length}`);
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