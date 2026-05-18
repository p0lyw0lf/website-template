import { slugifyPath } from "../src/path.js";

export const PAGE_ROOT = "./src/pages/";
export const PUBLIC_ROOT = "./public/";

export const BUILD_EXTS = {
  js: { alwaysHTML: false },
  md: { alwaysHTML: true },
  tera: { alwaysHTML: false },
};

/**
 * @param {string} inputPath - a path that will correspond to a file in the output.
 * @returns {{ outputPath: string; ext: string }}
 */
export const inputPathToOutputPath = (inputPath) => {
  let [outputPath, ext] = slugifyPath(inputPath.slice(PAGE_ROOT.length));

  const builder = BUILD_EXTS[ext];
  if (!builder) {
    throw new Exception(`invalid extension on ${inputPath}`);
  }
  const { alwaysHTML } = builder;

  if (alwaysHTML) {
    outputPath += ".html";
  }

  if (outputPath.endsWith(".html") && !outputPath.endsWith("/index.html")) {
    // Make all non-index pages their own directory instead of HTML files.
    outputPath = outputPath.slice(0, -".html".length);
    outputPath += "/index.html";
  }

  return outputPath;
};
