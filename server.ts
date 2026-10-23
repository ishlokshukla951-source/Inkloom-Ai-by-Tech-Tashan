import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'inkloom-ai-governance-engine',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Semantic AI Review Endpoint
app.post('/api/v1/reviews/analyse', async (req: Request, res: Response) => {
  try {
    const { documentId, title, contentType, channel, text, brandVoice } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text content is required for review analysis.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Deterministic fallback response when API key is not yet configured
      res.json({
        documentId,
        semanticIssues: [],
        status: 'deterministic_fallback',
        message: 'Gemini API key not configured. Deterministic rule engine active.',
      });
      return;
    }

    const ai = new GoogleGenAI();
    const systemInstruction = `You are the lead Brand Governance Auditor for an enterprise organization.
Analyze the submitted content strictly against professional brand governance criteria:
1. Tone and Voice: Ensure it aligns with "${brandVoice || 'Authoritative, grounded, precision-engineered, trustworthy, non-sensationalist'}". Flag buzzwords, puffery, aggressive sales talk, or hyperbolic promises.
2. Unsubstantiated Claims: Flag claims that promise impossible results, absolute metrics without citation, or guarantees.
3. Terminology & Brand Perception: Flag degrading or informal phrasing that devalues the enterprise brand.
4. Explanations & Suggestions: For each issue, provide exact verbatim evidence from the text, explain WHY it conflicts with brand standards, reference the relevant guideline, and offer a concrete, professionally phrased replacement.

Return a JSON array of detected issues. Do not hallucinate issues if the text is genuinely compliant.`;

    const prompt = `Review the following content:
Title: "${title || 'Untitled'}"
Format: ${contentType || 'Standard Article'}
Channel: ${channel || 'General Audience'}

Content:
"""
${text}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'One of: tone, terminology, claim, disclaimer, accessibility',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'One of: critical, high, medium, low, informational',
                  },
                  evidence: {
                    type: Type.STRING,
                    description: 'Exact verbatim excerpt from the text',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Clear, objective rationale for why this conflicts with the brand',
                  },
                  guidelineReference: {
                    type: Type.STRING,
                    description: 'Name of the applicable governance guideline',
                  },
                  suggestion: {
                    type: Type.STRING,
                    description: 'Proposed alternative phrasing preserving creator intention',
                  },
                },
                required: ['category', 'severity', 'evidence', 'explanation', 'guidelineReference', 'suggestion'],
              },
            },
          },
          required: ['summary', 'issues'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"summary":"","issues":[]}');
    const semanticIssues = (parsed.issues || []).map((issue: any, index: number) => ({
      id: `ai-sem-${Date.now()}-${index}`,
      category: ['tone', 'terminology', 'claim', 'disclaimer', 'accessibility'].includes(issue.category)
        ? issue.category
        : 'tone',
      severity: ['critical', 'high', 'medium', 'low', 'informational'].includes(issue.severity)
        ? issue.severity
        : 'medium',
      source: 'ai_semantic',
      evidence: issue.evidence,
      explanation: issue.explanation,
      guidelineReference: issue.guidelineReference,
      suggestion: issue.suggestion,
      confidence: 0.92,
      requiresHumanReview: true,
      status: 'open',
    }));

    res.json({
      documentId,
      summary: parsed.summary,
      semanticIssues,
      status: 'completed',
    });
  } catch (error: any) {
    console.error('Error in semantic AI analysis:', error);
    res.json({
      documentId: req.body?.documentId,
      semanticIssues: [],
      status: 'fallback_error',
      message: error?.message || 'Semantic analysis service encountered a temporary error.',
    });
  }
});

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/v1/chat', async (req: Request, res: Response) => {
  try {
    const { messages, systemInstruction, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    // Model selection based on user requirements:
    // gemini-4-argon for complex tasks, gemini-3.8-flash for general tasks, gemini-3.1-flash-lite for fast tasks
    const selectedModel =
      model === 'complex'
        ? 'gemini-4-argon'
        : model === 'fast'
        ? 'gemini-3.1-flash-lite'
        : 'gemini-3.8-flash';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const lastUserMsg = messages[messages.length - 1]?.text || '';
      const reply = `[Inkloom Governance Advisor · ${selectedModel}]
I have reviewed your query: "${lastUserMsg.slice(0, 100)}...".

• **Tone & Alignment**: Ensure statements avoid hyperbolic guarantees ("100% guarantee", "zero risk") and adhere to our authoritative brand voice.
• **Factual Assurance**: Cross-check any customer metrics against our verified organizational facts register (e.g. 1,400+ enterprise clients, 99.95% SLA).
• **Recommended Action**: Use preferred terminology ("collaborators" over "users") and include mandatory performance disclaimers on financial or ROI claims.`;

      res.json({
        reply,
        modelUsed: selectedModel,
        status: 'deterministic_fallback',
      });
      return;
    }

    const ai = new GoogleGenAI();
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are Inkloom AI Brand Governance Advisor. You advise authors and editors on brand voice, regulatory risk, mandatory disclaimers, and terminology consistency.',
      },
    });

    res.json({
      reply: response.text || 'No response generated.',
      modelUsed: selectedModel,
      status: 'completed',
    });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.json({
      reply: `[Inkloom Governance Advisor]: Content must conform to approved corporate tone and verified facts. Please check the Brand Guidelines registry for approved phrasing.`,
      status: 'fallback_error',
      error: err?.message,
    });
  }
});

// Create & Edit Images using gemini-nano-banana-2.1
app.post('/api/v1/images/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, mode, inputImageBase64, aspectRatio, imageSize } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const targetModel = 'gemini-nano-banana-2.1';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.json({
        imageUrl: null,
        modelUsed: targetModel,
        status: 'fallback_mode',
        message: 'Gemini API key not configured. Using client-side brand asset synth.',
      });
      return;
    }

    const ai = new GoogleGenAI();
    const parts: any[] = [];

    if (mode === 'edit' && inputImageBase64) {
      const cleanBase64 = inputImageBase64.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/png',
        },
      });
      parts.push({ text: `Modify this brand visual asset according to the following instruction: ${prompt}` });
    } else {
      parts.push({ text: `High-fidelity professional corporate brand visual asset: ${prompt}` });
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '1:1',
          imageSize: imageSize || '1K',
        },
      },
    });

    let generatedImageUrl: string | null = null;
    let textResponse = '';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    res.json({
      imageUrl: generatedImageUrl,
      textResponse,
      modelUsed: targetModel,
      status: 'completed',
    });
  } catch (err: any) {
    console.error('Image Generation API Error:', err);
    res.json({
      imageUrl: null,
      status: 'error',
      message: err?.message || 'Image generation failed.',
    });
  }
});

async function startServer() {
  // Public static asset serving in both development and production
  app.use('/images', express.static(path.resolve(__dirname, 'public/images')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Backward-compatible fallback for legacy /src/assets/images paths in production
    app.use('/src/assets/images', express.static(path.resolve(__dirname, 'public/images')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Inkloom AI] Full-stack application running on port ${PORT}`);
  });
}

startServer();
