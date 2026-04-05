"use strict";

const fs = require("fs");
const path = require("path");

const KEEP_LOCALES = new Set(["zh-CN.pak", "en-US.pak"]);

module.exports = async function afterPack(context) {
  const localesDir = path.join(context.appOutDir, "locales");
  if (!fs.existsSync(localesDir)) {
    return;
  }

  for (const entry of fs.readdirSync(localesDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    if (KEEP_LOCALES.has(entry.name)) {
      continue;
    }

    fs.rmSync(path.join(localesDir, entry.name), { force: true });
  }
};
