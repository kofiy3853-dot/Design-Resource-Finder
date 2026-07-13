const config = require('../config');
const fs = require('fs');

exports.analyzeDesign = async (imagePath) => {
  console.log('[AI] Starting design analysis for:', imagePath);
  console.log('[AI] OpenRouter key configured:', !!config.openrouter.apiKey);
  console.log('[AI] OpenAI key configured:', !!config.openai.apiKey);

  // Try OpenRouter first if available
  if (config.openrouter.apiKey) {
    try {
      console.log('[AI] Attempting OpenRouter analysis...');
      const result = await analyzeWithOpenRouter(imagePath);
      if (result) {
        console.log('[AI] OpenRouter analysis succeeded');
        console.log('[AI] Fonts found:', result.fonts?.length || 0);
        console.log('[AI] Objects found:', result.objects?.length || 0);
        console.log('[AI] Shapes found:', result.shapes?.length || 0);
        return result;
      }
      console.log('[AI] OpenRouter returned null, trying OpenAI...');
    } catch (err) {
      console.log('[AI] OpenRouter failed:', err.message);
      console.log('[AI] OpenRouter error stack:', err.stack);
    }
  }

  // Try OpenAI if available
  if (config.openai.apiKey) {
    try {
      console.log('[AI] Attempting OpenAI analysis...');
      const result = await analyzeWithOpenAI(imagePath);
      if (result) {
        console.log('[AI] OpenAI analysis succeeded');
        return result;
      }
      console.log('[AI] OpenAI returned null');
    } catch (err) {
      console.log('[AI] OpenAI failed:', err.message);
      console.log('[AI] OpenAI error stack:', err.stack);
    }
  }

  console.log('[AI] All providers failed - returning null (no fake fallback)');
  console.log('[AI] To fix: ensure OPENROUTER_API_KEY or OPENAI_API_KEY is set in .env');
  return null;
};

// ===== Helpers =====

