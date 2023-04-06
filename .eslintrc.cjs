module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'max-len': [2, { code: 120 }],
    'no-use-before-define': [2, {
      "functions": false,
      "classes": true,
      "variables": true,
      "allowNamedExports": false
    }]

  },
};
