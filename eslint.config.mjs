import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.js"], languageOptions: { sourceType: 'module' } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "req|res|next|val" }],
      "no-undef": "error",
      "spaced-comment": "off",
      "no-console": "warn",
      "consistent-return": "off",
      "func-names": "off",
      "object-shorthand": "off",
      "no-process-exit": "off",
      "no-param-reassign": "off",
      "no-underscore-dangle": "off",
      "class-methods-use-this": "off",
      "prefer-destructuring": ["warn", { object: true, array: false }],
    },
  },
];
