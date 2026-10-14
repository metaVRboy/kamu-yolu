const { chromium } = require("../../node_modules/playwright");
const { pathToFileURL } = require("url");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(__dirname + "/tasarim.html").href);
  await p.waitForTimeout(800);
  for (const id of process.argv.slice(2).length ? process.argv.slice(2) : ["b1", "b2"]) await p.locator("#" + id).screenshot({ path: __dirname + "/" + id + ".png" });
  await b.close();
})();
