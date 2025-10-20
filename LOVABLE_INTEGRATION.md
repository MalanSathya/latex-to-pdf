# Integrating LaTeX Converter into Your Lovable App

This guide shows how to integrate the LaTeX to PDF converter into another Lovable application.

## Quick Integration

### Step 1: Store Your API Key

In your Lovable app's edge function or frontend config:

```typescript
// In an edge function
const LATEX_API_KEY = Deno.env.get('LATEX_API_KEY');

// Or in frontend (for non-sensitive use cases only)
const LATEX_API_KEY = 'your-api-key-here';
```

### Step 2: Create a Helper Function

Add this to your project (e.g., `src/lib/latex.ts`):

```typescript
// src/lib/latex.ts

export interface LaTeXCompileResult {
  success: boolean;
  pdfUrl?: string;
  error?: string;
}

export async function compileLaTeX(
  latex: string,
  apiKey: string
): Promise<LaTeXCompileResult> {
  try {
    const response = await fetch(
      'https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      pdfUrl: data.pdfUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to compile LaTeX',
    };
  }
}
```

### Step 3: Use in Your Component

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { compileLaTeX } from '@/lib/latex';
import { toast } from '@/hooks/use-toast';

export function MyComponent() {
  const [isCompiling, setIsCompiling] = useState(false);

  const handleGeneratePDF = async () => {
    setIsCompiling(true);

    const latex = `
      \\documentclass{article}
      \\begin{document}
      \\section{Generated Report}
      This PDF was generated from my Lovable app!
      \\end{document}
    `;

    const result = await compileLaTeX(latex, 'YOUR_API_KEY');

    if (result.success && result.pdfUrl) {
      // Open PDF in new tab
      window.open(result.pdfUrl, '_blank');
      
      toast({
        title: 'Success',
        description: 'PDF generated successfully!',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to generate PDF',
        variant: 'destructive',
      });
    }

    setIsCompiling(false);
  };

  return (
    <Button onClick={handleGeneratePDF} disabled={isCompiling}>
      {isCompiling ? 'Generating...' : 'Generate PDF'}
    </Button>
  );
}
```

## Real-World Use Cases

### 1. Invoice Generator

```tsx
function generateInvoice(invoice: Invoice) {
  const latex = `
    \\documentclass{article}
    \\usepackage{booktabs}
    \\begin{document}
    \\title{Invoice \\#${invoice.number}}
    \\maketitle
    
    \\section*{Bill To}
    ${invoice.customerName}
    
    \\section*{Items}
    \\begin{tabular}{lrr}
    \\toprule
    Item & Qty & Price \\\\
    \\midrule
    ${invoice.items.map(item => 
      `${item.name} & ${item.qty} & \\$${item.price}`
    ).join(' \\\\\n')}
    \\midrule
    \\textbf{Total} & & \\$${invoice.total} \\\\
    \\bottomrule
    \\end{tabular}
    \\end{document}
  `;

  return compileLaTeX(latex, process.env.LATEX_API_KEY);
}
```

### 2. Certificate Generator

```tsx
function generateCertificate(name: string, course: string, date: string) {
  const latex = `
    \\documentclass[landscape]{article}
    \\usepackage{geometry}
    \\geometry{a4paper, margin=1in}
    \\usepackage{graphicx}
    
    \\begin{document}
    \\begin{center}
    \\Huge\\textbf{Certificate of Completion}
    
    \\vspace{1cm}
    \\Large This certifies that
    
    \\vspace{0.5cm}
    \\Huge\\textit{${name}}
    
    \\vspace{0.5cm}
    \\Large has successfully completed
    
    \\vspace{0.5cm}
    \\LARGE\\textbf{${course}}
    
    \\vspace{1cm}
    \\large ${date}
    \\end{center}
    \\end{document}
  `;

  return compileLaTeX(latex, process.env.LATEX_API_KEY);
}
```

### 3. Research Report

```tsx
function generateReport(data: ReportData) {
  const latex = `
    \\documentclass{article}
    \\usepackage{graphicx}
    \\usepackage{amsmath}
    
    \\title{${data.title}}
    \\author{${data.author}}
    \\date{\\today}
    
    \\begin{document}
    \\maketitle
    
    \\begin{abstract}
    ${data.abstract}
    \\end{abstract}
    
    \\section{Introduction}
    ${data.introduction}
    
    \\section{Results}
    ${data.results}
    
    \\section{Conclusion}
    ${data.conclusion}
    
    \\end{document}
  `;

  return compileLaTeX(latex, process.env.LATEX_API_KEY);
}
```

## Edge Function Integration

If you're calling this from another Lovable Cloud edge function:

```typescript
// supabase/functions/my-function/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Get API key from secrets
  const latexApiKey = Deno.env.get('LATEX_API_KEY');
  
  // Compile LaTeX
  const response = await fetch(
    'https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert',
    {
      method: 'POST',
      headers: {
        'x-api-key': latexApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latex: '\\documentclass{article}\\begin{document}Hello\\end{document}'
      }),
    }
  );

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Best Practices

