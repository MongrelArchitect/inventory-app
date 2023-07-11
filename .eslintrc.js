module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: ['prettier', 'airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
  },
};
