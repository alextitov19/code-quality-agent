import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { CodeQualityAgent } from './agent';
import { FileParser } from './utils/fileParser';
import { ReportGenerator } from './utils/reportGenerator';
import { AnalysisResult } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/reports', express.static('reports'));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in .env file');
    process.exit(1);
}

const agent = new CodeQualityAgent(apiKey);
const fileParser = new FileParser();
const reportGenerator = new ReportGenerator();

const analysisCache = new Map<string, AnalysisResult>();

app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Code Quality Intelligence Agent API',
        endpoints: {
            health: 'GET /',
            analyzeFiles: 'POST /api/analyze/files',
            analyzeDirectory: 'POST /api/analyze/directory',
            askQuestion: 'POST /api/ask',
            getReport: 'GET /api/report/:id',
        },
    });
});

app.post('/api/analyze/files', upload.array('files', 50), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        console.log(`Received ${files.length} files for analysis`);

        const filePaths = files.map(f => f.path);
        const codeFiles = await fileParser.parseFiles(filePaths);

        if (codeFiles.length === 0) {
            return res.status(400).json({ error: 'No supported code files found' });
        }

        const result = await agent.analyzeCode(codeFiles);

        const reportId = `report-${Date.now()}`;
        analysisCache.set(reportId, result);

        const reportPath = path.join('reports', `${reportId}.html`);
        await reportGenerator.generateHTMLReport(result, reportPath);

        await Promise.all(files.map(f => fs.remove(f.path)));

        res.json({
            success: true,
            reportId,
            reportUrl: `/reports/${reportId}.html`,
            summary: result.summary,
            metrics: result.metrics,
        });
    } catch (error) {
        console.error('Error analyzing files:', error);
        res.status(500).json({ error: 'Analysis failed', details: String(error) });
    }
});

app.post('/api/analyze/directory', async (req: Request, res: Response) => {
    try {
        const { directoryPath } = req.body;

        if (!directoryPath) {
            return res.status(400).json({ error: 'directoryPath is required' });
        }

        const exists = await fs.pathExists(directoryPath);
        if (!exists) {
            return res.status(400).json({ error: 'Directory does not exist' });
        }

        console.log(`Analyzing directory: ${directoryPath}`);

        const codeFiles = await fileParser.parseDirectory(directoryPath);

        if (codeFiles.length === 0) {
            return res.status(400).json({ error: 'No supported code files found in directory' });
        }

        const result = await agent.analyzeCode(codeFiles);

        const reportId = `report-${Date.now()}`;
        analysisCache.set(reportId, result);

        const htmlPath = path.join('reports', `${reportId}.html`);
        const mdPath = path.join('reports', `${reportId}.md`);

        await reportGenerator.generateHTMLReport(result, htmlPath);
        await reportGenerator.generateMarkdownReport(result, mdPath);

        res.json({
            success: true,
            reportId,
            reportUrl: `/reports/${reportId}.html`,
            markdownUrl: `/reports/${reportId}.md`,
            summary: result.summary,
            metrics: result.metrics,
        });
    } catch (error) {
        console.error('Error analyzing directory:', error);
        res.status(500).json({ error: 'Analysis failed', details: String(error) });
    }
});

app.post('/api/ask', async (req: Request, res: Response) => {
    try {
        const { reportId, question } = req.body;

        if (!reportId || !question) {
            return res.status(400).json({ error: 'reportId and question are required' });
        }

        const result = analysisCache.get(reportId);
        if (!result) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const answer = await agent.answerQuestion(question, result, []);

        res.json({
            success: true,
            question,
            answer,
        });
    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ error: 'Failed to answer question', details: String(error) });
    }
});

app.get('/api/report/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const result = analysisCache.get(id);

    if (!result) {
        return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`🚀 Code Quality Intelligence Agent running on http://localhost:${PORT}`);
    console.log(`📊 Reports available at http://localhost:${PORT}/reports`);
});