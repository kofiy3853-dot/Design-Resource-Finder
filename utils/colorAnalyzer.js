const sharp = require('sharp');
const path = require('path');

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function colorDistance(c1, c2) {
  const dr = c1[0] - c2[0],
    dg = c1[1] - c2[1],
    db = c1[2] - c2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function quantizeColors(pixels, maxColors = 8) {
  const colorMap = new Map();
  const step = 8;
  for (let i = 0; i < pixels.length; i += 4) {
    let r = Math.round(pixels[i] / step) * step;
    let g = Math.round(pixels[i + 1] / step) * step;
    let b = Math.round(pixels[i + 2] / step) * step;
    const a = pixels[i + 3];

    // Clamp values to 0-255 range
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    if (a < 128) continue;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxColors);

  const merged = [];
  for (const [key, count] of sorted) {
    const [r, g, b] = key.split(',').map(Number);
    let found = false;
    for (const c of merged) {
      if (colorDistance([r, g, b], [c.r, c.g, c.b]) < 40) {
        c.count += count;
        found = true;
        break;
      }
    }
    if (!found) merged.push({ r, g, b, count });
  }

  merged.sort((a, b) => b.count - a.count);

  return merged.map((c) => ({
    hex: rgbToHex(c.r, c.g, c.b),
    rgb: { r: c.r, g: c.g, b: c.b },
    hsl: rgbToHsl(c.r, c.g, c.b),
    count: c.count,
    percentage: 0,
  }));
}

function classifyColors(colors) {
  const result = { primary: [], secondary: [], accent: [], background: [] };
  if (colors.length === 0) return result;

  const total = colors.reduce((s, c) => s + c.count, 0);
  colors.forEach((c) => (c.percentage = Math.round((c.count / total) * 100)));

  const sorted = [...colors].sort((a, b) => b.percentage - a.percentage);

  if (sorted.length > 0) result.background = [sorted[0].hex];
  if (sorted.length > 1) result.primary = [sorted[1].hex];
  if (sorted.length > 2) result.secondary = [sorted[2].hex];
  if (sorted.length > 3) result.accent = sorted.slice(3).map((c) => c.hex);

  return result;
}

function getTailwindEquivalent(hex) {
  const tailwindColors = {
    '#ffb4ab': 'red-200',
    '#93000a': 'red-900',
    '#b3c5ff': 'indigo-200',
    '#0066ff': 'blue-600',
    '#d0bcff': 'purple-200',
    '#571bc1': 'purple-700',
    '#c3c7cd': 'gray-400',
    '#6e7278': 'gray-500',
    '#131313': 'gray-950',
    '#1c1b1b': 'gray-900',
    '#e5e2e1': 'gray-200',
    '#c2c6d8': 'gray-300',
    '#8c90a1': 'gray-400',
    '#3a3939': 'gray-800',
    '#201f1f': 'gray-900',
    '#2a2a2a': 'gray-800',
  };
  return tailwindColors[hex.toLowerCase()] || null;
}

exports.extractColors = async (filePath) => {
  try {
    console.log(`[ColorAnalyzer] Extracting colors from: ${filePath}`);

    const { data, info } = await sharp(filePath)
      .resize(150, 150, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log(`[ColorAnalyzer] Image resized to 150x150, processing pixels...`);

    const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
    const quantized = quantizeColors(pixels);

    console.log(`[ColorAnalyzer] Quantized ${quantized.length} colors`);

    if (quantized.length === 0) {
      console.warn('[ColorAnalyzer] No colors extracted, using fallback palette');
      return {
        colors: [],
        palette: {
          primary: ['#6366f1'],
          secondary: ['#0ea5e9'],
          accent: ['#ffffff'],
          background: ['#0f172a'],
        },
      };
    }

    const classified = classifyColors(quantized);

    console.log(
      `[ColorAnalyzer] Classified colors - Primary: ${classified.primary}, Secondary: ${classified.secondary}`
    );

    return {
      colors: quantized.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        percentage: c.percentage,
        tailwind: getTailwindEquivalent(c.hex),
      })),
      palette: classified,
    };
  } catch (err) {
    console.error('[ColorAnalyzer] Error extracting colors:', err.message);
    console.log('[ColorAnalyzer] Using fallback palette');

    return {
      colors: [],
      palette: {
        primary: ['#6366f1'],
        secondary: ['#0ea5e9'],
        accent: ['#ffffff'],
        background: ['#0f172a'],
      },
    };
  }
};
