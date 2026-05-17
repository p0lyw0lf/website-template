import {
  convert_image,
  minify_html,
  parse_image,
  store,
  write_output,
} from "driver";
import { SITE_URL, toAssetUrl } from "../data/urls.js";
import { attributes, html } from "../render.js";

/**
 * Given a src (StoreObject), alt, and title text, converts the image to a safe version for inclusion later.
 */

const { src, alt, title, widths, width, height, loading, format } = ARG;

const image = await parse_image(src);

/**
 * @param {"jxl" | "webp"} format
 * @returns {Promise<string[]>} <source> elements
 */
const resize = async (format) => {
  // TODO: better way of specifying dimensions we want to resize to. For now this is probably fine tho.
  if (!widths?.length) return [];
  const resizedImages = await Promise.all(
    widths
      .filter((width) => width < image.size().width)
      .map(async (width) => {
        const resizedImage = await convert_image(image, {
          format,
          size: { width, height: image.size().height },
          fit: "contain",
        });
        return resizedImage;
      }),
  );

  return resizedImages.map((resizedImage) => {
    const src = toAssetUrl(resizedImage);
    write_output(
      src.slice(1) /* slices off the leading slash */,
      resizedImage.object(),
    );
    const { width } = resizedImage.size();
    return html`<source
      srcset="${SITE_URL}${src}"
      media="(width >= ${width}px)"
      type="image/${format}"
    />`;
  });
};

const desiredWidth = width || image.size().width;
const desiredHeight = height || image.size().height;
const convertedImage = await convert_image(image, {
  format: format || "jpeg",
  size: { width: desiredWidth, height: desiredHeight },
  fit: "contain",
});
const { width: finalWidth, height: finalHeight } = convertedImage.size();

const primarySrc = toAssetUrl(convertedImage);
write_output(primarySrc.slice(1), convertedImage.object());

let output = html`<img
  ${attributes({
    src: `${SITE_URL}${primarySrc}`,
    height: finalHeight,
    width: finalWidth,
    alt: alt || undefined,
    loading: loading || undefined,
    title: title || undefined,
  })}
/>`;
if (widths?.length) {
  const [jxlSources, webpSources] = await Promise.all([
    resize("jxl"),
    resize("webp"),
  ]);

  output = html`<picture>${jxlSources}${webpSources}${output}</picture>`;
}
export default await minify_html(store(output.toString()));
