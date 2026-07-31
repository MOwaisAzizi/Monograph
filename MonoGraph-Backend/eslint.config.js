import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module", // change to 'commonjs' if backend uses require/module.exports
      globals: {
        ...globals.node,
      },
    },
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: "warn",
      "prefer-const": "warn",
    },
  },
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
];
