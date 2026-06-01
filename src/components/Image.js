import { run_js } from "driver";

/**
 * @typedef {object} Format
 * @property {import("driver").ImageFormat} format
 * @property {import("driver").ResizeOptions | undefined} resize_method
 * @property {import("driver").EncoderOptions | undefined} encoder_options
 *
 * @typedef {options} Frontmatter
 * @property {Format=} defaultOpts
 * @property {Array<Format>=} otherOpts
 *
 * @typedef {object} Props
 * @property {import("driver").StoreObject} src - Original src of the image to load
 * @property {string=} filename - Original filename of the image to load
 * @property {string} alt - Alt text, also shown on click into the image.
 * @property {string} title - Text that shows on hover/long-press.
 * @property {Frontmatter=} frontmatter - Options for how to transform the image
 */

/**
 * @property {Props} props
 * @returns {Promise<import("driver").StoreObject>}
 */
export const Image = async ({ src, filename, alt, title, frontmatter }) => {
  const img = await run_js("src/runtime/image.js", {
    src,
    filename,
    alt,
    title,
    defaultOpts: frontmatter?.default ?? {
      format: "jpeg",
      encoder_options: { quality: 92 },
    },
    otherOpts: frontmatter?.sources ?? [
      { format: "jxl", encoder_options: { quality: 95, effort: 6 } },
    ],
  });

  // If you want to add any wrappers around the image, here is the place to do it.
  return img;
};
