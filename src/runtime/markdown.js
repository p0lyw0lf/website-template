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
  AUDIO_EXTENSIONS,
  inputPathToOutputPath,
  VAULT_ROOT,
  VIDEO_EXTENSIONS,
} from "../../build/config.js";
import { Audio } from "../components/Audio.js";
import { Image } from "../components/Image.js";
import { Video } from "../components/Video.js";
import { basename, dirname } from "../path.js";
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
 *    { type: "image" | "audio" | "video"; isRemote: boolean; url: string } |
 *    undefined
 *  >} - If we want to transform this source, the StoreObject to transform.
 */
const fetchSource = async (match) => {
  const filename = match.groups.quotedFilename || match.groups.filename || "";
  if (!filename) {
    return undefined;
  }

  let url = filename;
  const isRemote = REMOTE_REGEX.test(filename);
  if (isRemote) {
    if (match.groups.quotedFilename) {
      url = encodeURI(url);
    }
  } else {
    // Try to resolve the local filename
    url = resolveFile(url);
    if (!url) {
      print("WARNING: could not resolve local file in markdown", filename);
      return undefined;
    }
  }

  let type;
  if (VIDEO_EXTENSIONS.some((extension) => filename.endsWith(extension))) {
    type = "video";
  } else if (
    AUDIO_EXTENSIONS.some((extension) => filename.endsWith(extension))
  ) {
    type = "audio";
  } else {
    type = "image";
  }

  if (type === "image") {
    if (ALLOWED_REMOTE_REGEX.test(filename)) {
      return { type: "image", isRemote: true, url };
    }
    // Don't transform other remote images
    if (isRemote) {
      return undefined;
    }

    // Local images (!isRemote) are fine to transform.
    return { type: "image", isRemote: false, url };
  }

  // Other sources don't get transformed the same way, just return outright
  return { type, isRemote, url };
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
  if (!src) {
    return match[0];
  }

  let url = src.url;
  if (!src.isRemote) {
    url = "/" + inputPathToOutputPath(url).outputPath;
  }
  const filename = basename(url);

  switch (src.type) {
    case "video":
      return Video({ src: url });
    case "audio":
      return Audio({ src: url });
    case "image":
      if (src.isRemote) {
        src = await get_url(src.url);
      } else {
        src = await read_file(src.url);
      }
      break;
    default:
      return match[0];
  }

  const alt = match.groups.alt || undefined;
  const title = match.groups.title || undefined;
  return await Image({ src, filename, alt, title, frontmatter });
});

export default await minify_html(await markdown_to_html(store(output)));
