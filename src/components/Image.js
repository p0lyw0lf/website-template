import { run_js } from "driver";

/**
 * @typedef {object} Props
 * @property {import("driver").StoreObject} src - Original src of the image to load
 * @property {string} alt - Alt text, also shown on click into the image.
 * @property {string} title - Text that shows on hover/long-press.
 */

export const Image = async ({ src, alt, title }) => {
  const img = await run_js("src/runtime/image.js", {
    src,
    alt,
    title,
    widths: [384, 768, 1536],
  });

  // If you want to add any wrappers around the image, here is the place to do it.
  return img;
};
