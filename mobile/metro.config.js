// Uygulama, sitenin (Next.js) klasorunun icinde duruyor: Metro ust klasordeki
// node_modules'a (ör. sitenin React surumu) hic bakmasin, yalniz uygulamanin paketleri.
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const ustModuller = path.resolve(__dirname, "..", "node_modules").replace(/[\/]/g, "[\\/]");
config.resolver.blockList = [new RegExp(`^${ustModuller}[\\/].*`)];

module.exports = config;
