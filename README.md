# ResumeAI — Vercel + Anthropic API

Resume optimizer, ATS analyzer, and cover letter generator.
Deployed on Vercel, powered by Claude Haiku.

## Project structure

```
resumeai-vercel/
├── index.html          ← frontend (static)
├── api/
│   ├── _lib.js         ← shared Anthropic client + streaming helper
│   ├── analyze.js      ← POST /api/analyze
│   ├── optimize.js     ← POST /api/optimize  (streaming)
│   ├── cover-letter.js ← POST /api/cover-letter (streaming)
│   └── parse-pdf.js    ← POST /api/parse-pdf
├── package.json
└── vercel.json
```

## Deploy

### 1. Vercel CLI
```bash
npm i -g vercel
cd resumeai-vercel
vercel
```

### 2. Or connect GitHub repo
- Push to GitHub
- Go to vercel.com → New Project → Import repo
- Done

### 3. Set environment variable
In Vercel dashboard → Project → Settings → Environment Variables:
```
ANTHROPIC_API_KEY = sk-ant-...
```

## Local dev
```bash
npm install
npm i -g vercel
vercel dev
```
Frontend: http://localhost:3000
API:      http://localhost:3000/api/*

## Cost estimate (Claude Haiku)
- ATS Analyze:    ~$0.0003 per request
- Optimize:       ~$0.0006 per request  
- Cover Letter:   ~$0.0005 per request
→ 1000 requests ≈ $0.50
