import esbuild from "esbuild";

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
