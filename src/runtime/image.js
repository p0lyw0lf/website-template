import {
  convert_image,
  minify_html,
  parse_image,
  store,
  write_output,
} from "driver";
import { SITE_URL } from "../../build/config.js";
import { toAssetUrl } from "../data/urls.js";
import { attributes, html } from "../render.js";

/**
 * Given a src (StoreObject), alt, and title text, converts the image to a safe version for inclusion later.
 */

const { src, filename, alt, title, defaultOpts, otherOpts } = ARG;

const image = await parse_image(src);

/**
 * @property {object} opts - The image options to use for the conversion
 * @property {boolean} isSource - Whether this is a `<source>` element or an `<img>` element.
 * @returns {import("driver").StoreObject}
 */
const convert = async (opts, isSource) => {
  const convertedImage = await convert_image(image, opts);
  const src = toAssetUrl(convertedImage, filename);
  write_output(src.slice(1), convertedImage.object());
  return isSource
    ? html`<source
        ${attributes({
          srcset: `${SITE_URL}${src}`,
          type: `image/${convertedImage.format()}`,
        })}
      />`
    : html`<img
        ${attributes({
          src: `${SITE_URL}${src}`,
          alt: alt || undefined,
          title: title || undefined,
        })}
      />`;
};

const [defaultElem, ...otherElems] = await Promise.all([
  convert(defaultOpts, false),
  ...otherOpts?.map((opts) => convert(opts, true)),
]);

let output = defaultElem;
if (otherElems?.length) {
  output = html`<picture>${otherElems}${output}</picture>`;
}
export default await minify_html(store(output.toString()));
