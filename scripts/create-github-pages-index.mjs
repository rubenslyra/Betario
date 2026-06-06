import fs from "node:fs";
import path from "node:path";

const docsDir = path.resolve("docs");
const assetsDir = path.join(docsDir, "assets");

const files = fs.readdirSync(assetsDir);
const jsFile = files.find((file) => /^index-.*\.js$/.test(file));
const cssFile = files.find((file) => /^styles-.*\.css$/.test(file));

if (!jsFile) {
  throw new Error(`No index bundle found in ${assetsDir}`);
}

if (!cssFile) {
  throw new Error(`No stylesheet bundle found in ${assetsDir}`);
}

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b1020" />
    <link rel="icon" href="./favicon.ico" />
    <link rel="stylesheet" href="./assets/${cssFile}" />
    <title>BET-RAY Lab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./assets/${jsFile}"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(docsDir, "index.html"), html);