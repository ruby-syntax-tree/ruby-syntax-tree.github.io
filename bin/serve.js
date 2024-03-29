import esbuild from "esbuild";
import url from "url";
import wasmPlugin from "./wasmPlugin.js";

const entryPoint = url.fileURLToPath(new URL("../src/index", import.meta.url));
const outdir = url.fileURLToPath(new URL("../docs", import.meta.url));

const ctx = await esbuild.context({
  bundle: true,
  entryPoints: [entryPoint],
  format: "esm",
  outdir,
  plugins: [wasmPlugin],
  sourcemap: true,
  splitting: true,
  target: "esnext"
});

const { host, port } = await ctx.serve({ servedir: outdir });
console.log(`Listening at ${host}:${port}`);
