const js = require('@eslint/js');
const globals = require('globals');

const vitestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  vi: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
};

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      eqeqeq: ['warn', 'always'],
      curly: ['warn', 'multi-line'],
    },
  },
  {
    files: ['tests/**/*.test.js'],
    languageOptions: {
      globals: vitestGlobals,
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['public/js/**/*.js'],
    rules: {
      'no-var': 'off',
      'prefer-const': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'public/css/tailwind.css', 'public/uploads/', '*.md', '*.txt'],
  },
];
