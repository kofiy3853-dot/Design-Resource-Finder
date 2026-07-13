const config = require('../config');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

class BGGeneratorService {
  constructor() {
    this.providers = {
      openai: this.generateWithOpenAI.bind(this),
      replicate: this.generateWithReplicate.bind(this),
      fal: this.generateWithFal.bind(this),
      mock: this.generateMock.bind(this),
    };
    this.activeProvider = config.bgGenerator?.provider || 'mock';
  }

  async generate(params) {
    const provider = this.providers[this.activeProvider];
    if (!provider) {
      throw new Error(`Unknown provider: ${this.activeProvider}`);
    }
    return provider(params);
  }

  async generateWithOpenAI(params) {
    if (!config.openai?.apiKey) throw new Error('OpenAI API key not configured');

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: config.openai.apiKey });

    const prompt = this.buildPrompt(params);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    });

    const base64 = response.data[0].b64_json;
    const buffer = Buffer.from(base64, 'base64');
    const filename = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const filepath = path.join(__dirname, '..', 'public', 'generated', filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);

    return {
      url: `/generated/${filename}`,
      prompt: prompt,
      provider: 'openai',
      metadata: { size: '1024x1024', model: 'dall-e-3' },
    };
  }

  async generateWithReplicate(params) {
    if (!config.replicate?.apiKey) throw new Error('Replicate API key not configured');

    const prompt = this.buildPrompt(params);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${config.replicate.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version:
          'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: prompt,
          negative_prompt: 'low quality, blurry, distorted, ugly, watermark, text',
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }),
    });

    const prediction = await response.json();

    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise((r) => setTimeout(r, 2000));
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: { Authorization: `Token ${config.replicate.apiKey}` },
        }
      );
      result = await pollResponse.json();
    }

    if (result.status !== 'succeeded') {
      throw new Error(`Generation failed: ${result.error}`);
    }

    const imageUrl = result.output[0];
    const filename = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const filepath = path.join(__dirname, '..', 'public', 'generated', filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    const imgResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    return {
      url: `/generated/${filename}`,
      prompt: prompt,
      provider: 'replicate',
      metadata: { size: '1024x1024', model: 'sdxl' },
    };
  }

  async generateWithFal(params) {
    if (!config.fal?.apiKey) throw new Error('Fal.ai API key not configured');

    const prompt = this.buildPrompt(params);

    const response = await fetch('https://fal.run/fal-ai/fast-sdxl', {
      method: 'POST',
      headers: {
        Authorization: `Key ${config.fal.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: 'low quality, blurry, distorted, ugly, watermark, text',
        image_size: 'square_hd',
        num_images: 1,
      }),
    });

    const result = await response.json();

    if (!result.images || !result.images.length) {
      throw new Error('No images generated');
    }

    const imageUrl = result.images[0].url;
    const filename = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;
    const filepath = path.join(__dirname, '..', 'public', 'generated', filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    const imgResponse = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    return {
      url: `/generated/${filename}`,
      prompt: prompt,
      provider: 'fal',
      metadata: { size: '1024x1024', model: 'fast-sdxl' },
    };
  }

  generateMock(params) {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    ];

    const meshes = [
      'radial-gradient(circle at 20% 80%, #667eea 0%, transparent 50%), radial-gradient(circle at 80% 20%, #764ba2 0%, transparent 50%)',
      'radial-gradient(circle at 40% 60%, #f093fb 0%, transparent 40%), radial-gradient(circle at 60% 40%, #f5576c 0%, transparent 40%)',
      'radial-gradient(circle at 30% 70%, #4facfe 0%, transparent 45%), radial-gradient(circle at 70% 30%, #00f2fe 0%, transparent 45%)',
    ];

    const patterns = [
      'linear-gradient(45deg, #667eea 25%, transparent 25%), linear-gradient(-45deg, #764ba2 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #667eea 75%), linear-gradient(-45deg, transparent 75%, #764ba2 75%)',
      'repeating-linear-gradient(45deg, #667eea, #667eea 10px, #764ba2 10px, #764ba2 20px)',
    ];

    let css = gradients[Math.floor(Math.random() * gradients.length)];
    const prompt = this.buildPrompt(params);

    if (params.style === 'mesh' || params.style === 'gradient') {
      css = meshes[Math.floor(Math.random() * meshes.length)];
    } else if (params.style === 'geometric') {
      css = patterns[Math.floor(Math.random() * patterns.length)];
    }

    const filename = `bg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.svg`;
    const filepath = path.join(__dirname, '..', 'public', 'generated', filename);

    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect width="1024" height="1024" style="background:${css}"/>
    </svg>`;

    fs.writeFileSync(filepath, svg);

    return {
      url: `/generated/${filename}`,
      prompt: prompt,
      provider: 'mock',
      css: css,
      metadata: { size: '1024x1024', format: 'svg' },
    };
  }

  buildPrompt(params) {
    const { style, colorTheme, customPrompt } = params;

    const stylePrompts = {
      abstract: 'abstract artistic background, flowing shapes, ethereal atmosphere',
      gradient: 'beautiful smooth gradient background, seamless color transitions',
      mesh: 'mesh gradient background, organic blob shapes, soft color blending',
      geometric: 'geometric pattern background, clean lines, modern minimalist',
      fluid: 'fluid organic shapes, liquid morphing forms, flowing motion',
      noise: 'textured noise background, subtle grain, film grain aesthetic',
      light: 'light effects background, volumetric lighting, lens flares, bokeh',
    };

    const colorPrompts = {
      auto: '',
      warm: 'warm color palette, oranges, reds, yellows, golden tones',
      cool: 'cool color palette, blues, purples, teals, icy tones',
      vibrant: 'vibrant saturated colors, high contrast, bold and energetic',
      monochrome: 'monochromatic color scheme, single hue variations',
      pastel: 'soft pastel colors, muted tones, gentle and calm',
      dark: 'dark mode color scheme, deep tones, high contrast accents',
    };

    let prompt = stylePrompts[style] || stylePrompts.abstract;

    if (colorPrompts[colorTheme]) {
      prompt += ', ' + colorPrompts[colorTheme];
    }

    if (customPrompt) {
      prompt += ', ' + customPrompt;
    }

    prompt += ', high quality, 4k, professional design, no text, no watermark';

    return prompt;
  }
}

const bgGenerator = new BGGeneratorService();

exports.generateBackground = async (req, res) => {
  try {
    const { style, colorTheme, customPrompt } = req.body;

    if (!style) {
      return res.status(400).json({ error: 'Style is required' });
    }

    const result = await bgGenerator.generate({
      style,
      colorTheme: colorTheme || 'auto',
      customPrompt: customPrompt || '',
    });

    // Save to database
    const [insert] = await pool.query(
      `INSERT INTO generated_backgrounds (user_id, style, color_theme, custom_prompt, image_url, prompt_used, provider, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        style,
        colorTheme || 'auto',
        customPrompt || '',
        result.url,
        result.prompt,
        result.provider,
        JSON.stringify(result.metadata),
      ]
    );

    res.json({
      success: true,
      background: {
        id: insert.insertId,
        url: result.url,
        prompt: result.prompt,
        css: result.css,
        provider: result.provider,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('BG Generator error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate background' });
  }
};

exports.getGeneratedBackgrounds = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM generated_backgrounds WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ backgrounds: rows });
  } catch (err) {
    console.error('Get backgrounds error:', err);
    res.status(500).json({ error: 'Failed to fetch backgrounds' });
  }
};

exports.deleteBackground = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM generated_backgrounds WHERE id = ? AND user_id = ?', [
      id,
      req.user.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete background error:', err);
    res.status(500).json({ error: 'Failed to delete background' });
  }
};

exports.saveBackground = async (req, res) => {
  try {
    const { bg_id } = req.body;
    if (!bg_id) {
      return res.status(400).json({ error: 'bg_id is required' });
    }

    // Check if background exists and belongs to user
    const [bg] = await pool.query(
      'SELECT * FROM generated_backgrounds WHERE id = ? AND user_id = ?',
      [bg_id, req.user.id]
    );
    if (!bg.length) {
      return res.status(404).json({ error: 'Background not found' });
    }

    // Check if already saved
    const [existing] = await pool.query(
      'SELECT id FROM saved_backgrounds WHERE user_id = ? AND background_id = ?',
      [req.user.id, bg_id]
    );
    if (existing.length) {
      return res.json({ success: true, message: 'Already saved' });
    }

    await pool.query('INSERT INTO saved_backgrounds (user_id, background_id) VALUES (?, ?)', [
      req.user.id,
      bg_id,
    ]);
    res.json({ success: true, message: 'Saved to favorites' });
  } catch (err) {
    console.error('Save background error:', err);
    res.status(500).json({ error: 'Failed to save background' });
  }
};
