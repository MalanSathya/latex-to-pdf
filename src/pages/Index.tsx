import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Loader2, FileText, Download, CheckCircle, XCircle, Code, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}

\\title{LaTeX to PDF Converter}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This is a simple LaTeX document that demonstrates the conversion to PDF.

\\subsection{Mathematics}
Here's an equation:
\\begin{equation}
    E = mc^2
\\end{equation}

\\subsection{Lists}
\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}

\\end{document}`;

const Index = () => {
  const [latex, setLatex] = useState(DEFAULT_LATEX);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleCompile = async () => {
    setIsCompiling(true);
    setError(null);
    setSuccess(false);
    setPdfUrl(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('latex-convert', {
        body: { latex },
      });

      if (funcError) throw funcError;

      if (data.error) {
        setError(data.error);
        toast({
          title: "Compilation Failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setSuccess(true);
        setPdfUrl(data.pdfUrl);
        toast({
          title: "Success!",
          description: "PDF compiled successfully",
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to compile LaTeX";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = async () => {
    if (pdfUrl) {
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed:', error);
        toast({
          title: "Download Failed",
          description: "Could not download the PDF",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Code className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">LaTeX → PDF</h1>
          </div>
          <p className="text-muted-foreground">
            Compile LaTeX documents to PDF instantly
          </p>
        </div>

        {/* Main Editor and Preview */}
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border border-border">
          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="h-full border-0 rounded-none bg-card">
              <div className="p-6 space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    LaTeX Source
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {latex.length} characters
                  </span>
                </div>
                
                <Textarea
                  value={latex}
                  onChange={(e) => setLatex(e.target.value)}
                  className="code-editor flex-1 bg-[hsl(var(--code-bg))] border-[hsl(var(--code-border))] font-mono text-sm resize-none focus-visible:ring-primary"
                  placeholder="Enter your LaTeX code here..."
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleCompile}
                    disabled={isCompiling || !latex.trim()}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isCompiling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF
                      </>
                    )}
                  </Button>

                  {pdfUrl && (
                    <Button
                      onClick={handleDownload}
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <Card className="h-full border-0 rounded-none bg-card">
              <div className="p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-foreground mb-4">PDF Preview</h2>
                {pdfUrl ? (
                  <div className="border border-border rounded-lg overflow-hidden bg-muted flex-1">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg bg-muted flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Compile LaTeX to see preview</p>
                  </div>
                )}
              </div>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="border-destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-primary bg-primary/10">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              PDF compiled successfully! Click Download to get your file.
            </AlertDescription>
          </Alert>
        )}

        {/* API Documentation - Collapsible */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Dev Options
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">API Integration</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Endpoint</h3>
              <code className="block bg-[hsl(var(--code-bg))] p-3 rounded border border-[hsl(var(--code-border))] text-primary">
                POST /api/convert
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Authentication</h3>
              <code className="block bg-[hsl(var(--code-bg))] p-3 rounded border border-[hsl(var(--code-border))] text-muted-foreground">
                x-api-key: YOUR_API_KEY
              </code>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">cURL Example</h3>
              <pre className="bg-[hsl(var(--code-bg))] p-3 rounded border border-[hsl(var(--code-border))] overflow-x-auto text-xs text-muted-foreground">
{`curl -X POST https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"latex": "\\\\documentclass{article}\\\\begin{document}Hello\\\\end{document}"}'`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">JavaScript Example</h3>
              <pre className="bg-[hsl(var(--code-bg))] p-3 rounded border border-[hsl(var(--code-border))] overflow-x-auto text-xs text-muted-foreground">
{`const response = await fetch(
  'https://mynsuwuznnjqwhaurcmk.supabase.co/functions/v1/latex-convert',
  {
    method: 'POST',
    headers: {
      'x-api-key': 'YOUR_API_KEY',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      latex: '\\\\documentclass{article}\\\\begin{document}Hello\\\\end{document}'
    }),
  }
);
const data = await response.json();`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Binary PDF Support</h3>
              <p className="text-muted-foreground">
                External apps can use <code className="bg-[hsl(var(--code-bg))] p-1 rounded border border-[hsl(var(--code-border))] text-primary">?format=binary</code> or set <code className="bg-[hsl(var(--code-bg))] p-1 rounded border border-[hsl(var(--code-border))] text-primary">Accept: application/pdf</code> to receive the PDF directly.
              </p>
            </div>
          </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default Index;
