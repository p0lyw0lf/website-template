import {
  get_url,
  markdown_to_html,
  minify_html,
  read_file,
  store,
} from "driver";
import { Image } from "../components/Image.js";
import { html } from "../render.js";
import { replaceMatches } from "../util.js";

/**
 * Given a store argument in ARG, format the markdown as HTML, applying any special transformations
 * that we need to have happen.
 *
 * Specifically, transform all remote images matching a regex to be local, minified ones.
 *
 * ARG: StoreObject
 */

const VAULT_ROOT = "src/pages/";
const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".mov", ".webm"];

const IMAGE_REGEX =
  /!\[(?<alt>[^\]]*)\]\(((<(?<quotedFilename>.*)>)|(?<filename>[^<>]*?))\s*(\"(?<title>.*)\")?\)/gm;
const REMOTE_REGEX = /^https?:\/\//;
const ALLOWED_REMOTE_REGEX = /^https:\/\/static\.wolfgirl\.dev\//;

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

  // Resolve the filename relative to the vault root.
  // TODO: provide a way to configure the "vault root" and "site url" in a more centralized location
  return { type: "localImage", url: VAULT_ROOT + filename };
};

const input = ARG.toString();
const output = await replaceMatches(IMAGE_REGEX, input, async (match) => {
  let src = await fetchSource(match);
  switch (src?.type) {
    case "video":
      return html`<video src="${src.url}" controls />`;
    case "remoteImage":
      src = await get_url(src.url);
      break;
    case "localImage":
      src = await read_file(src.url);
      break;
    default:
      return match[0];
  }

  const alt = match.groups.alt || undefined;
  const title = match.groups.title || undefined;
  return await Image({ src, alt, title });
});

export default await minify_html(await markdown_to_html(store(output)));
