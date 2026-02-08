import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prettier/prettier": "error",
    },
  },
  {
    files: ["**/*.spec.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  { rules: eslintConfigPrettier.rules },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.js", ".eslintrc.js"],
  },
];
