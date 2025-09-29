import { Command } from 'commander';
import dotenv from 'dotenv';
import path from 'path';
import { CodeQualityAgent } from './agent';
import { FileParser } from './utils/fileParser';
import { ReportGenerator } from './utils/reportGenerator';

dotenv.config();

const program = new Command();

program
    .name('code-quality-agent')
    .description('AI-powered Code Quality Intelligence Agent')
    .version('1.0.0');

program
    .command('analyze')
    .description('Analyze a codebase')
    .argument('<path>', 'Path to directory or file')
    .option('-o, --output <path>', 'Output directory for reports', './reports')
    .action(async (targetPath: string, options) => {
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                console.error('❌ OPENAI_API_KEY not set in .env file');
                process.exit(1);
            }

            console.log(`🔍 Analyzing: ${targetPath}`);

            const agent = new CodeQualityAgent(apiKey);
            const fileParser = new FileParser();
            const reportGenerator = new ReportGenerator();

            // Check if target is a file or directory
            const fs = require('fs');
            const isFile = fs.statSync(targetPath).isFile();
            
            let codeFiles;
            if (isFile) {
                codeFiles = await fileParser.parseFiles([targetPath]);
            } else {
                codeFiles = await fileParser.parseDirectory(targetPath);
            }
            
            console.log(`📁 Found ${codeFiles.length} code files`);

            if (codeFiles.length === 0) {
                console.log('❌ No supported code files found');
                process.exit(1);
            }

            const result = await agent.analyzeCode(codeFiles);

            const timestamp = Date.now();
            const htmlPath = path.join(options.output, `report-${timestamp}.html`);
            const mdPath = path.join(options.output, `report-${timestamp}.md`);

            await reportGenerator.generateHTMLReport(result, htmlPath);
            await reportGenerator.generateMarkdownReport(result, mdPath);

            console.log('\n✅ Analysis complete!');
            console.log(`📊 Total Issues: ${result.summary.totalIssues}`);
            console.log(`🔴 Critical: ${result.summary.criticalIssues}`);
            console.log(`📈 Quality Score: ${result.metrics.codeQualityScore}/100`);
            console.log(`\n📄 Reports generated:`);
            console.log(`   HTML: ${htmlPath}`);
            console.log(`   Markdown: ${mdPath}`);
        } catch (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    });

program.parse();