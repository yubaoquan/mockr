module.exports = {
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  settings: {
    'import/core-modules': ['koa', 'koa-static', '@ybq/jmockr-ftl-render']
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  rules: {
    'no-console': 0,
    'import/no-dynamic-require': 0,
    'global-require': 0,
    'no-use-before-define': 0,
    'consistent-return': 0,
    'array-callback-return': 0,
    'func-names': 0,
    quotes: ['error', 'single', { 'allowTemplateLiterals': true }],
    'space-before-function-paren': ['error', {
      anonymous: "never",
      named: "never",
      asyncArrow: "always"
    }],
    'no-param-reassign': 0,
    'no-unused-vars': 1,
  },
};
