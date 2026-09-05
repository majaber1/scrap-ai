import { mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "v2");
mkdirSync(out, { recursive: true });

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["apps/v2/src/main.ts"],
  bundle: true,
  outfile: join(out, "app.js"),
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
});

copyFileSync(join(root, "apps/v2/index.html"), join(out, "index.html"));
copyFileSync(join(root, "apps/v2/src/styles.css"), join(out, "styles.css"));
copyFileSync(join(root, "apps/v2/manifest.webmanifest"), join(out, "manifest.webmanifest"));
console.log("V2 shell built at /v2");
