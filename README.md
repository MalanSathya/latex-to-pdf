# LaTeX to PDF Converter

A lightweight, serverless web application for converting LaTeX documents to PDF. Built with React and Lovable Cloud (Supabase Edge Functions).

## Features

✨ **Simple Web Interface** - Paste LaTeX, click convert, download PDF  
🔐 **Secure API** - API key authentication for programmatic access  
⚡ **Serverless** - Runs on Lovable Cloud with automatic scaling  
🎨 **Clean UI** - Developer-focused interface with syntax highlighting  
📚 **Full Documentation** - Complete API examples in multiple languages  

## Live Demo

Visit the deployed app to try it out instantly.

## Quick Start

### Web Interface

1. Open the web app
2. Paste or edit LaTeX code in the editor
3. Click "Generate PDF"
4. Download your compiled PDF

### API Usage

**Endpoint:** `POST /functions/v1/latex-convert`

**Headers:**
```
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
}
```

See [API_EXAMPLES.md](./API_EXAMPLES.md) for complete examples in cURL, JavaScript, Python, and Node.js.

## How It Works

1. **Frontend** - React app with textarea editor for LaTeX input
2. **Backend** - Serverless edge function that:
   - Validates API key
   - Accepts LaTeX source code
   - Calls LaTeX.Online compilation service
   - Returns compiled PDF as base64 data URL
3. **Compilation** - Uses [LaTeX.Online](https://latexonline.cc/) for secure, sandboxed LaTeX compilation

## Setup & Deployment

### Prerequisites
- Lovable account (for deployment)
- API key (configured via Lovable Secrets)

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd latex-converter

# Install dependencies
npm install

# Run development server
npm run dev
```

### Configure API Key

The `LATEX_API_KEY` secret is already configured in your Lovable Cloud project. This key is used to authenticate API requests.

### Deploy

Deployment is automatic through Lovable:
1. Push changes to your repository
2. Lovable automatically deploys updates
3. Your edge function is live instantly

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │
       │ POST /latex-convert
       │ { latex: "..." }
       │
       ▼
┌─────────────────────┐
│  Edge Function      │
│  (Deno Runtime)     │
│  - API Key Auth     │
│  - Input Validation │
└──────┬──────────────┘
       │
       │ LaTeX Source
       │
       ▼
┌─────────────────────┐
│  LaTeX.Online API   │
│  - Compile LaTeX    │
│  - Return PDF       │
└─────────────────────┘
```

## Security Features

- ✅ API key authentication required
- ✅ Input size validation (max 100KB)
- ✅ CORS headers configured
- ✅ Secure LaTeX compilation via external service
- ✅ No arbitrary shell execution
- ✅ Rate limiting recommended for production

## API Response Format

**Success:**
```json
{
  "success": true,
  "pdfUrl": "data:application/pdf;base64,JVBERi0xLj...",
  "message": "PDF compiled successfully"
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Limitations

- Maximum LaTeX source size: 100KB
- Serverless execution timeout: 30 seconds
- Depends on LaTeX.Online availability
- Standard LaTeX packages only (no custom installations)

## Cost & Scaling

**Lovable Cloud Free Tier:**
- Generous free usage included
- Usage-based pricing beyond free tier
- Automatically scales with demand
- No server management required

**LaTeX.Online:**
- Free public API
- Community-supported
- For production: Consider self-hosting or alternative services

## Troubleshooting

### Common Issues

**"Unauthorized" error:**
- Verify `x-api-key` header is set correctly
- Check API key in Lovable Cloud secrets

**"LaTeX compilation failed":**
- Validate LaTeX syntax
- Check for missing `\end{}` tags
- Ensure packages are standard LaTeX packages

**PDF won't download:**
- Try opening the data URL directly in browser
- Check browser console for errors

## Files Structure

```
├── src/
│   ├── pages/
│   │   └── Index.tsx          # Main React component
│   ├── index.css              # Design system & styles
│   └── integrations/
│       └── supabase/          # Auto-generated Supabase client
├── supabase/
│   ├── functions/
│   │   └── latex-convert/
│   │       └── index.ts       # Edge function implementation
│   └── config.toml            # Supabase configuration
├── API_EXAMPLES.md            # Detailed API documentation
└── README.md                  # This file
```

## Contributing

Contributions welcome! Areas for improvement:
- Additional LaTeX package support
- Caching for repeated compilations
- Rate limiting implementation
- Alternative compilation backends
- Batch processing support

## License

MIT License - feel free to use this project however you like.

## Resources

- [LaTeX.Online](https://latexonline.cc/) - LaTeX compilation service
- [Lovable Documentation](https://docs.lovable.dev/)
- [Overleaf](https://www.overleaf.com/learn) - Learn LaTeX
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Credits

Inspired by [latex-online](https://github.com/aslushnikov/latex-online) by @aslushnikov.
