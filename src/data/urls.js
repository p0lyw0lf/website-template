import { slugify } from "driver";
import { splitext } from "../path.js";

/**
 * @param {import("driver").StoreImage} src
 * @param {string=} filename
 * @returns {string}
 */
export const toAssetUrl = (image, filename) => {
  const hash = image.object().hash();
  let slug;
  if (filename) {
    const [base, _ext] = splitext(filename);
    slug = `${slugify(base)}-${hash.slice(-6)}`;
  } else {
    slug = hash.slice(-18);
  }
  return `/_assets/${slug}.${image.format()}`;
};
