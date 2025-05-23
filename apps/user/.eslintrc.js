/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  rules: {
    'no-unused-vars': ['error', { 
      'args': 'none',  // This will ignore parameters
      'varsIgnorePattern': '^_'
    }]
  },
};
