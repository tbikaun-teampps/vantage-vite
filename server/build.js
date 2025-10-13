import esbuild from "esbuild";
import { readdir } from "fs/promises";
import { join } from "path";

async function getEntryPoints(dir) {
  const entries = [];
  const files = await readdir(dir, { withFileTypes: true, recursive: true });

  for (const file of files) {
    if (
      file.isFile() &&
      file.name.endsWith(".ts") &&
      !file.name.endsWith(".d.ts")
    ) {
      entries.push(join(file.path, file.name));
    }
  }

  return entries;
}

const entryPoints = await getEntryPoints("./src");

await esbuild.build({
  entryPoints: ["./src/index.ts"], // Single entry point
  bundle: true, // Bundle your app code
  outfile: "./dist/index.js", // Single output file
  format: "esm",
  platform: "node",
  target: "node20",
  packages: "external", // Keep node_modules external
  sourcemap: true,
  // Optional: minify for production
  // minify: true,
});

console.log("Build complete!");
