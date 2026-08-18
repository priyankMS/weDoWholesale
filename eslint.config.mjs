import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // CommonJS config consumed directly by the sequelize-cli binary, which
    // requires it via `require()` — not part of the Next.js app bundle.
    "lib/db/config/**",
    "lib/db/migrations/**",
    "lib/db/seeders/**",
  ]),
]);

export default eslintConfig;
