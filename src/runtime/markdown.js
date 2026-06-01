import {
  file_type,
  get_url,
  markdown_to_html,
  minify_html,
  read_file,
  store,
} from "driver";
import {
  ALLOWED_REMOTE_REGEX,
  VAULT_ROOT,
  VIDEO_EXTENSIONS,
} from "../../build/config.js";
import { Image } from "../components/Image.js";
import { basename, dirname } from "../path.js";
import { html } from "../render.js";
import { replaceMatches } from "../util.js";

/** ARG: StoreObject | Page */
let input;
let inputDir;
let frontmatter;
if ("body" in ARG && "inputPath" in ARG) {
  inputDir = dirname(ARG.inputPath);
  input = ARG.body.toString();
  frontmatter = ARG.frontmatter;
} else {
  input = ARG.toString();
}

/**
 * Given a store argument in ARG, format the markdown as HTML, applying any special transformations
 * that we need to have happen.
 *
 * Specifically, transform all remote images matching a regex to be local, minified ones.
 *
 * ARG: StoreObject
 */

const IMAGE_REGEX =
  /!\[(?<alt>[^\]]*)\]\(((<(?<quotedFilename>.*)>)|(?<filename>[^<>]*?))\s*(\"(?<title>.*)\")?\)/gm;
const REMOTE_REGEX = /^https?:\/\//;

/**
 * @param {RegExpMatchArray} match
 * @returns {Promise<
 *    { type: "remoteImage", url: string } |
 *    { type: "localImage", url: string } |
 *    { type: "video", url: string } |
 *    undefined
 *  >} - If we want to transform this source, the StoreObject to transform.
 */
const fetchSource = async (match) => {
  const filename = match.groups.quotedFilename || match.groups.filename || "";
  if (!filename) {
    return undefined;
  }

  let url = filename;
  if (REMOTE_REGEX.test(filename)) {
    if (match.groups.quotedFilename) {
      url = encodeURI(url);
    }
  }

  if (VIDEO_EXTENSIONS.some((extension) => filename.endsWith(extension))) {
    return { type: "video", url };
  }

  if (ALLOWED_REMOTE_REGEX.test(filename)) {
    return { type: "remoteImage", url };
  }

  // Don't transform other remote images
  if (REMOTE_REGEX.test(filename)) {
    return undefined;
  }

  // Try to resolve the local filename
  url = resolveFile(url);
  if (!url) {
    print("WARNING: could not resolve local markdown file", filename);
    return undefined;
  }

  return { type: "localImage", url };
};

/**
 * Given a markdown image filename, tries to resolve it to a path that can be passed to `read_file`.
 *
 * @param {string} filename
 * @returns {string}
 */
const resolveFile = (filename) => {
  /**
   * There are four total possible scenarios:
   *
   *             | Relative to ARG.filename | Relative to VAULT_ROOT |
   * ------------+--------------------------+------------------------+
   * Not encoded |            A             |            C           |
   * ------------+--------------------------+------------------------+
   * URI-encoded |            B             |            D           |
   * ------------+--------------------------+------------------------+
   *
   * To support the broadest range possible, try all of these files, in the order ABCD.
   */

  let resolved;
  if (inputDir) {
    // A
    resolved = tryResolve(`${inputDir}/${filename}`);
    if (resolved) return resolved;

    // B
    resolved = tryResolve(`${inputDir}/${decodeURIComponent(filename)}`);
    if (resolved) return resolved;
  }

  // C
  resolved = tryResolve(VAULT_ROOT + filename);
  if (resolved) return resolved;

  // D
  resolved = tryResolve(VAULT_ROOT + decodeURIComponent(filename));
  if (resolved) return resolved;

  return undefined;
};

const tryResolve = (path) => {
  try {
    file_type(path);
    return path;
  } catch {
    return undefined;
  }
};

const output = await replaceMatches(IMAGE_REGEX, input, async (match) => {
  let src = await fetchSource(match);
  let filename;
  switch (src?.type) {
    case "video":
      return html`<video src="${src.url}" controls></video>`;
    case "remoteImage":
      filename = basename(src.url);
      src = await get_url(src.url);
      break;
    case "localImage":
      filename = basename(src.url);
      src = await read_file(src.url);
      break;
    default:
      return match[0];
  }

  const alt = match.groups.alt || undefined;
  const title = match.groups.title || undefined;
  return await Image({ src, filename, alt, title, frontmatter });
});

export default await minify_html(await markdown_to_html(store(output)));
