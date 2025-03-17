// @ts-check
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import prettierlint from "eslint-config-prettier";

export default tseslint.config(
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: "19.0" } },
    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...prettierlint.rules,
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/restrict-plus-operands": "warn",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
    },
  },
);
