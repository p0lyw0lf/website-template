import { slugifyPath, splitext } from "../src/path.js";

/** A folder that will be built to generate all the pages in the site. */
export const PAGE_ROOT = "./src/pages/";
/** A folder that, whatever is placed inside, will get copied verbatim to the output. */
export const PUBLIC_ROOT = "./public/";
/**
 * MODIFY: The directory inside this project you've linked your Obsidian Vault to,
 * **including a trailing slash**. This is used for looking up images.
 * It can be different from PAGE_ROOT in case PAGE_ROOT contains some non-obsidian files.
 */
export const VAULT_ROOT = PAGE_ROOT;

/** MODIFY: If you use markdown ![]() syntax with these, it will create a `<video>` element instead of an image one. See src/runtime/markdown.js */
export const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".mov", ".webm"];

/** MODIFY: If you would like to transform remote images in addition to local ones, set this to match your website. Otherwise, set it to undefined. */
export const ALLOWED_REMOTE_REGEX = /^https:\/\/static\.wolfgirl\.dev\//;

export const BUILD_EXTS = {
  js: { alwaysHTML: false },
  md: { alwaysHTML: true },
  tera: { alwaysHTML: false },
};

/**
 * @param {string} inputPath - a path that will correspond to a file in the output.
 * @returns {{ outputPath: string; ext: string }} - `ext` MUST correspond with a file in the `./build` directory.
 */
export const inputPathToOutputPath = (inputPath) => {
  let [outputPath, ext] = splitext(
    slugifyPath(inputPath.slice(PAGE_ROOT.length)),
  );

  const builder = BUILD_EXTS[ext];
  if (!builder) {
    throw new Error(`invalid extension on ${inputPath}`);
  }
  const { alwaysHTML } = builder;

  if (alwaysHTML) {
    outputPath += ".html";
  }

  if (
    outputPath.endsWith(".html") &&
    !outputPath.endsWith("/index.html") &&
    outputPath !== "index.html"
  ) {
    // Make all non-index pages their own directory instead of HTML files.
    outputPath = outputPath.slice(0, -".html".length);
    outputPath += "/index.html";
  }

  return { outputPath, ext };
};
