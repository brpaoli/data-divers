import { build } from "esbuild";
import { writeFile, readdir, copyFile } from "node:fs/promises";

// Gera o JavaScript do React
await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outfile: "dist/app.js",
  format: "iife",
  platform: "browser",
  target: "chrome79",
  minify: true,
  jsx: "automatic",
});

// Localiza e copia o CSS gerado pelo Vite
const assets = await readdir("./dist/assets");

const cssFile = assets.find((file) => file.endsWith(".css"));

if (!cssFile) {
  throw new Error("Arquivo CSS não encontrado em dist/assets");
}

await copyFile(`./dist/assets/${cssFile}`, "./dist/app.css");

// Gera o HTML final
const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="./app.css" />
    <title>Bruno IPTV</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="./app.js"></script>
  </body>
</html>`;

await writeFile("dist/index.html", html);

console.log("Build para webOS concluído!");
