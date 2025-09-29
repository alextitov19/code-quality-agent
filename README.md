# 🔍 Code Quality Intelligence Agent

An AI-powered code analysis tool that detects security vulnerabilities, performance issues, and complexity problems across multiple programming languages. Features both web interface and CLI, with direct GitHub repository analysis capabilities.

## ✨ Features

🌍 **Multi-Language Support**: JavaScript, TypeScript, Python, Java, C++, Go, Ruby, PHP, Swift, Kotlin, Rust, and more

🔒 **Security Analysis**: Detects hardcoded secrets, SQL injection, XSS vulnerabilities, and insecure practices

⚡ **Performance Analysis**: Identifies nested loops, memory leaks, inefficient operations, and performance bottlenecks

🔄 **Complexity Analysis**: Measures cyclomatic complexity, function length, code duplication, and maintainability

🤖 **AI-Enhanced**: Uses OpenAI GPT-4o to provide additional insights, recommendations, and intelligent analysis

🐙 **GitHub Integration**: Analyze any public GitHub repository directly from a URL

💬 **Interactive Q&A**: Ask natural language questions about your codebase analysis

📊 **Beautiful Reports**: Generates HTML and Markdown reports with detailed insights and actionable recommendations

🌐 **Web Interface**: User-friendly web UI for file uploads and GitHub repo analysis

⚡ **CLI Tool**: Command-line interface for integration into CI/CD pipelines

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

1. Clone the repository:
```bash
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

4. Create necessary directories:
```bash
mkdir -p uploads reports temp-repos
touch uploads/.gitkeep reports/.gitkeep
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 💻 Usage

### Option 1: Web Interface (Recommended)

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:3000`

3. Choose your analysis method:
   - **Upload Files**: Select and upload code files directly
   - **🐙 GitHub Repository**: Enter a GitHub URL (e.g., `facebook/react`, `https://github.com/microsoft/vscode`)
   - **Ask Questions**: Query the AI about your analysis results

### Option 2: CLI

Analyze a directory or file:
```bash
npm run analyze -- /path/to/your/code
npm run analyze -- ./src/example.js
```

### Option 3: API Integration

**Analyze uploaded files:**
```bash
curl -X POST http://localhost:3000/api/analyze/files \
  -F "files=@example.js" \
  -F "files=@app.py"
```

**Analyze a GitHub repository:**
```bash
curl -X POST http://localhost:3000/api/analyze/github \
  -H "Content-Type: application/json" \
  -d '{"githubUrl": "facebook/react"}'
```

**Analyze local directory:**
```bash
curl -X POST http://localhost:3000/api/analyze/directory \
  -H "Content-Type: application/json" \
  -d '{"directoryPath": "./test-code"}'
```

**Ask questions about results:**
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "github-facebook-react-1234567890",
    "question": "What are the most critical security issues in this codebase?"
  }'
```

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check and API documentation |
| `/api/analyze/files` | POST | Upload and analyze multiple files |
| `/api/analyze/directory` | POST | Analyze a local directory |
| `/api/analyze/github` | POST | Analyze a GitHub repository by URL |
| `/api/ask` | POST | Ask AI questions about analysis results |
| `/api/report/:id` | GET | Retrieve detailed analysis results |
| `/reports/:filename` | GET | Access generated HTML/MD reports |

## 🐙 GitHub Integration

The agent can analyze any public GitHub repository directly:

### Supported URL Formats:
- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/branch`
- `owner/repo` (shorthand)
- `git@github.com:owner/repo.git` (SSH)

### Features:
- ✅ Automatic repository cloning and cleanup
- ✅ Branch-specific analysis (defaults to main)
- ✅ Repository validation before analysis
- ✅ Large repository warnings
- ✅ Comprehensive error handling

### Example Repositories to Try:
- `facebook/react` - Popular React library
- `microsoft/vscode` - VS Code editor
- `nodejs/node` - Node.js runtime
- `vercel/next.js` - Next.js framework

## 🎯 Supported Languages

The agent supports analysis of the following programming languages:

- **JavaScript** (.js, .jsx)
- **TypeScript** (.ts, .tsx)
- **Python** (.py)
- **Java** (.java)
- **C++** (.cpp)
- **C** (.c)
- **C#** (.cs)
- **Go** (.go)
- **Ruby** (.rb)
- **PHP** (.php)
- **Swift** (.swift)
- **Kotlin** (.kt)
- **Rust** (.rs)

## 🔍 Analysis Categories

### 🔒 Security
- Hardcoded secrets and credentials
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting) vulnerabilities
- Insecure coding practices
- Potential data exposure risks

