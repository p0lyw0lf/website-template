import {
  get_url,
  markdown_to_html,
  minify_html,
  read_file,
  store,
} from "driver";
import { Image } from "../components/Image.js";
import { replaceMatches } from "../util.js";

/**
 * Given a store argument in ARG, format the markdown as HTML, applying any special transformations
 * that we need to have happen.
 *
 * Specifically, transform all remote images matching a regex to be local, minified ones.
 *
 * ARG: { body: StoreObject, filename: string | undefined };
 * If specified as a string, resolve local image references relative to the markdown stored at that path.
 */

const input = ARG.body.toString();
let dir;
if (typeof ARG.filename === "string") {
  const dirIndex = ARG.filename.lastIndexOf("/");
  dir = ARG.filename.slice(0, dirIndex + 1);
}

const IMAGE_REGEX =
  /!\[(?<alt>[^\]]*)\]\(((<(?<quotedFilename>.*)>)|(?<filename>[^<>]*?))\s*(\"(?<title>.*)\")?\)/gm;
const ALLOWED_LOCAL_REGEX = /^\.(\.)?\//;
const ALLOWED_REMOTE_REGEX = /^https:\/\/static\.wolfgirl\.dev\//;

/**
 * @param {RegExpMatchArray} match
 * @returns {Promise<import("driver").StoreObject | undefined>} - If we want to transform this source, the StoreObject to transform.
 */
const fetchSource = async (match) => {
  const filename = match.groups.quotedFilename || match.groups.filename || "";
  if (!filename) return undefined;
  if (dir && ALLOWED_LOCAL_REGEX.test(filename)) {
    // Resolve the filename relative to the current file being transformed.
    return await read_file(dir + filename);
  }
  if (ALLOWED_REMOTE_REGEX.test(filename)) {
    let url = filename;
    if (match.groups.quotedFilename) {
      url = encodeURI(url);
    }
    return await get_url(url);
  }
  return undefined;
};

const output = await replaceMatches(IMAGE_REGEX, input, async (match) => {
  const src = await fetchSource(match);
  if (!src) return match[0];

  const alt = match.groups.alt || undefined;
  const title = match.groups.title || undefined;
  return await Image({ src, alt, title });
});

export default await minify_html(await markdown_to_html(store(output)));
