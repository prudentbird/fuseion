import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import convexPlugin from "@convex-dev/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "out/**",
      "dist/**",
      ".next/**",
      "build/**",
      "next-env.d.ts",
      "src/convex/**",
      "node_modules/**",
    ],
  },
  ...convexPlugin.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
