# LaTeX to PDF Converter - API Examples

## Overview

This API allows you to convert LaTeX documents to PDF programmatically. It uses secure API key authentication and runs on a serverless infrastructure.

## Authentication

All requests require an API key sent in the `x-api-key` header:

```
x-api-key: YOUR_API_KEY
```

You configured your API key when setting up the project. Keep it secret!

## Base URL

```
https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1
```

## Endpoint

### POST /latex-convert

Compile LaTeX source code to PDF.

**Request Body:**
```json
{
  "latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
}
```

**Response (Success):**
```json
{
  "success": true,
  "pdfUrl": "data:application/pdf;base64,JVBERi0xLj...",
  "message": "PDF compiled successfully"
}
```

**Response (Error):**
```json
{
  "error": "LaTeX compilation failed. Please check your LaTeX syntax.",
  "details": "Error details here..."
}
```

## Examples

### cURL

```bash
curl -X POST https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\documentclass{article}\\usepackage{amsmath}\\begin{document}\\section{Test}This is a test. $E=mc^2$\\end{document}"
  }'
```

### JavaScript (Browser)

```javascript
async function compileLaTeX(latexSource) {
  try {
    const response = await fetch(
      'https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert',
      {
        method: 'POST',
        headers: {
          'x-api-key': 'YOUR_API_KEY',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: latexSource }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('Compilation failed:', data.error);
      return null;
    }

    // data.pdfUrl is a data URL - you can use it directly
    return data.pdfUrl;
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Usage
const latex = `\\documentclass{article}
\\begin{document}
Hello from JavaScript!
\\end{document}`;

const pdfUrl = await compileLaTeX(latex);
if (pdfUrl) {
  // Open in new tab
  window.open(pdfUrl, '_blank');
  
  // Or create download link
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'document.pdf';
  link.click();
}
```

### Node.js

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function compileLaTeX(latexSource) {
  const response = await fetch(
    'https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert',
    {
      method: 'POST',
      headers: {
        'x-api-key': 'YOUR_API_KEY',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latex: latexSource }),
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  // Extract base64 data and save to file
  const base64Data = data.pdfUrl.replace(/^data:application\/pdf;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  fs.writeFileSync('output.pdf', buffer);
  console.log('PDF saved to output.pdf');
}

// Usage
const latex = `\\documentclass{article}
\\begin{document}
Hello from Node.js!
\\end{document}`;

compileLaTeX(latex).catch(console.error);
```

### Python

```python
import requests
import base64

def compile_latex(latex_source):
    url = "https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert"
    headers = {
        "x-api-key": "YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {"latex": latex_source}
    
    response = requests.post(url, json=data, headers=headers)
    result = response.json()
    
    if "error" in result:
        raise Exception(result["error"])
    
    # Extract base64 data and save to file
    pdf_data = result["pdfUrl"].split(",")[1]
    pdf_bytes = base64.b64decode(pdf_data)
    
    with open("output.pdf", "wb") as f:
        f.write(pdf_bytes)
    
    print("PDF saved to output.pdf")

# Usage
latex = r"""
\documentclass{article}
\begin{document}
Hello from Python!
\end{document}
"""

compile_latex(latex)
```

## Limits & Best Practices

### Rate Limiting
- The API implements basic rate limiting
- Recommended: Max 60 requests per minute per API key
- For high-volume usage, implement exponential backoff

### Document Size
- Maximum LaTeX source size: 100KB
- For larger documents, consider splitting them or using includes

### Security
- **Never** commit API keys to version control
- Use environment variables: `process.env.LATEX_API_KEY`
- Rotate keys periodically

### Error Handling
Always handle both network errors and compilation errors:

```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.error) {
    // Handle LaTeX compilation error
    console.error('LaTeX error:', data.error);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

## Common LaTeX Packages

The compiler supports standard LaTeX packages including:
- `amsmath`, `amssymb` - Mathematical symbols and equations
- `graphicx` - Image inclusion
- `hyperref` - Hyperlinks
- `geometry` - Page layout
- `fancyhdr` - Custom headers/footers
- And many more standard packages

## Troubleshooting

### "Unauthorized" Error
- Check that `x-api-key` header is set
- Verify your API key is correct

### "LaTeX compilation failed"
- Check LaTeX syntax in your document
- Verify all `\begin{}` have matching `\end{}`
- Ensure all packages used are standard LaTeX packages

### "Document too large"
- Reduce document size to under 100KB
- Remove unnecessary whitespace
- Consider splitting large documents

## Support

For issues or questions, check the LaTeX.Online documentation or common LaTeX resources:
- [Overleaf Documentation](https://www.overleaf.com/learn)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)