### 1. Error Handling
Always wrap API calls in try-catch and provide user feedback:

```tsx
try {
  const result = await compileLaTeX(latex, apiKey);
  if (!result.success) {
    toast({
      title: 'Compilation Failed',
      description: result.error,
      variant: 'destructive',
    });
    return;
  }
  // Handle success
} catch (error) {
  console.error('LaTeX compilation error:', error);
  toast({
    title: 'Error',
    description: 'Network error - please try again',
    variant: 'destructive',
  });
}
```

### 2. Loading States
Show loading state while compiling:

```tsx
const [isLoading, setIsLoading] = useState(false);

async function handleCompile() {
  setIsLoading(true);
  try {
    const result = await compileLaTeX(latex, apiKey);
    // Handle result
  } finally {
    setIsLoading(false);
  }
}
```

### 3. Caching
Cache generated PDFs if they don't change:

```tsx
const pdfCache = new Map<string, string>();

async function getOrCompilePDF(latex: string) {
  const hash = btoa(latex); // Simple hash
  
  if (pdfCache.has(hash)) {
    return pdfCache.get(hash);
  }
  
  const result = await compileLaTeX(latex, apiKey);
  if (result.success && result.pdfUrl) {
    pdfCache.set(hash, result.pdfUrl);
    return result.pdfUrl;
  }
  
  return null;
}
```

### 4. Template System
Create reusable LaTeX templates:

```typescript
// src/lib/latex-templates.ts

export const templates = {
  letter: (data: LetterData) => `
    \\documentclass{letter}
    \\address{${data.from}}
    \\begin{document}
    \\begin{letter}{${data.to}}
    \\opening{${data.greeting}}
    ${data.body}
    \\closing{${data.closing}}
    \\end{letter}
    \\end{document}
  `,
  
  article: (data: ArticleData) => `
    \\documentclass{article}
    \\title{${data.title}}
    \\author{${data.author}}
    \\begin{document}
    \\maketitle
    ${data.content}
    \\end{document}
  `,
};

// Usage
const pdf = await compileLaTeX(
  templates.letter({
    from: 'John Doe',
    to: 'Jane Smith',
    greeting: 'Dear Jane,',
    body: 'This is the letter body...',
    closing: 'Sincerely,',
  }),
  apiKey
);
```

## Testing

Create a test component to verify integration:

```tsx
// src/components/LaTeXTest.tsx

import { Button } from '@/components/ui/button';
import { compileLaTeX } from '@/lib/latex';
import { toast } from '@/hooks/use-toast';

export function LaTeXTest() {
  const testCompilation = async () => {
    const latex = '\\documentclass{article}\\begin{document}Test\\end{document}';
    const result = await compileLaTeX(latex, 'YOUR_API_KEY');
    
    if (result.success) {
      toast({ title: 'Success!', description: 'LaTeX integration working' });
      window.open(result.pdfUrl, '_blank');
    } else {
      toast({ 
        title: 'Failed',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  return <Button onClick={testCompilation}>Test LaTeX Integration</Button>;
}
```

## Troubleshooting

**CORS Issues:**
The edge function is configured with proper CORS headers. If you encounter CORS issues, verify you're calling the correct endpoint.

**API Key Not Found:**
Make sure your API key is properly set in environment variables or Lovable secrets.

**TypeScript Errors:**
Ensure you have the proper type definitions for your LaTeX functions.

## Support

For issues specific to the LaTeX converter, refer to the main README.md and API_EXAMPLES.md files.
