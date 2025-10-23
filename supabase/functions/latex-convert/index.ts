import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface CompileRequest {
  latex: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for format preference (binary PDF vs JSON response)
    const url = new URL(req.url);
    const format = url.searchParams.get('format');
    const acceptHeader = req.headers.get('accept');
    const returnBinary = format === 'binary' || acceptHeader === 'application/pdf';

    // Check for API key (for external API calls) - if present, validate it
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('LATEX_API_KEY');
    
    // If API key is provided, it must be valid
    if (apiKey && apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid API key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Allow calls from frontend (no API key needed for now)
    // For production, you may want to add JWT validation or require API key

    // Parse request body
    const { latex }: CompileRequest = await req.json();

    if (!latex || typeof latex !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: latex field is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Input validation - prevent excessively large documents
    if (latex.length > 100000) {
      return new Response(
        JSON.stringify({ error: 'LaTeX document too large (max 100KB)' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Compiling LaTeX document...', { length: latex.length });

    // Prefer TeXLive.net API via POST to avoid URL length limits
    const texliveUrl = 'https://texlive.net/cgi-bin/latexcgi';

    const formData = new FormData();
    const latexBlob = new Blob([latex], { type: 'text/plain' });
    formData.append('filecontents[]', latexBlob, 'document.tex');
    formData.append('filename[]', 'document.tex');
    formData.append('engine', 'pdflatex');
    formData.append('return', 'pdf');

    // Call TeXLive API
    const compileResponse = await fetch(texliveUrl, {
      method: 'POST',
      body: formData,
      redirect: 'follow',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!compileResponse.ok) {
      const errorText = await compileResponse.text();
      console.error('LaTeX compilation failed:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'LaTeX compilation failed. Please check your LaTeX syntax.',
          details: errorText.substring(0, 500)
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the PDF as a blob
    const pdfBlob = await compileResponse.blob();
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();

    console.log('LaTeX compilation successful', { 
      size: pdfArrayBuffer.byteLength,
      returnBinary 
    });

    // If binary format requested, return PDF directly
    if (returnBinary) {
      return new Response(
        pdfArrayBuffer,
        { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"'
          }
        }
      );
    }

    // Otherwise, return JSON with base64 data URL
    const pdfBase64 = btoa(
      new Uint8Array(pdfArrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    return new Response(
      JSON.stringify({ 
        success: true,
        pdfUrl: `data:application/pdf;base64,${pdfBase64}`,
        message: 'PDF compiled successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in latex-convert function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
