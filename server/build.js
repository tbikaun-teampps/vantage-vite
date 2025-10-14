import esbuild from "esbuild";
import { cpSync } from "fs";

await esbuild.build({
  entryPoints: ["./src/index.ts"], // Single entry point
  bundle: true,
  outfile: "./dist/index.js", // Single output file
  format: "esm",
  platform: "node",
  target: "node20",
  packages: "external", // Keep node_modules external
  sourcemap: true,
  // Optional: minify for production
  // minify: true,
});

// Copy handlebars templates (for emails) directory to dist
cpSync("./src/templates", "./dist/templates", { recursive: true });

console.log("Build complete!");
