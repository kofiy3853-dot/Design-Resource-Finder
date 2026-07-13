const pool = require('../config/database');

const lessons = [
  {
    title: 'Typography Fundamentals',
    slug: 'typography-fundamentals',
    category: 'Typography',
    content:
      'Typography is the art of arranging type to make written language legible, readable, and visually appealing. This lesson covers font selection, pairing, hierarchy, spacing, and alignment. Key concepts include: serif vs sans-serif, leading, tracking, kerning, and how to create effective visual hierarchy through type. Good typography establishes a clear information hierarchy and sets the tone for any design.',
    order_index: 1,
  },
  {
    title: 'Color Theory for Designers',
    slug: 'color-theory',
    category: 'Color',
    content:
      'Color theory explains how colors interact and how to combine them harmoniously. This lesson covers the color wheel, primary/secondary/tertiary colors, complementary and analogous schemes, warm vs cool colors, and the psychology of color. Learn how to build accessible palettes with sufficient contrast and how to use color to evoke emotion and guide user attention.',
    order_index: 2,
  },
  {
    title: 'Composition & Layout',
    slug: 'composition-layout',
    category: 'Layout',
    content:
      "Composition is the arrangement of visual elements within a design. This lesson covers the rule of thirds, golden ratio, grid systems, visual hierarchy, balance (symmetrical vs asymmetrical), white space, and the Z-pattern vs F-pattern reading flows. Good composition guides the viewer's eye and creates a sense of order and harmony.",
    order_index: 3,
  },
  {
    title: 'White Space in Design',
    slug: 'white-space',
    category: 'Layout',
    content:
      'White space (or negative space) is the empty area between design elements. Far from being wasted space, it is a crucial design tool that improves readability, creates visual breathing room, emphasizes key content, and conveys a premium feel. This lesson covers macro vs micro white space, active vs passive space, and how to use spacing deliberately.',
    order_index: 4,
  },
  {
    title: 'Branding Fundamentals',
    slug: 'branding-fundamentals',
    category: 'Branding',
    content:
      'Branding is the process of creating a distinct identity for a product or company. This lesson covers logo design principles, brand color palettes, typography systems, brand guidelines, and maintaining consistency across media. A strong brand identity builds recognition, trust, and emotional connection with audiences.',
    order_index: 5,
  },
  {
    title: 'Flyer & Poster Design',
    slug: 'flyer-poster-design',
    category: 'Print',
    content:
      'Flyer and poster design requires balancing information hierarchy with visual impact. This lesson covers headline placement, call-to-action positioning, effective use of imagery, readability at distance, and print production considerations like bleed, margins, and color modes (CMYK vs RGB).',
    order_index: 6,
  },
  {
    title: 'Social Media Design',
    slug: 'social-media-design',
    category: 'Digital',
    content:
      'Social media design requires creating thumb-stopping visuals optimized for each platform. This lesson covers optimal image sizes for Instagram, LinkedIn, Twitter, Facebook, and TikTok; text legibility on small screens; brand consistency across posts; and design techniques that drive engagement.',
    order_index: 7,
  },
  {
    title: 'Accessibility in Design',
    slug: 'accessibility-tips',
    category: 'Accessibility',
    content:
      'Accessible design ensures that content can be used by people of all abilities. This lesson covers WCAG guidelines, color contrast ratios (AA/AAA), text sizing, focus indicators, alt text best practices, and semantic HTML. Accessible design is good design—it improves usability for everyone.',
    order_index: 8,
  },
  {
    title: 'Understanding Visual Hierarchy',
    slug: 'visual-hierarchy',
    category: 'Layout',
    content:
      'Visual hierarchy is the principle of arranging elements to show their order of importance. This lesson covers size, color, contrast, alignment, repetition, proximity, and spacing as tools for creating hierarchy. Master these to guide users through your design in the order you intend.',
    order_index: 9,
  },
  {
    title: 'Design Style Guide',
    slug: 'design-style-guide',
    category: 'Branding',
    content:
      'A design style guide documents the visual standards for a brand or product. This lesson covers what to include: logo usage, color palette with hex codes, typography specifications, iconography styles, component patterns, and tone of voice. A thorough style guide ensures consistency across all touchpoints.',
    order_index: 10,
  },
];

async function seed() {
  try {
    for (const lesson of lessons) {
      await pool.query(
        `INSERT INTO learning_lessons (title, slug, category, content, order_index)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)`,
        [lesson.title, lesson.slug, lesson.category, lesson.content, lesson.order_index]
      );
    }
    console.log(`${lessons.length} lessons seeded successfully.`);
  } catch (err) {
    console.error('Seed error:', err.message);
    console.log('Database not available - learning content will use fallback display.');
  } finally {
    process.exit(0);
  }
}

seed();
