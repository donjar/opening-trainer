module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["standard", "next", "next/core-web-vitals", "prettier"],
  settings: {
    react: {
      version: "detect",
    },
  },
  globals: {
    process: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "import/order": [
      "error",
      { alphabetize: { order: "asc", caseInsensitive: false } },
    ],
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
  },
};