function validateAndParseJSON(content) {
  try {
    // Strip markdown code blocks if present
    const cleaned = content
      .replace(/^```json\s*/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    const result = JSON.parse(cleaned);

    // Validate required fields exist
    const required = ['fonts', 'typography', 'layout', 'design_style', 'confidence_score'];
    for (const field of required) {
      if (!(field in result)) {
        console.error(`[AI] Missing required field: ${field}`);
        return null;
      }
    }

    // Clamp confidence score
    if (typeof result.confidence_score === 'number') {
      result.confidence_score = Math.max(0, Math.min(100, result.confidence_score));
    }

    return result;
  } catch (err) {
    console.error('[AI] JSON parse/validation error:', err.message);
    return null;
  }
}

async function fetchWithRetry(url, options, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || response.statusText);
      }
      return response;
    } catch (err) {
      if (i === retries) throw err;
      console.log(`[AI] Retry ${i + 1}/${retries} after ${delay}ms:`, err.message);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

async function analyzeWithOpenRouter(imagePath) {
  try {
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    const mimeType = imagePath.endsWith('.png')
      ? 'image/png'
      : imagePath.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

    console.log(`[OpenRouter] Analyzing with openai/gpt-4o-2024-11-20`);
    console.log(`[OpenRouter] Image size: ${base64Image.length} bytes (base64)`);
    console.log(`[OpenRouter] MIME type: ${mimeType}`);

    const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.siteUrl || 'http://localhost:3000',
        'X-Title': 'Design Resource Finder',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-2024-11-20',
        messages: [
          {
            role: 'system',
            content: `You are an expert graphic design analyst. Analyze the uploaded design image and return ONLY a valid JSON object with no markdown formatting or code blocks. Use these exact fields:
{
  "fonts": [{"name": "string", "family": "string", "category": "string", "weight": "string", "size": "string", "similar": ["string"], "confidence": 85}],
  "typography": {"hierarchy": "string", "alignment": "string", "letter_spacing": "string", "line_height": "string", "font_pairing": "string", "readability": "string", "visual_balance": "string"},
  "layout": {"grid_structure": "string", "margins": "string", "padding": "string", "white_space": "string", "visual_hierarchy": "string", "reading_flow": "string", "balance": "string", "symmetry": "string"},
  "background": {"type": "string", "colors": ["string"], "effects": ["string"], "style": "string"},
  "shapes": ["string"],
  "objects": ["string"],
  "design_style": {"Minimal": 50, "Corporate": 50, "Luxury": 50, "Modern": 50, "Creative": 50, "Editorial": 50, "Tech": 50, "Vintage": 50},
  "accessibility": {"contrast_ratio": "string", "readability": "string", "font_sizes": "string", "recommendations": ["string"], "wcag_considerations": ["string"]},
  "ai_explanation": "string",
  "resource_recommendations": {"fonts": ["string"], "colors": ["string"], "icons": ["string"], "stock_photos": ["string"], "illustrations": ["string"], "patterns": ["string"]},
  "prompts": {"dalle": "string", "midjourney": "string", "stable_diffusion": "string", "adobe_firefly": "string"},
  "recreation_guides": {"canva": "string", "figma": "string", "photoshop": "string", "illustrator": "string"},
  "confidence_score": 75
}`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this design in detail. Identify fonts, colors, layout, visual elements, and style.',
              },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    console.log('[OpenRouter] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[OpenRouter] API Error:', errorData.error?.message || response.statusText);
      console.error('[OpenRouter] Full error:', JSON.stringify(errorData));
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[OpenRouter] No content in response');
      console.error('[OpenRouter] Full response:', JSON.stringify(data));
      return null;
    }

    console.log('[OpenRouter] Response content length:', content.length);
    console.log('[OpenRouter] Response preview:', content.substring(0, 200) + '...');

    const result = validateAndParseJSON(content);
    if (!result) {
      console.error('[OpenRouter] Invalid JSON response');
      console.error('[OpenRouter] Raw content:', content);
      return null;
    }

    console.log(
      '[OpenRouter] Successfully received analysis, confidence:',
      result.confidence_score
    );
    return result;
  } catch (err) {
    console.error('[OpenRouter] Analysis error:', err.message);
    console.error('[OpenRouter] Error stack:', err.stack);
    return null;
  }
}

async function analyzeWithOpenAI(imagePath) {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: config.openai.apiKey });

    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    const mimeType = imagePath.endsWith('.png')
      ? 'image/png'
      : imagePath.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

    console.log('[OpenAI] Analyzing with gpt-4o-mini');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert graphic design analyst. Return ONLY valid JSON with no markdown formatting. Analyze the design image with these fields:
{
  "fonts": [{"name": "string", "family": "string", "category": "string", "weight": "string", "size": "string", "similar": ["string"], "confidence": 85}],
  "typography": {"hierarchy": "string", "alignment": "string", "letter_spacing": "string", "line_height": "string", "font_pairing": "string", "readability": "string", "visual_balance": "string"},
  "layout": {"grid_structure": "string", "margins": "string", "padding": "string", "white_space": "string", "visual_hierarchy": "string", "reading_flow": "string", "balance": "string", "symmetry": "string"},
  "background": {"type": "string", "colors": ["string"], "effects": ["string"], "style": "string"},
  "shapes": ["string"],
  "objects": ["string"],
  "design_style": {"Minimal": 50, "Corporate": 50, "Luxury": 50, "Modern": 50, "Creative": 50, "Editorial": 50, "Tech": 50, "Vintage": 50},
  "accessibility": {"contrast_ratio": "string", "readability": "string", "font_sizes": "string", "recommendations": ["string"], "wcag_considerations": ["string"]},
  "ai_explanation": "string",
  "resource_recommendations": {"fonts": ["string"], "colors": ["string"], "icons": ["string"], "stock_photos": ["string"], "illustrations": ["string"], "patterns": ["string"]},
  "prompts": {"dalle": "string", "midjourney": "string", "stable_diffusion": "string", "adobe_firefly": "string"},
  "recreation_guides": {"canva": "string", "figma": "string", "photoshop": "string", "illustrator": "string"},
  "confidence_score": 75
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this design in detail. Identify fonts, colors, layout, visual elements, and style.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: 'high' },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('[OpenAI] No content in response');
      return null;
    }

    const result = validateAndParseJSON(content);
    if (!result) {
      console.error('[OpenAI] Invalid JSON response');
      return null;
    }

    console.log('[OpenAI] Successfully received analysis, confidence:', result.confidence_score);
    return result;
  } catch (err) {
    console.error('[OpenAI] Analysis error:', err.message);
    return null;
  }
}

function generateTestFallbackAnalysis() {
  // Test-only fallback - NOT used in production
  // Kept for development/testing purposes only
  const fontDatabase = [
    {
      name: 'Inter',
      family: 'Sans-serif',
      category: 'Sans-serif',
      weight: '400',
      size: '16px',
      similar: ['SF Pro', 'Roboto', 'Helvetica Neue'],
      confidence: 92,
    },
    {
      name: 'Inter',
      family: 'Sans-serif',
      category: 'Sans-serif',
      weight: '600',
      size: '20px',
      similar: ['SF Pro', 'Roboto'],
      confidence: 88,
    },
    {
      name: 'Roboto',
      family: 'Sans-serif',
      category: 'Sans-serif',
      weight: '400',
      size: '14px',
      similar: ['Inter', 'Open Sans'],
      confidence: 85,
    },
    {
      name: 'Montserrat',
      family: 'Sans-serif',
      category: 'Sans-serif',
      weight: '700',
      size: '32px',
      similar: ['Inter', 'Poppins'],
      confidence: 89,
    },
    {
      name: 'Poppins',
      family: 'Sans-serif',
      category: 'Sans-serif',
      weight: '600',
      size: '24px',
      similar: ['Montserrat', 'Nunito'],
      confidence: 86,
    },
    {
      name: 'JetBrains Mono',
      family: 'Monospace',
      category: 'Monospace',
      weight: '400',
      size: '14px',
      similar: ['Fira Code', 'Source Code Pro'],
      confidence: 89,
    },
  ];

  const shuffled = [...fontDatabase].sort(() => Math.random() - 0.5);
  const fontCount = Math.floor(Math.random() * 3) + 4;
  const selectedFonts = shuffled.slice(0, fontCount);

  return {
    fonts: selectedFonts,
    typography: {
      hierarchy: 'Test hierarchy',
      alignment: 'Test alignment',
      letter_spacing: 'Test',
      line_height: 'Test',
      font_pairing: 'Test',
      readability: 'Test',
      visual_balance: 'Test',
    },
    layout: {
      grid_structure: 'Test',
      margins: 'Test',
      padding: 'Test',
      white_space: 'Test',
      visual_hierarchy: 'Test',
      reading_flow: 'Test',
      balance: 'Test',
      symmetry: 'Test',
    },
    background: { type: 'Test', colors: ['#131313'], effects: [], style: 'Test' },
    shapes: ['Test'],
    objects: ['Test'],
    design_style: {
      Minimal: 85,
      Corporate: 70,
      Luxury: 45,
      Modern: 90,
      Creative: 60,
      Editorial: 40,
      Tech: 75,
      Vintage: 10,
    },
    accessibility: {
      contrast_ratio: '7.5:1',
      readability: 'Test',
      font_sizes: 'Test',
      recommendations: [],
      wcag_considerations: [],
    },
    ai_explanation: 'Test explanation - AI unavailable',
    resource_recommendations: {
      fonts: ['Inter'],
      colors: ['#131313'],
      icons: [],
      stock_photos: [],
      illustrations: [],
      patterns: [],
    },
    prompts: { dalle: 'Test', midjourney: 'Test', stable_diffusion: 'Test', adobe_firefly: 'Test' },
    recreation_guides: { canva: 'Test', figma: 'Test', photoshop: 'Test', illustrator: 'Test' },
    confidence_score: 0,
  };
}

// Export for testing only
exports.generateTestFallbackAnalysis = generateTestFallbackAnalysis;
