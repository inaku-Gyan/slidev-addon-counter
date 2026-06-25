import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  plugins: ["typescript", "vue"],
  ignorePatterns: ["node_modules", "dist", ".slidev", "coverage"],
});
