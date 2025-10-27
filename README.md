# 🔍 Code Quality Intelligence Agent

An AI-powered code analysis tool that detects security vulnerabilities, performance issues, and complexity problems across multiple programming languages. Features both a web interface and CLI, with direct GitHub repository analysis capabilities.

**🌐 Live Demo**: [alextitov.com/code-quality-agent](https://alextitov.com/code-quality-agent)

## ✨ Features

- 🌍 **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, Go, Ruby, PHP, Swift, Kotlin, Rust
- 🔒 **Security Analysis**: Detects hardcoded secrets, SQL injection, XSS vulnerabilities, and insecure practices
- ⚡ **Performance Analysis**: Identifies nested loops, memory leaks, inefficient operations
- 🔄 **Complexity Analysis**: Measures cyclomatic complexity, function length, code duplication
- 🤖 **AI-Enhanced**: Uses OpenAI GPT-4o for intelligent insights and recommendations
- 🐙 **GitHub Integration**: Analyze any public GitHub repository by URL
- 💬 **Interactive Q&A**: Ask questions about your codebase analysis
- 📊 **Beautiful Reports**: HTML and Markdown reports with actionable recommendations
- 🐳 **Docker Ready**: Containerized for easy deployment

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker run -d \
  -e OPENAI_API_KEY=your-key-here \
  -p 3000:3000 \
  471112521203.dkr.ecr.us-east-1.amazonaws.com/code-quality-agent:latest

# Or use docker-compose
docker-compose up -d
```

### Option 2: Local Development

```bash
# Clone and install
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent
npm install

# Configure
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Build and run
npm run build
npm start

# Or run in development mode
npm run dev
```

Visit `http://localhost:3000` to access the web interface.

## 💻 Usage

### Web Interface

1. **Upload Files**: Drag and drop code files for instant analysis
2. **GitHub Analysis**: Enter a GitHub URL (e.g., `facebook/react` or `https://github.com/owner/repo`)
3. **View Reports**: Get detailed HTML reports with severity-coded issues
4. **Ask Questions**: Query the AI about your analysis results

### CLI

```bash
# Analyze a directory
npm run analyze -- /path/to/code

# Analyze specific files
npm run analyze -- ./src/index.ts
```

### API

```bash
# Analyze GitHub repository
curl -X POST http://localhost:3000/api/analyze/github \
  -H "Content-Type: application/json" \
  -d '{"githubUrl": "facebook/react"}'

# Upload files
curl -X POST http://localhost:3000/api/analyze/files \
  -F "files=@example.js" \
  -F "files=@app.py"

# Ask questions
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "report-1234567890",
    "question": "What are the critical security issues?"
  }'
```

## 🐙 GitHub Integration

Analyze any public GitHub repository:

**Supported URL formats:**
- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/branch`
- `owner/repo` (shorthand)
- `git@github.com:owner/repo.git`

**Example repositories to try:**
- `facebook/react`
- `microsoft/vscode`
- `vercel/next.js`
- `nodejs/node`

## 🔍 Analysis Categories

### 🔒 Security
- Hardcoded secrets and credentials
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting)
- Insecure coding practices

### ⚡ Performance
- Nested loops (O(n²+) complexity)
- Memory leaks
- Inefficient operations
- Resource management issues

### 🔄 Complexity
- High cyclomatic complexity
- Long functions (>50 lines)
- Code duplication
- Maintainability concerns

### 🤖 AI-Enhanced
- Testing gaps
- Documentation issues
- Architecture concerns
- Best practice violations

## � Example Output

**Analysis Results:**
```
✅ GitHub Analysis Complete!
Repository: facebook/react
Total Files: 156
Total Issues: 23
Critical Issues: 2
Quality Score: 78/100
Security Score: 85/100
Maintainability Score: 72/100
```

**Generated Reports:**
- Interactive HTML report with color-coded severity
- Downloadable Markdown summary
- Detailed issue descriptions with code snippets
- Impact analysis and fix recommendations

## 🐳 Docker Deployment

### Using Docker Compose

```yaml
services:
  code-quality-agent:
    image: 471112521203.dkr.ecr.us-east-1.amazonaws.com/code-quality-agent:latest
    container_name: code-quality-agent
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}  # Optional, for higher rate limits
      - NODE_ENV=production
      - PORT=3000
    ports:
      - "3000:3000"
    restart: unless-stopped
```

```bash
export OPENAI_API_KEY='your-key-here'
docker-compose up -d
```

### Behind Nginx

```nginx
location /code-quality-agent {
    rewrite ^/code-quality-agent/(.*) /$1 break;
    rewrite ^/code-quality-agent$ / break;
    
    proxy_pass http://code-quality-agent:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # For GitHub cloning and file uploads
    proxy_read_timeout 300s;
    client_max_body_size 50M;
}
```

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check and API info |
| `/api/analyze/files` | POST | Upload and analyze files |
| `/api/analyze/directory` | POST | Analyze local directory |
| `/api/analyze/github` | POST | Analyze GitHub repository |
| `/api/ask` | POST | Ask questions about results |
| `/api/report/:id` | GET | Get analysis results |
| `/reports/:filename` | GET | Access generated reports |

## 📁 Project Structure

```
code-quality-agent/
├── src/
│   ├── index.ts              # Express server
│   ├── agent.ts              # Main analysis engine
│   ├── cli.ts                # CLI tool
│   ├── analyzers/            # Security, performance, complexity
│   └── utils/                # File parsing, reports, GitHub
├── public/
│   └── index.html            # Web interface
├── Dockerfile                # Production container
├── docker-compose-integration.yml
├── nginx-integration.conf    # Nginx configuration
└── package.json
```

## 🔧 Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...           # Your OpenAI API key

# Optional
GITHUB_TOKEN=ghp_...            # GitHub token for higher rate limits
PORT=3000                       # Server port
NODE_ENV=production             # Environment mode
```

## 🎯 Supported Languages

JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Ruby, PHP, Swift, Kotlin, Rust

## 🚨 Rate Limits

- **GitHub API** (without token): 60 requests/hour
- **GitHub API** (with token): 5,000 requests/hour
- **OpenAI**: Based on your API plan

Set `GITHUB_TOKEN` environment variable for higher limits.

## 🤝 Contributing

Contributions welcome! Please submit issues or pull requests.

```bash
# Development setup
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent
npm install
cp .env.example .env
npm run dev
```

## 📄 License

MIT License

---

**Built with ❤️ using Node.js, TypeScript, Express, and OpenAI GPT-4o**

🌐 **Live Demo**: [alextitov.com/code-quality-agent](https://alextitov.com/code-quality-agent)
