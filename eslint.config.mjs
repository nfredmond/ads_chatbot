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
    // Ignore scripts folder
    "scripts/**",
  ]),
  // Custom rules for this project
  {
    rules: {
      // Allow 'any' type in API routes and lib files where external API responses are handled
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars with underscore prefix (common pattern for destructuring)
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      // Disable unescaped entities rule - too noisy for documentation strings
      "react/no-unescaped-entities": "off",
      // Allow exhaustive deps warnings but don't error
      "react-hooks/exhaustive-deps": "warn",
      // Allow setState in effects (sometimes needed for conditional loading states)
      "react-hooks/set-state-in-effect": "off",
    }
  }
]);

export default eslintConfig;