### ⚡ Performance
- Deeply nested loops (O(n²+) complexity)
- Memory leaks (event listeners, intervals)
- Inefficient array operations and chaining
- Resource management issues
- Performance bottlenecks

### 🔄 Complexity
- High cyclomatic complexity functions
- Overly long functions and methods
- Code duplication detection
- Maintainability concerns
- Architecture violations

### 🤖 AI-Enhanced Detection
- Testing gaps and coverage issues
- Documentation quality problems
- Architecture and design concerns
- Best practice violations
- Code quality recommendations

## 📁 Project Structure

```
code-quality-agent/
├── src/
│   ├── index.ts              # Express server with API endpoints
│   ├── agent.ts              # Main CodeQualityAgent with OpenAI integration
│   ├── cli.ts                # CLI tool for command-line usage
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── analyzers/
│   │   ├── security.ts       # Security vulnerability analyzer
│   │   ├── performance.ts    # Performance issue analyzer
│   │   └── complexity.ts     # Code complexity analyzer
│   └── utils/
│       ├── fileParser.ts     # File parsing and language detection
│       ├── reportGenerator.ts # HTML/Markdown report generation
│       └── githubAnalyzer.ts # GitHub repository cloning and analysis
├── public/
│   └── index.html            # Web interface with GitHub integration
├── test-code/
│   ├── example.js            # Sample problematic code
│   └── good-example.js       # Sample well-written code
├── uploads/                  # Temporary file storage
├── reports/                  # Generated analysis reports
├── temp-repos/              # Temporary GitHub repository clones
├── .env                      # Environment variables (OpenAI API key)
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 📊 Example Output

### Web Interface Results:
```
✅ GitHub Analysis Complete!
Repository: facebook/react
Branch: main
Report ID: github-facebook-react-1759168458470
Total Files: 156
Total Issues: 23
Critical Issues: 2
Quality Score: 78/100
Security Score: 85/100
Maintainability Score: 72/100
```

### CLI Output:
```
🔍 Analyzing: ./test-code
📁 Found 2 code files
Analyzing 2 files...

✅ Analysis complete!
📊 Total Issues: 31
🔴 Critical: 4
📈 Quality Score: 0/100

📄 Reports generated:
   HTML: reports/report-1759167941047.html
   Markdown: reports/report-1759167941047.md
```

### Server Logs:
```
🚀 Code Quality Intelligence Agent running on http://localhost:3000
📊 Reports available at http://localhost:3000/reports
📥 Cloning repository: facebook/react
✅ Repository cloned to: /temp-repos/facebook-react-1759168458470
📁 Found 156 code files in repository
🧹 Cleaned up temporary files
```

## 🧪 Testing & Examples

### Test with Sample Files

The project includes sample files for testing:

1. **Problematic Code** (`test-code/example.js`):
```javascript
// Security issues
const password = "hardcoded123";
const apiKey = "sk-1234567890abcdef";

// SQL injection vulnerability
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// High complexity function
function validateUser(user) {
  if (user) {
    if (user.age) {
      if (user.age > 18) {
        // ... deeply nested conditions
      }
    }
  }
  return false;
}
```

2. **Well-Written Code** (`test-code/good-example.js`):
```javascript
/**
 * User Management Service with proper security practices
 */
class UserService {
  constructor(database, logger) {
    this.db = database;
    this.logger = logger;
  }

  async createUser(userData) {
    this.validateUserData(userData);
    const hashedPassword = await this.hashPassword(userData.password);
    // ... secure implementation
  }
}
```

### Quick Test Commands:
```bash
# Test the problematic code
npm run analyze -- ./test-code/example.js

# Test the good code
npm run analyze -- ./test-code/good-example.js

# Test a GitHub repository
# Use the web interface at http://localhost:3000
# Enter: facebook/react
```

## 🚀 Key Features Highlight

- **🌐 Web Interface**: Upload files or analyze GitHub repos with a beautiful, responsive UI
- **⚡ CLI Integration**: Perfect for CI/CD pipelines and automated workflows  
- **🤖 AI-Powered**: OpenAI GPT-4o provides intelligent insights beyond pattern matching
- **🐙 GitHub Direct**: Analyze any public repository with just a URL
- **📊 Rich Reports**: Interactive HTML reports and portable Markdown summaries
- **💬 Interactive Q&A**: Ask natural language questions about your code analysis
- **🔄 Real-time**: Fast analysis with automatic cleanup and error handling
- **🎯 Multi-Language**: Supports 13+ programming languages out of the box

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup:
```bash
git clone https://github.com/alextitov19/code-quality-agent.git
cd code-quality-agent
npm install
cp .env.example .env  # Add your OpenAI API key
npm run dev
```

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

---

**Built with ❤️ using Node.js, TypeScript, Express, and OpenAI GPT-4o**