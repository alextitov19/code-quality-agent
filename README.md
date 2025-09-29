# Code Quality Intelligence Agent

An AI-powered code analysis tool that detects security vulnerabilities, performance issues, and complexity problems across multiple programming languages.

## Features

✨ **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, Go, Ruby, PHP, and more

🔒 **Security Analysis**: Detects hardcoded secrets, SQL injection, XSS vulnerabilities

⚡ **Performance Analysis**: Identifies nested loops, memory leaks, inefficient operations

🔄 **Complexity Analysis**: Measures cyclomatic complexity, function length, code duplication

🤖 **AI-Enhanced**: Uses Claude AI to provide additional insights and recommendations

💬 **Interactive Q&A**: Ask natural language questions about your codebase

📊 **Beautiful Reports**: Generates HTML and Markdown reports with detailed insights

## Installation

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Setup

1. Clone or create the project:
```bash
mkdir code-quality-agent
cd code-quality-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

4. Create necessary directories:
```bash
mkdir -p uploads reports public
touch uploads/.gitkeep reports/.gitkeep
```

5. Build the project:
```bash
npm run build
```

## Usage

### Option 1: Web Server (Recommended)

Start the server:
```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Option 2: CLI

Analyze a directory:
```bash
npm run analyze -- /path/to/your/code
```

### Option 3: API

**Analyze files:**
```bash
curl -X POST http://localhost:3000/api/analyze/files \
  -F "files=@example.js" \
  -F "files=@app.py"
```

**Analyze directory:**
```bash
curl -X POST http://localhost:3000/api/analyze/directory \
  -H "Content-Type: application/json" \
  -d '{"directoryPath": "./test-code"}'
```

**Ask a question:**
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "report-1234567890",
    "question": "What are the most critical security issues?"
  }'
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/analyze/files` | POST | Upload and analyze files |
| `/api/analyze/directory` | POST | Analyze a directory |
| `/api/ask` | POST | Ask questions about analysis |
| `/api/report/:id` | GET | Get analysis results |

## Supported Languages

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- Java (.java)
- C++ (.cpp)
- C (.c)
- C# (.cs)
- Go (.go)
- Ruby (.rb)
- PHP (.php)
- Swift (.swift)
- Kotlin (.kt)
- Rust (.rs)

## Issue Categories

### Security
- Hardcoded secrets and credentials
- SQL injection vulnerabilities
- XSS vulnerabilities
- Unpinned dependencies

### Performance
- Deeply nested loops
- Memory leaks (event listeners, intervals)
- Inefficient operations
- Chained array operations

### Complexity
- High cyclomatic complexity
- Long functions
- Code duplication

### AI-Enhanced Detection
- Testing gaps
- Documentation issues
- Architecture concerns

## Project Structure

```
code-quality-agent/
├── src/
│   ├── index.ts              # Express server
│   ├── agent.ts              # Main agent logic
│   ├── cli.ts                # CLI tool
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── analyzers/
│   │   ├── security.ts       # Security analyzer
│   │   ├── performance.ts    # Performance analyzer
│   │   └── complexity.ts     # Complexity analyzer
│   └── utils/
│       ├── fileParser.ts     # File parsing utility
│       └── reportGenerator.ts # Report generation
├── public/
│   └── index.html            # Web interface
├── uploads/                  # Temporary file storage
├── reports/                  # Generated reports
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## Example Output

```
🚀 Code Quality Intelligence Agent running on http://localhost:3000
📊 Reports available at http://localhost:3000/reports

✅ Analysis complete!
📊 Total Issues: 15
🔴 Critical: 3
📈 Quality Score: 65/100

📄 Reports generated:
   HTML: reports/report-1234567890.html
   Markdown: reports/report-1234567890.md
```

## Testing

Create a test file with intentional issues:

```javascript
// test-code/example.js
const password = "hardcoded123";  // Security issue

function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;  // SQL injection
  return database.execute(query);
}
```

Then analyze:
```bash
npm run dev
# Open browser to http://localhost:3000 and upload the file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT