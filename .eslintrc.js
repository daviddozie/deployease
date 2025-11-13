module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script',
  },
  extends: ['eslint:recommended'],
  rules: {
    // allow console for CLI tooling and tests
    'no-console': 'off',
    // warn about unused vars but allow underscore-prefixed args
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single']
  }
};
